import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  Info,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';

import { ordersApi, type Order } from '../../api/orders';

const STATUS_STEPS = [
  { key: 'PENDIENTE', label: 'PENDIENTE', icon: Clock3 },
  { key: 'CONFIRMADA', label: 'CONFIRMADA', icon: CheckCircle2 },
  { key: 'EN_PREPARACION', label: 'EN PREPARACION', icon: Package },
  { key: 'DESPACHADA', label: 'DESPACHADA', icon: Truck },
  { key: 'ENTREGADA', label: 'ENTREGADA', icon: Home },
];

const formatMoney = (value?: string | number | null) => `S/ ${Number(value || 0).toFixed(2)}`;

const formatDate = (value?: string | null) => {
  if (!value) return 'No disponible';

  return new Date(value).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};

const addBusinessEstimate = (value?: string | null) => {
  const date = value ? new Date(value) : new Date();
  date.setDate(date.getDate() + 5);

  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getOrderCode = (order: Order) => order.numeroConfirmacion || order.id.slice(0, 8).toUpperCase();

const getShortOrderId = (order: Order) => {
  const parts = order.numeroConfirmacion?.split('-').filter(Boolean) ?? [];
  return parts[parts.length - 1] || order.id.slice(0, 6).toUpperCase();
};

const getAddressLines = (order: Order) => {
  const address = order.direccion;
  if (!address) return ['No disponible'];

  const recipient = order.comprador?.nombre;
  const street = [address.calle, address.numero].filter(Boolean).join(' ');
  const city = [address.ciudad, address.estado, address.codigoPostal].filter(Boolean).join(', ');

  return [recipient, street, city].filter(Boolean);
};

const getPaymentLabel = (method?: string | null) => {
  if (!method) return 'No disponible';

  return method
    .replace(/^mercadopago_?/i, 'Mercado Pago ')
    .replace(/_/g, ' ')
    .trim();
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'CONFIRMADA':
      return 'Confirmada';
    case 'EN_PREPARACION':
      return 'En preparacion';
    case 'DESPACHADA':
      return 'Despachada';
    case 'ENTREGADA':
      return 'Entregada';
    case 'CANCELADA':
      return 'Cancelada';
    default:
      return status;
  }
};

function SectionCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-[#f1edef] bg-white shadow-[0_14px_40px_rgba(33,21,39,0.06)] ${className}`}>
      {children}
    </section>
  );
}

