import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { useCartStore } from '../store/cartStore';
import { Loader2, CheckCircle2, XCircle, ArrowRight, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const rawPaymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const paymentId = rawPaymentId && rawPaymentId !== 'null' ? rawPaymentId : null;
  const mercadoPagoStatus = searchParams.get('status') || searchParams.get('collection_status');
  const queryOrderId = searchParams.get('order_id');
  const navigate = useNavigate();
  const { fetchCart } = useCartStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (mercadoPagoStatus === 'pending' && !paymentId) {
        setStatus('pending');
        setOrderId(queryOrderId || null);
        return;
      }

      if (!paymentId) {
        setStatus('error');
        return;
      }

      try {
        const res = await ordersApi.verifyPayment(paymentId, queryOrderId || undefined);

        if (res.data.success) {
          setStatus('success');
          setOrderId(res.data.orderId ?? queryOrderId ?? null);
          fetchCart();
        } else if (res.data.status === 'PENDIENTE') {
          setStatus('pending');
          setOrderId(res.data.orderId ?? queryOrderId ?? null);
        } else {
          setStatus('error');
        }
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };

    verify();
  }, [paymentId, mercadoPagoStatus, queryOrderId, fetchCart]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F8]">
        <Loader2 className="h-12 w-12 animate-spin text-[#845400] mb-4" />
        <p className="text-[#524535]">Verificando tu pago...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F8] p-6 text-center">
        <XCircle className="h-20 w-20 text-[#b42318] mb-6" />
        <h2 className="font-auth-display text-3xl font-bold text-[#211527] mb-3">Error al procesar el pago</h2>
        <p className="text-[#524535] mb-8 max-w-md">No pudimos verificar el pago. Por favor contacta a soporte si el cobro se realizo.</p>
        <button onClick={() => navigate('/profile/orders')} className="rounded-full bg-[#845400] px-8 py-3 text-white font-semibold shadow-lg hover:bg-[#704700] transition-colors">
          Ver mis ordenes
        </button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6F8] p-6 text-center">
        <Loader2 className="h-16 w-16 text-[#845400] mb-6" />
        <h2 className="font-auth-display text-3xl font-bold text-[#211527] mb-3">Pago pendiente</h2>
        <p className="text-[#524535] mb-8 max-w-md">Mercado Pago todavia esta procesando tu pago. Te avisaremos cuando la orden quede confirmada.</p>
        <button onClick={() => navigate(orderId ? `/profile/orders/${orderId}` : '/profile/orders')} className="rounded-full bg-[#845400] px-8 py-3 text-white font-semibold shadow-lg hover:bg-[#704700] transition-colors">
          Ver mi orden
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527] flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[40px] p-10 md:p-16 max-w-2xl w-full text-center shadow-xl border border-[#eadfd2] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,81,68,0.05),_transparent_40%)]" />

          <div className="mx-auto w-24 h-24 bg-[#005144]/10 rounded-full flex items-center justify-center mb-8 relative">
            <CheckCircle2 className="w-12 h-12 text-[#005144]" />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md">
              <Package className="w-5 h-5 text-[#845400]" />
            </div>
          </div>

          <h1 className="font-auth-display text-4xl font-bold text-[#211527] mb-4">Pedido confirmado</h1>
          <p className="text-[#524535] text-lg mb-8 max-w-md mx-auto">
            Gracias por tu compra. Hemos enviado un correo con los detalles y el recibo de tu pedido.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(orderId ? `/profile/orders/${orderId}` : '/profile/orders')}
              className="w-full sm:w-auto rounded-full bg-[#845400] px-8 py-4 text-[15px] text-white font-semibold shadow-[0_10px_20px_rgba(132,84,0,0.18)] hover:bg-[#704700] transition-colors"
            >
              Seguir mi pedido
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#d6c3b0]/50 bg-white px-8 py-4 text-[15px] font-semibold text-[#524535] transition-colors hover:border-[#845400]/30 hover:text-[#845400]"
            >
              Seguir comprando
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
