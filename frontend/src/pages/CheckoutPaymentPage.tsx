import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { ordersApi, Order } from '../api/orders';
import { Loader2, ShieldCheck, CreditCard, Smartphone } from 'lucide-react';
import { CheckoutStepper } from '../components/checkout/CheckoutStepper';
import {
  CheckoutOrderSummary,
  type CheckoutSummaryItem,
} from '../components/checkout/CheckoutOrderSummary';

const embeddedMercadoPagoPublicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY as string | undefined;
let initializedMercadoPagoPublicKey: string | null = null;

const setupMercadoPago = (publicKey: string) => {
  if (initializedMercadoPagoPublicKey === publicKey) return;

  initMercadoPago(publicKey, {
    locale: 'es-PE',
    advancedFraudPrevention: true,
  });
  initializedMercadoPagoPublicKey = publicKey;
};

if (embeddedMercadoPagoPublicKey) {
  setupMercadoPago(embeddedMercadoPagoPublicKey);
}

type BrickInitialization = {
  preferenceId: string;
  amount: number;
  currency: string;
  payer: {
    email: string;
    firstName?: string;
  };
};

type PaymentMode = 'mercadopago' | 'yape';

type YapeTokenResponse = string | {
  id?: string;
};

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: Record<string, unknown>,
    ) => {
      yape: (options: { otp: string; phoneNumber: string }) => {
        create: () => Promise<YapeTokenResponse>;
      };
    };
  }
}

const loadMercadoPagoScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://sdk.mercadopago.com/js/v2"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('No pudimos cargar MercadoPago.js')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No pudimos cargar MercadoPago.js'));
    document.body.appendChild(script);
  });

