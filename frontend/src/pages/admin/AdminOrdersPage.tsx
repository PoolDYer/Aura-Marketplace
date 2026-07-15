import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/admin';
import { AdminMetricStrip, AdminTableActions } from './AdminMetricStrip';

const labels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_PREPARACION: 'En preparación',
  DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
  ESCALADA: 'Escalada',
};

const statuses = Object.keys(labels);

const statusTone: Record<string, string> = {
  PENDIENTE: 'bg-[#fff3df] text-[#845400]',
  CONFIRMADA: 'bg-[#e1f7f0] text-[#006b5b]',
  EN_PREPARACION: 'bg-[#f1e8f3] text-[#6c5774]',
  DESPACHADA: 'bg-[#e1f7f0] text-[#006b5b]',
  ENTREGADA: 'bg-[#96f0db]/60 text-[#006b5b]',
  CANCELADA: 'bg-[#ffdad6] text-[#93000a]',
  ESCALADA: 'bg-[#ffdad6] text-[#93000a]',
};

function getOrdersErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as any).response?.status;
    if (status === 401) {
      return 'Tu sesion expiro. Vuelve a iniciar sesion para ver los pedidos.';
    }

    const message = (error as any).response?.data?.message;
    if (message) return message;
  }

  return 'No pudimos cargar los pedidos. Intenta nuevamente.';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('TODOS');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminApi
      .getOrders()
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch((error) => setError(getOrdersErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => orders.filter((order) => {
    const matchesStatus = filter === 'TODOS' || order.estado === filter;
    const haystack = `${order.numeroConfirmacion} ${order.comprador?.nombre || ''} ${order.comprador?.email || ''}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [orders, filter, query]);

  const setStatus = async (id: string, estado: string) => {
    await adminApi.updateOrderStatus(id, estado);
    load();
  };

  const totalSales = orders
    .filter((order) => !['CANCELADA', 'ESCALADA'].includes(order.estado))
    .reduce((sum, order) => sum + Number(order.total), 0);

  const metrics = [
    { label: 'Pedidos Totales', value: orders.length, detail: '+12.5%', icon: 'shopping_basket', tone: 'amber' as const },
    { label: 'Pendientes', value: orders.filter((order) => order.estado === 'PENDIENTE').length, detail: '24 h', icon: 'pending_actions', tone: 'purple' as const },
    { label: 'Enviados', value: orders.filter((order) => ['DESPACHADA', 'ENTREGADA'].includes(order.estado)).length, detail: 'En ruta', icon: 'local_shipping', tone: 'mint' as const },
    { label: 'Total Ventas', value: `S/ ${totalSales.toFixed(0)}`, detail: 'Actualizado', icon: 'payments', tone: 'amber' as const },
  ];

  return (
    <section className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-auth-display text-4xl font-bold tracking-tight text-[#845400]">Gestión de Pedidos</h1>
          <p className="mt-2 text-base text-[#524535]">Supervisa y actualiza el flujo de transacciones en tiempo real.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-[260px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#847463]">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar pedidos..."
              className="h-12 w-full rounded-xl border border-[#d6c3b0]/70 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#845400] focus:ring-2 focus:ring-[#ffb347]/25"
            />
          </label>
          <button type="button" onClick={load} disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 text-sm font-bold text-[#704700] shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70">
            <span className="material-symbols-outlined text-lg">add</span>
            Nuevo Pedido
          </button>
        </div>
      </div>

      <AdminMetricStrip metrics={metrics} />

      <div className="flex flex-wrap gap-2">
        {['TODOS', ...statuses].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === status ? 'bg-[#845400] text-white' : 'bg-white text-[#524535] ring-1 ring-[#d6c3b0]/50 hover:bg-[#f6f2f4]'}`}
          >
            {status === 'TODOS' ? 'Todos' : labels[status]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#d6c3b0]/35 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d6c3b0]/35 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-auth-display text-xl font-semibold text-[#211527]">Listado de Pedidos</h2>
          <AdminTableActions onRefresh={load} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#f6f2f4] text-[#524535]">
                <th className="px-6 py-4 font-medium">Pedido</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e1e3]">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-[#524535]">Cargando pedidos...</td></tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#524535]">
                    <p className="font-semibold text-[#93000a]">{error}</p>
                    <button type="button" onClick={load} className="mt-4 rounded-full bg-[#845400] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#704700]">
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : visible.length ? visible.map((order) => (
                <tr key={order.id} className="transition hover:bg-[#fcf8fa]">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs font-bold text-[#845400]">{order.numeroConfirmacion}</p>
                    <p className="mt-1 text-xs text-[#847463]">ID: {order.id?.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#211527]">{order.comprador?.nombre || 'Sin nombre'}</p>
                    <p className="text-xs text-[#847463]">{order.comprador?.email || 'Sin email'}</p>
                  </td>
                  <td className="px-6 py-4 text-[#524535]">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-[#524535]">{order.lineas?.length || 0} productos</td>
                  <td className="px-6 py-4 font-semibold">S/ {Number(order.total).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.estado}
                      onChange={(event) => setStatus(order.id, event.target.value)}
                      className={`rounded-lg border-0 px-3 py-1.5 text-xs font-bold uppercase outline-none ${statusTone[order.estado] || 'bg-[#f1edef] text-[#524535]'}`}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{labels[status]}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right"><button className="material-symbols-outlined text-[#847463] hover:text-[#845400]">more_vert</button></td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-[#524535]">No hay pedidos con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
