import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';

import { ordersApi, type Order } from '../api/orders';
import { useCartStore } from '../store/cartStore';

const formatMoney = (value?: string | number | null) => `S/ ${Number(value || 0).toFixed(2)}`;

const getFirstName = (name?: string | null) => {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName || '';
};

const getAddressLine = (order: Order | null) => {
  const address = order?.direccion;
  if (!address) return 'Direccion no disponible';

  const firstLine = [address.calle, address.numero].filter(Boolean).join(' ');
  const secondLine = [address.ciudad, address.estado, address.codigoPostal].filter(Boolean).join(', ');
  return [firstLine, secondLine].filter(Boolean).join(' - ') || 'Direccion no disponible';
};

const getOrderCode = (order: Order | null, orderId: string | null) =>
  order?.numeroConfirmacion || (orderId ? orderId.slice(0, 8).toUpperCase() : 'AURA');

function StatusShell({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  tone = 'neutral',
}: {
  icon: ReactNode;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  tone?: 'neutral' | 'error';
}) {
  return (
    <div className="flex min-h-[calc(100vh-96px)] flex-col bg-[#FAF6F8] text-[#211527]">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-[#eadfd2] bg-white px-6 py-12 text-center shadow-[0_22px_60px_rgba(33,21,39,0.10)] md:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,107,91,0.08),_transparent_42%)]" />
          <div
            className={`relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
              tone === 'error' ? 'bg-[#fff1f0] text-[#b42318]' : 'bg-[#dcebe6] text-[#006b5b]'
            }`}
          >
            {icon}
          </div>
          <h1 className="relative font-auth-display text-3xl font-bold text-[#211527] md:text-4xl">{title}</h1>
          <p className="relative mx-auto mt-4 max-w-md text-base leading-7 text-[#524535]">{message}</p>
          <button
            type="button"
            onClick={onAction}
            className="relative mt-8 rounded-full bg-[#845400] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(132,84,0,0.18)] transition-colors hover:bg-[#704700]"
          >
            {actionLabel}
          </button>
        </section>
      </main>
    </div>
  );
}

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
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrder = useCallback(async (id?: string | null) => {
    if (!id) return;

    try {
      const res = await ordersApi.getOrderById(id);
      setOrder(res.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const verify = async () => {
      if (mercadoPagoStatus === 'pending' && !paymentId) {
        const resolvedOrderId = queryOrderId || null;
        setStatus('pending');
        setOrderId(resolvedOrderId);
        await loadOrder(resolvedOrderId);
        return;
      }

      if (!paymentId) {
        setStatus('error');
        return;
      }

      try {
        const res = await ordersApi.verifyPayment(paymentId, queryOrderId || undefined);
        const resolvedOrderId = res.data.orderId ?? queryOrderId ?? null;
        setOrderId(resolvedOrderId);
        await loadOrder(resolvedOrderId);

        if (res.data.success) {
          setStatus('success');
          fetchCart().catch(() => undefined);
        } else if (res.data.status === 'PENDIENTE') {
          setStatus('pending');
        } else {
          setStatus('error');
        }
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };

    verify();
  }, [paymentId, mercadoPagoStatus, queryOrderId, fetchCart, loadOrder]);

  const firstName = getFirstName(order?.comprador?.nombre);
  const orderCode = getOrderCode(order, orderId);
  const totalItems = useMemo(
    () => order?.lineas?.reduce((sum, line) => sum + line.cantidad, 0) ?? 0,
    [order],
  );
  const addressLine = getAddressLine(order);

  if (status === 'loading') {
    return (
      <StatusShell
        icon={<Loader2 className="h-9 w-9 animate-spin" />}
        title="Verificando tu pago"
        message="Estamos confirmando la respuesta de Mercado Pago para cerrar tu pedido."
        actionLabel="Ver mis ordenes"
        onAction={() => navigate('/profile/orders')}
      />
    );
  }

  if (status === 'error') {
    return (
      <StatusShell
        icon={<XCircle className="h-10 w-10" />}
        title="Error al procesar el pago"
        message="No pudimos verificar el pago. Si el cobro se realizo, revisa tus ordenes o contacta a soporte."
        actionLabel="Ver mis ordenes"
        onAction={() => navigate('/profile/orders')}
        tone="error"
      />
    );
  }

  if (status === 'pending') {
    return (
      <StatusShell
        icon={<Loader2 className="h-9 w-9 animate-spin" />}
        title="Pago pendiente"
        message="Mercado Pago todavia esta procesando tu pago. Te avisaremos cuando la orden quede confirmada."
        actionLabel="Seguir mi pedido"
        onAction={() => navigate(orderId ? `/profile/orders/${orderId}` : '/profile/orders')}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] bg-[#FAF6F8] text-[#211527]">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="mb-8 text-center md:mb-10">
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#dcebe6]">
            <CheckCircle2 className="h-14 w-14 text-[#006b5b]" strokeWidth={2.5} />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-3 text-[#845400] shadow-[0_8px_24px_rgba(33,21,39,0.14)]">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <h1 className="font-auth-display text-4xl font-bold tracking-normal text-[#211527] md:text-5xl">
            {`Gracias por tu compra${firstName ? `, ${firstName}` : ''}!`}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#524535]">
            Hemos confirmado tu pedido y guardamos los detalles para que puedas seguirlo cuando quieras.
          </p>
          <p className="mt-4 font-mono text-sm font-semibold uppercase tracking-normal text-[#845400]">
            Pedido Confirmado: #{orderCode}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <article className="rounded-[28px] border border-[#eadfd2] bg-white p-5 shadow-[0_18px_50px_rgba(33,21,39,0.08)] md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-auth-display text-2xl font-bold text-[#211527]">Tu Seleccion</h2>
                  <p className="mt-1 text-sm text-[#524535]">{totalItems} producto{totalItems === 1 ? '' : 's'} en tu pedido</p>
                </div>
                <span className="rounded-full bg-[#96f0db]/35 px-4 py-2 text-xs font-bold uppercase text-[#006b5b]">
                  Confirmado
                </span>
              </div>

              <div className="divide-y divide-[#eadfd2]">
                {(order?.lineas ?? []).map((line) => {
                  const imageUrl = line.publicacion?.imagenes?.[0]?.url;

                  return (
                    <div key={line.id} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row">
                      <div className="flex gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f1edef]">
                          {imageUrl ? (
                            <img src={imageUrl} alt={line.nombreProducto} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-8 w-8 text-[#847463]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-base font-bold text-[#211527]">{line.nombreProducto}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#524535]">
                            {line.publicacion?.descripcion || 'Producto de Aura Marketplace'}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#845400]">Cantidad: {line.cantidad}</p>
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-[#211527] sm:ml-auto sm:text-right">
                        {formatMoney(line.subtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-[#eadfd2] pt-5 pr-20 sm:flex-row sm:items-center sm:justify-between sm:pr-0">
                <span className="text-sm font-semibold text-[#524535]">Total pagado</span>
                <span className="font-mono text-2xl font-bold text-[#211527]">{formatMoney(order?.total)}</span>
              </div>
            </article>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-[24px] border border-[#eadfd2] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff2d8] text-[#845400]">
                  <Truck className="h-6 w-6" />
                </div>
                <h2 className="font-auth-display text-xl font-bold text-[#211527]">Entrega Estimada</h2>
                <p className="mt-2 text-sm leading-6 text-[#524535]">Tu pedido llegara en 3-5 dias laborables.</p>
              </article>

              <article className="rounded-[24px] border border-[#eadfd2] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dcebe6] text-[#006b5b]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h2 className="font-auth-display text-xl font-bold text-[#211527]">Direccion</h2>
                <p className="mt-2 text-sm leading-6 text-[#524535]">{addressLine}</p>
              </article>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 rounded-[28px] border border-[#eadfd2] bg-white p-6 shadow-[0_18px_50px_rgba(33,21,39,0.08)] md:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#96f0db]/35 text-[#006b5b]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="font-auth-display text-3xl font-bold text-[#211527]">Que sigue ahora?</h2>
              <p className="mt-3 text-sm leading-7 text-[#524535]">
                Puedes revisar el estado de preparacion, confirmar la direccion y volver a comprar desde Aura.
              </p>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate(orderId ? `/profile/orders/${orderId}` : '/profile/orders')}
                  className="flex w-full items-center justify-center rounded-full bg-[#845400] px-6 py-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(132,84,0,0.18)] transition-colors hover:bg-[#704700]"
                >
                  Seguir mi Pedido
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/catalog')}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d6c3b0] bg-white px-6 py-4 text-sm font-bold text-[#524535] transition-colors hover:border-[#845400] hover:text-[#845400]"
                >
                  Volver a la Tienda
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#FAF6F8] p-4 text-sm leading-6 text-[#524535]">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#845400]" />
                <p>Si necesitas ayuda, revisa tu pedido o contacta a soporte desde tu perfil.</p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