export default function CheckoutPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [brick, setBrick] = useState<BrickInitialization | null>(null);
  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState(embeddedMercadoPagoPublicKey || '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('mercadopago');
  const [loading, setLoading] = useState(true);
  const [brickReady, setBrickReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [yapePhone, setYapePhone] = useState('');
  const [yapeOtp, setYapeOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadPayment = async () => {
      if (!orderId) return;

      try {
        let publicKey = embeddedMercadoPagoPublicKey;

        if (!publicKey) {
          const configRes = await ordersApi.getPaymentConfig();
          publicKey = configRes.data.mercadoPagoPublicKey;
        }

        if (!publicKey) {
          setError('La llave publica de Mercado Pago no esta configurada.');
          setLoading(false);
          return;
        }

        setupMercadoPago(publicKey);
        setMercadoPagoPublicKey(publicKey);

        const [orderRes, brickRes] = await Promise.all([
          ordersApi.getOrderById(orderId),
          ordersApi.createBrickInitialization(orderId),
        ]);

        setOrder(orderRes.data);
        setBrick(brickRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al inicializar el pago');
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [orderId]);

  const initialization = useMemo(() => {
    if (!brick) return null;

    return {
      amount: brick.amount,
      preferenceId: brick.preferenceId,
      payer: {
        email: brick.payer.email,
        firstName: brick.payer.firstName,
      },
      items: order
        ? {
            totalItemsAmount: Number(order.total),
            itemsList: order.lineas.map((linea) => ({
              units: linea.cantidad,
              value: Number(linea.precioUnitario),
              name: linea.nombreProducto,
            })),
          }
        : undefined,
    };
  }, [brick, order]);

  const customization = useMemo(
    () => ({
      visual: {
        style: {
          theme: 'default',
          customVariables: {
            baseColor: '#845400',
            secondaryColor: '#005144',
            borderRadius: '8px',
            fontSizeMedium: '15px',
          },
        },
        hideRedirectionPanel: false,
        defaultPaymentOption: {
          creditCardForm: true,
        },
      },
      paymentMethods: {
        creditCard: 'all',
        debitCard: 'all',
        prepaidCard: 'all',
        mercadoPago: 'all',
        atm: ['pagoefectivo_atm'],
        maxInstallments: 12,
      },
    }),
    [],
  );

  const resolvePaymentResult = (result: Awaited<ReturnType<typeof ordersApi.processBrickPayment>>['data']) => {
    if (result.status === 'APROBADO') {
      navigate(`/orders/success?payment_id=${result.paymentId}&order_id=${result.orderId}`);
      return true;
    }

    if (result.status === 'PENDIENTE') {
      navigate(`/orders/success?payment_id=${result.paymentId}&order_id=${result.orderId}&status=pending`);
      return true;
    }

    return false;
  };

  const handleSubmit = async ({ formData }: any) => {
    if (!orderId) return Promise.reject();

    setIsProcessing(true);
    setError('');

    try {
      const response = await ordersApi.processBrickPayment(orderId, formData);

      if (resolvePaymentResult(response.data)) {
        return Promise.resolve();
      }

      setError('Mercado Pago rechazo el pago. Revisa los datos o elige otro medio de pago.');
      return Promise.reject();
    } catch (err: any) {
      setError(err.response?.data?.message || 'No pudimos procesar el pago.');
      return Promise.reject();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleYapeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!orderId || !brick) return;

    const phoneNumber = yapePhone.replace(/\D/g, '');
    const otp = yapeOtp.replace(/\D/g, '');

    if (!/^\d{9}$/.test(phoneNumber)) {
      setError('Ingresa un celular Yape valido de 9 digitos.');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Ingresa el codigo de aprobacion Yape de 6 digitos.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await loadMercadoPagoScript();

      if (!window.MercadoPago || !mercadoPagoPublicKey) {
        throw new Error('MercadoPago.js no esta disponible.');
      }

      const mercadoPago = new window.MercadoPago(mercadoPagoPublicKey, {
        locale: 'es-PE',
        advancedFraudPrevention: true,
      });

      const yapeTokenResponse = await mercadoPago.yape({ otp, phoneNumber }).create();
      const token = typeof yapeTokenResponse === 'string' ? yapeTokenResponse : yapeTokenResponse.id;

      if (!token) {
        throw new Error('Mercado Pago no devolvio el token de Yape.');
      }

      const response = await ordersApi.processBrickPayment(orderId, {
        token,
        transaction_amount: brick.amount,
        installments: 1,
        payment_method_id: 'yape',
        payer: {
          email: brick.payer.email,
        },
      });

      if (!resolvePaymentResult(response.data)) {
        setError('Yape rechazo el pago. Revisa el codigo o intenta con otro medio.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'No pudimos procesar el pago con Yape.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#845400]" />
      </div>
    );
  }

  if (error && (!order || !brick)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8] p-6 text-center">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#211527]">Hubo un problema</h2>
          <p className="text-[#b42318] mb-6">{error}</p>
          <button onClick={() => navigate('/cart')} className="rounded-full bg-[#845400] px-6 py-3 text-white">Volver al carrito</button>
        </div>
      </div>
    );
  }

  if (!order || !brick || !initialization) return null;

  const summaryItems: CheckoutSummaryItem[] = order.lineas.map((linea) => {
    const unitPrice = Number(linea.precioUnitario);
    const product = linea.publicacion;

    return {
      id: linea.id,
      productId: linea.publicacionId,
      name: linea.nombreProducto,
      description: product?.descripcion,
      imageUrl: product?.imagenes?.[0]?.url,
      quantity: linea.cantidad,
      unitPrice,
      subtotal: Number(linea.subtotal),
    };
  });
  const currencyPrefix = brick.currency === 'PEN' ? 'S/ ' : `${brick.currency} `;

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <CheckoutStepper currentStep="payment" />
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <section className="rounded-2xl border border-[#eadfd2] bg-white p-4 shadow-sm md:p-6 lg:col-span-7">
          <div className="mb-6">
            <h1 className="font-auth-display text-3xl font-bold text-[#211527]">Pago seguro</h1>
            <p className="mt-2 text-[#524535]">Elige el medio de pago y confirma tu compra.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg border border-[#eadfd2] bg-[#fffaf6] p-1" role="tablist" aria-label="Medios de pago">
            <button
              type="button"
              role="tab"
              aria-selected={paymentMode === 'mercadopago'}
              onClick={() => {
                setPaymentMode('mercadopago');
                setError('');
              }}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                paymentMode === 'mercadopago' ? 'bg-white text-[#845400] shadow-sm' : 'text-[#524535] hover:text-[#211527]'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Mercado Pago
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={paymentMode === 'yape'}
              onClick={() => {
                setPaymentMode('yape');
                setError('');
              }}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                paymentMode === 'yape' ? 'bg-white text-[#845400] shadow-sm' : 'text-[#524535] hover:text-[#211527]'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Yape
            </button>
          </div>

          {paymentMode === 'mercadopago' && !brickReady && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#eadfd2] bg-[#fffaf6] px-4 py-3 text-sm text-[#524535]">
              <Loader2 className="h-4 w-4 animate-spin text-[#845400]" />
              Preparando medios de pago...
            </div>
          )}

          {error && <div className="mb-4 rounded-lg border border-[#f4c7c3] bg-[#fff1f0] px-4 py-3 text-sm text-[#b42318]">{error}</div>}

          {isProcessing && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#c7ded9] bg-[#f1fbf8] px-4 py-3 text-sm text-[#005144]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando pago...
            </div>
          )}

          {paymentMode === 'mercadopago' ? (
            <Payment
              initialization={initialization}
              customization={customization as any}
              onSubmit={handleSubmit}
              onReady={() => setBrickReady(true)}
              onError={(brickError: any) => {
                console.error(brickError);
                setError('Mercado Pago no pudo cargar el formulario de pago.');
              }}
              locale="es-PE"
            />
          ) : (
            <form className="space-y-5" onSubmit={handleYapeSubmit}>
              <div className="flex items-start gap-3 rounded-lg border border-[#c7ded9] bg-[#f1fbf8] px-4 py-3 text-sm text-[#005144]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Abre Yape, genera tu codigo de aprobacion y confirma el pago sin salir de Aura.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#211527]">Celular Yape</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={yapePhone}
                    onChange={(event) => setYapePhone(event.target.value)}
                    maxLength={9}
                    placeholder="999999999"
                    className="h-12 w-full rounded-lg border border-[#d8cfc4] bg-white px-4 text-[#211527] outline-none transition-colors focus:border-[#845400] focus:ring-2 focus:ring-[#845400]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#211527]">Codigo de aprobacion</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={yapeOtp}
                    onChange={(event) => setYapeOtp(event.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="h-12 w-full rounded-lg border border-[#d8cfc4] bg-white px-4 text-[#211527] outline-none transition-colors focus:border-[#845400] focus:ring-2 focus:ring-[#845400]/20"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-5 text-base font-semibold text-white transition-colors hover:bg-[#704700] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Smartphone className="h-5 w-5" />}
                Pagar con Yape
              </button>
            </form>
          )}
        </section>
        <div className="lg:col-span-5">
          <CheckoutOrderSummary
            items={summaryItems}
            subtotal={Number(order.total)}
            shipping={0}
            total={Number(order.total)}
            currency={currencyPrefix}
          />
          <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 text-sm text-[#524535]">
            <ShieldCheck className="h-4 w-4 text-[#005144]" />
            Pago protegido por Mercado Pago
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
