import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, FileText, Filter, History, PackageSearch, RotateCw, Truck } from 'lucide-react';

import { ordersApi, Order } from '../../api/orders';

type StatusStyle = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
};

const getStatusStyle = (estado: string): StatusStyle => {
  switch (estado) {
    case 'ENTREGADA':
      return {
        label: 'Entregado',
        icon: CheckCircle2,
        badgeClass: 'bg-[#96f0db] text-[#00705f]',
      };
    case 'DESPACHADA':
      return {
        label: 'En camino',
        icon: Clock3,
        badgeClass: 'bg-[#ffb347] text-[#704700]',
      };
    case 'EN_PREPARACION':
      return {
        label: 'Procesando',
        icon: RotateCw,
        badgeClass: 'bg-[#ffddb6] text-[#643f00]',
      };
    case 'CONFIRMADA':
      return {
        label: 'Confirmada',
        icon: CheckCircle2,
        badgeClass: 'bg-[#96f0db]/70 text-[#00705f]',
      };
    case 'PENDIENTE':
      return {
        label: 'Pendiente',
        icon: Clock3,
        badgeClass: 'bg-[#ffddb6] text-[#643f00]',
      };
    case 'CANCELADA':
      return {
        label: 'Cancelada',
        icon: RotateCw,
        badgeClass: 'bg-[#ffdad6] text-[#93000a]',
      };
    default:
      return {
        label: estado,
        icon: PackageSearch,
        badgeClass: 'bg-[#e5e1e3] text-[#524535]',
      };
  }
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString('es', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getOrderShortId = (order: Order) => {
  const parts = order.numeroConfirmacion?.split('-').filter(Boolean);
  return parts?.length ? `#AU-${parts[parts.length - 1]}` : `#${order.id.slice(0, 6).toUpperCase()}`;
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const visibleOrders = useMemo(() => {
    if (!showRecentOnly) return orders;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return orders.filter((order) => new Date(order.createdAt).getTime() >= thirtyDaysAgo);
  }, [orders, showRecentOnly]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ffb347] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-14">
        <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-1 font-auth-display text-[32px] font-bold leading-10 text-[#211527] md:text-[40px] md:leading-[48px]">
              Mis Pedidos
            </h1>
            <p className="max-w-md text-[16px] leading-6 text-[#524535]">
              Revisa el estado de tus compras y gestiona tus devoluciones de forma sencilla.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRecentOnly((value) => !value)}
            className="flex w-fit items-center gap-2 rounded-full bg-[#f6f2f4] px-4 py-2 text-[14px] text-[#1c1b1d] transition-all hover:bg-[#ebe7e9] active:scale-95"
          >
            <Filter className="h-4 w-4" />
            {showRecentOnly ? 'Ver todos' : 'Filtrar'}
          </button>
        </div>

        {orders.length === 0 ? (
          <section className="rounded-[24px] border-2 border-dashed border-[#d6c3b0] bg-white/40 p-12 text-center md:p-16">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f6f2f4] text-[#847463]">
              <History className="h-10 w-10" />
            </div>
            <h2 className="font-auth-display text-[22px] font-semibold text-[#1c1b1d]">No tienes pedidos aun</h2>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-[#524535]">
              Cuando realices una compra, apareceran aqui.
            </p>
            <Link to="/catalog" className="mt-6 inline-flex rounded-full bg-[#845400] px-6 py-3 text-sm font-semibold text-white">
              Explorar catalogo
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {visibleOrders.map((order) => {
              const status = getStatusStyle(order.estado);
              const StatusIcon = status.icon;
              const totalItems = order.lineas.reduce((sum, line) => sum + line.cantidad, 0);

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-[#ebe7e9] bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-6 p-4 md:flex-row md:items-center md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-[#f6f2f4] text-[#845400]">
                        <Truck className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="font-auth-body text-[14px] font-medium text-[#845400]">{getOrderShortId(order)}</p>
                        <h2 className="font-auth-display text-[20px] font-semibold text-[#1c1b1d]">
                          {formatDate(order.createdAt)}
                        </h2>
                        <p className="mt-1 text-[14px] text-[#524535]">
                          {totalItems} {totalItems === 1 ? 'articulo' : 'articulos'} - ${Number(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] ${status.badgeClass}`}>
                        <StatusIcon className="mr-1 h-3.5 w-3.5" />
                        {status.label}
                      </span>
                      <div className="flex gap-2">
                        {order.estado === 'ENTREGADA' ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-[#d6c3b0] px-4 py-2 text-[14px] text-[#1c1b1d] transition-colors hover:bg-[#f6f2f4]"
                          >
                            <FileText className="h-4 w-4" />
                            Factura
                          </button>
                        ) : null}
                        <Link
                          to={`/profile/orders/${order.id}`}
                          className="rounded-full bg-[#845400] px-4 py-2 text-[14px] font-medium text-white transition-all hover:shadow-md active:scale-95"
                        >
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <section className="mt-16 flex flex-col items-center rounded-[28px] border-2 border-dashed border-[#d6c3b0] p-12 text-center md:p-16">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f6f2f4] text-[#847463]">
                <History className="h-10 w-10" />
              </div>
              <h2 className="font-auth-display text-[20px] font-semibold text-[#1c1b1d]">
                Buscas algo mas antiguo?
              </h2>
              <p className="mb-6 mt-2 max-w-sm text-[14px] leading-6 text-[#524535]">
                Puedes buscar pedidos de anos anteriores en nuestro archivo completo.
              </p>
              <button type="button" className="font-semibold text-[#845400] hover:underline">
                Acceder al Archivo
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
