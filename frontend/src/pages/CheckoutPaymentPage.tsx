import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi, Order } from '../api/orders';
import { Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { CheckoutStepper } from '../components/checkout/CheckoutStepper';
import {
  CheckoutOrderSummary,
  type CheckoutSummaryItem,
} from '../components/checkout/CheckoutOrderSummary';

export default function CheckoutPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadPayment = async () => {
      if (!orderId) return;

      try {
        const orderRes = await ordersApi.getOrderById(orderId);
        setOrder(orderRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [orderId]);

  const handleCheckoutPro = async () => {
    if (!orderId) return;

    setIsProcessing(true);
    setError('');

    try {
      const response = await ordersApi.createCheckoutPreference(orderId);
      window.location.assign(response.data.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No pudimos abrir Checkout Pro de Mercado Pago.');
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

  if (error && !order) {
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

  if (!order) return null;

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
  const currencyPrefix = 'S/ ';

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

          <div className="mb-6 rounded-lg border border-[#eadfd2] bg-[#fffaf6] px-4 py-4 text-sm text-[#524535]">
            Seras redirigido a Checkout Pro para pagar con tarjeta, Yape u otros medios disponibles en Mercado Pago.
          </div>

          {error && <div className="mb-4 rounded-lg border border-[#f4c7c3] bg-[#fff1f0] px-4 py-3 text-sm text-[#b42318]">{error}</div>}

          {isProcessing && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#c7ded9] bg-[#f1fbf8] px-4 py-3 text-sm text-[#005144]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando pago...
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckoutPro}
            disabled={isProcessing}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-5 text-base font-semibold text-white transition-colors hover:bg-[#704700] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ExternalLink className="h-5 w-5" />}
            Continuar a Mercado Pago
          </button>
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
