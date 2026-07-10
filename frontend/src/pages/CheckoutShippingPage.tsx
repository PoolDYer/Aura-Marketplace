import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, MapPin, Truck } from 'lucide-react';

import api from '../lib/axios';
import { ordersApi } from '../api/orders';
import { useCartStore } from '../store/cartStore';
import { CheckoutStepper } from '../components/checkout/CheckoutStepper';
import {
  CheckoutOrderSummary,
  type CheckoutSummaryItem,
} from '../components/checkout/CheckoutOrderSummary';

const SHIPPING_COST = 15;

export default function CheckoutShippingPage() {
  const { cart, getCartTotal, isLoading: isCartLoading, fetchCart } = useCartStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [hasAttemptedCartLoad, setHasAttemptedCartLoad] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const stateCouponCode = (location.state as { couponCode?: string } | null)?.couponCode;
  const [couponCode, setCouponCode] = useState(stateCouponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/users/me/addresses');
        const activeAddresses = res.data.filter((address: any) => address.activa !== false);
        setAddresses(activeAddresses);
        if (activeAddresses.length > 0) {
          setSelectedAddressId(activeAddresses[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!cart && !isCartLoading) {
      setHasAttemptedCartLoad(true);
      fetchCart()
        .catch((err) => console.error(err))
        .finally(() => setHasAttemptedCartLoad(true));
    }
  }, [cart, fetchCart, isCartLoading]);

  useEffect(() => {
    if (stateCouponCode && !appliedCoupon) {
      handleApplyCoupon(stateCouponCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCouponCode]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code) return;

    setCouponError('');
    try {
      const res = await api.post('/coupons/apply', { codigo: code });
      setAppliedCoupon(res.data.cupon);
      if (!codeToApply) setCouponCode('');
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Cupon invalido');
    }
  };

  const handleContinue = async () => {
    if (!selectedAddressId) {
      setError('Por favor selecciona una direccion de envio');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      const orderRes = await ordersApi.createOrder(selectedAddressId, appliedCoupon?.codigo || undefined);
      navigate(`/checkout/payment/${orderRes.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el pedido');
      setIsProcessing(false);
    }
  };

  if (isCartLoading && !hasAttemptedCartLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#845400]" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8] p-6 text-center">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#211527]">Tu carrito esta vacio</h2>
          {error ? <p className="mb-4 text-sm text-[#b42318]">{error}</p> : null}
          <button onClick={() => navigate('/')} className="rounded-full bg-[#845400] px-6 py-3 text-white">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const discountAmount = appliedCoupon
    ? appliedCoupon.tipo === 'PORCENTAJE'
      ? subtotal * (appliedCoupon.descuento / 100)
      : appliedCoupon.descuento
    : 0;
  const total = Math.max(0, subtotal + SHIPPING_COST - discountAmount);
  const summaryItems: CheckoutSummaryItem[] = cart.items.map((item) => {
    const unitPrice = Number(item.publicacion.precio);

    return {
      id: item.id,
      productId: item.publicacionId,
      name: item.publicacion.nombre,
      description: item.publicacion.descripcion,
      imageUrl: item.publicacion.imagenes?.[0]?.url,
      quantity: item.cantidad,
      unitPrice,
      subtotal: unitPrice * item.cantidad,
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <CheckoutStepper currentStep="shipping" />
        <h1 className="mb-8 font-auth-display text-3xl font-bold text-[#211527]">Envio</h1>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-7">
            <div className="rounded-3xl border border-[#eadfd2] bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-[#211527]">
                <MapPin className="h-5 w-5 text-[#845400]" />
                A donde enviamos tu pedido?
              </h2>

              {addresses.length === 0 ? (
                <div className="rounded-2xl bg-[#FAF6F8] py-8 text-center">
                  <p className="mb-4 text-[#524535]">No tienes direcciones guardadas.</p>
                  <button onClick={() => navigate('/profile')} className="rounded-full border border-[#845400] px-6 py-2 text-[#845400]">
                    Agregar Direccion
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start rounded-2xl border p-5 transition-all ${
                        selectedAddressId === address.id ? 'border-[#845400] bg-[#fffaf6] shadow-md' : 'border-[#eadfd2] hover:border-[#d6c3b0]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(event) => setSelectedAddressId(event.target.value)}
                        className="mr-4 mt-1 h-4 w-4 text-[#845400] focus:ring-[#845400]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[#211527]">{address.referencia || address.calle}</p>
                        <p className="mt-1 text-sm text-[#524535]">
                          {address.calle}
                        </p>
                        <p className="text-sm text-[#524535]">
                          {address.ciudad}, {address.estado} {address.codigoPostal}
                        </p>
                        <p className="text-sm text-[#524535]">{address.pais}</p>
                      </div>
                      <div className="flex items-center text-[#845400]">
                        {selectedAddressId === address.id ? <CheckCircle2 className="h-5 w-5" /> : null}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#eadfd2] bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-[#211527]">
                <Truck className="h-5 w-5 text-[#845400]" />
                Opciones de Envio
              </h2>
              <div className="flex items-center justify-between rounded-2xl border border-[#845400] bg-[#fffaf6] p-5">
                <div>
                  <p className="font-semibold text-[#211527]">Envio Estandar Ajustado</p>
                  <p className="text-sm text-[#524535]">3 a 5 dias habiles</p>
                </div>
                <span className="font-semibold text-[#845400]">$15.00</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <CheckoutOrderSummary
              items={summaryItems}
              subtotal={subtotal}
              shipping={SHIPPING_COST}
              discount={discountAmount}
              total={total}
              couponSlot={
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="Codigo de descuento"
                      className="min-w-0 flex-1 rounded-lg border-[#eadfd2] bg-white px-3 py-2 text-sm outline-none focus:border-[#845400]"
                      disabled={!!appliedCoupon}
                    />
                    {!appliedCoupon ? (
                      <button type="button" onClick={() => handleApplyCoupon()} className="rounded-lg bg-[#e5e1e3] px-4 py-2 text-sm font-semibold text-[#211527]">
                        Aplicar
                      </button>
                    ) : (
                      <button type="button" onClick={() => setAppliedCoupon(null)} className="rounded-lg border border-[#eadfd2] px-4 py-2 text-sm font-semibold text-[#b42318]">
                        Quitar
                      </button>
                    )}
                  </div>
                  {couponError ? <p className="mt-2 text-xs text-[#b42318]">{couponError}</p> : null}
                  {appliedCoupon ? (
                    <p className="mt-2 flex items-center gap-1 text-xs text-[#005144]">
                      <CheckCircle2 className="h-3 w-3" />
                      Cupon {appliedCoupon.codigo} aplicado
                    </p>
                  ) : null}
                </>
              }
              action={{
                label: 'Continuar al Pago',
                loadingLabel: 'Procesando...',
                onClick: handleContinue,
                disabled: !selectedAddressId,
                loading: isProcessing,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