function CardTitle({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 font-auth-display text-xl font-bold text-[#211527]">
      <Icon className="h-5 w-5 text-[#845400]" />
      {children}
    </h2>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center bg-[#FAF6F8]">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#eadfd2] bg-white px-10 py-8 text-[#524535] shadow-sm">
        <Loader2 className="h-9 w-9 animate-spin text-[#845400]" />
        <p>Estamos cargando tu pedido...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center bg-[#FAF6F8] px-4 text-center">
      <section className="w-full max-w-md rounded-[28px] border border-[#eadfd2] bg-white px-8 py-10 shadow-sm">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-[#ba1a1a]" />
        <h1 className="font-auth-display text-2xl font-bold text-[#211527]">Orden no encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-[#524535]">No pudimos cargar los detalles de este pedido.</p>
        <Link className="mt-6 inline-flex rounded-full bg-[#845400] px-6 py-3 text-sm font-bold text-white" to="/profile/orders">
          Volver a mis pedidos
        </Link>
      </section>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    ordersApi
      .getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const currentStep = useMemo(() => {
    if (!order) return -1;
    return STATUS_STEPS.findIndex((step) => step.key === order.estado);
  }, [order]);

  if (isLoading) return <LoadingState />;
  if (!order) return <EmptyState />;

  const addressLines = getAddressLines(order);
  const isCancelled = order.estado === 'CANCELADA';
  const paymentStatus = order.pago?.estado || 'No disponible';

  return (
    <div className="min-h-[calc(100vh-96px)] bg-[#FAF6F8] font-sans text-[#211527]">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <section className="mb-10 flex flex-col gap-5 text-center md:text-left">
          <Link
            to="/profile/orders"
            className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-[#d6c3b0] bg-white px-4 py-2 text-sm font-semibold text-[#524535] transition-colors hover:border-[#845400] hover:text-[#845400] md:self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Mis pedidos
          </Link>

          <div>
            <h1 className="font-auth-display text-4xl font-bold text-[#211527] md:text-5xl">Seguimiento de Pedido</h1>
            <div className="mt-3 flex flex-col items-center gap-2 text-[#524535] md:flex-row md:items-start">
              <span className="rounded-lg bg-[#f1edef] px-3 py-1 font-mono text-sm font-semibold text-[#845400]">
                #{getOrderCode(order)}
              </span>
              <span className="hidden md:inline">-</span>
              <span className="text-sm md:text-base">
                Entrega estimada: <strong className="text-[#845400]">{addBusinessEstimate(order.createdAt)}</strong>
              </span>
            </div>
          </div>
        </section>

        {isCancelled ? (
          <SectionCard className="mb-10 p-6 md:p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a]">
                <XCircle className="h-7 w-7" />
              </div>
              <h2 className="font-auth-display text-2xl font-bold text-[#211527]">Pedido cancelado</h2>
              <p className="max-w-xl text-sm leading-6 text-[#524535]">
                Este pedido fue cancelado. Puedes revisar tus otros pedidos o volver al catalogo.
              </p>
            </div>
          </SectionCard>
        ) : (
          <SectionCard className="mb-10 overflow-hidden p-6 md:p-8">
            <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="absolute left-0 right-0 top-5 z-0 hidden h-0.5 bg-[#e5e1e3] md:block" />
              <div
                className="absolute left-0 top-5 z-0 hidden h-0.5 bg-[#7dd7c2] md:block"
                style={{ width: `${Math.max(currentStep, 0) * 25}%` }}
              />

              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const done = index <= currentStep;
                const active = index === currentStep;

                return (
                  <div key={step.key} className="relative z-10 flex items-center gap-3 md:flex-1 md:flex-col md:gap-2">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                        active
                          ? 'border-white bg-[#ffb347] text-[#704700] shadow-[0_10px_28px_rgba(132,84,0,0.18)] ring-4 ring-white'
                          : done
                            ? 'border-[#7dd7c2] bg-[#7dd7c2] text-[#005144]'
                            : 'border-[#e5e1e3] bg-[#e5e1e3] text-[#847463]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        active ? 'text-[#845400]' : done ? 'text-[#006b5b]' : 'text-[#847463]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <SectionCard className="p-5 md:p-7 lg:col-span-2">
            <CardTitle icon={ShoppingBag}>Resumen de Pedido</CardTitle>

            <div className="space-y-4">
              {order.lineas.map((line) => {
                const imageUrl = line.publicacion?.imagenes?.[0]?.url;

                return (
                  <article
                    key={line.id}
                    className="group flex flex-col gap-4 rounded-xl border border-[#f1edef] bg-white p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f6f2f4]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={line.nombreProducto}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <PackageCheck className="h-9 w-9 text-[#847463]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-semibold text-[#211527]">{line.nombreProducto}</h3>
                      <p className="mt-1 text-sm text-[#524535]">Cantidad: {line.cantidad}</p>
                      {line.publicacion?.descripcion ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#524535]">{line.publicacion.descripcion}</p>
                      ) : null}
                    </div>
                    <span className="font-mono text-sm font-bold text-[#211527] sm:text-right">
                      {formatMoney(line.subtotal)}
                    </span>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 space-y-3 border-t border-[#f1edef] pt-5">
              <div className="flex justify-between text-sm text-[#524535]">
                <span>Subtotal</span>
                <span>{formatMoney(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#524535]">
                <span>Envio</span>
                <span className="font-semibold text-[#006b5b]">Gratis</span>
              </div>
              <div className="flex justify-between pt-2 font-auth-display text-2xl font-bold text-[#211527]">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </SectionCard>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard className="p-5 md:p-7">
                <CardTitle icon={MapPin}>Direccion de Envio</CardTitle>
                <div className="space-y-1 text-sm leading-6 text-[#524535]">
                  {addressLines.map((line) => (
                    <p key={line} className={line === addressLines[0] ? 'font-semibold text-[#211527]' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </SectionCard>

              <SectionCard className="p-5 md:p-7">
                <CardTitle icon={CreditCard}>Pago</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#524535]">Estado</span>
                    <span className="rounded-lg bg-[#96f0db]/60 px-3 py-1 font-mono text-xs font-bold text-[#00705f]">
                      {paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#524535]">Metodo</span>
                    <span className="text-right font-mono text-xs font-semibold text-[#211527]">
                      {getPaymentLabel(order.pago?.metodoPago)}
                    </span>
                  </div>
                </div>
              </SectionCard>

              <SectionCard className="p-5 md:p-7">
                <CardTitle icon={Info}>Detalles</CardTitle>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#524535]">Fecha</span>
                    <span className="font-mono text-xs font-semibold text-[#211527]">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#524535]">ID Pedido</span>
                    <span className="font-mono text-xs font-semibold text-[#211527]">#{getShortOrderId(order)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#524535]">Estado actual</span>
                    <span className="text-right font-mono text-xs font-semibold text-[#845400]">{getStatusLabel(order.estado)}</span>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
