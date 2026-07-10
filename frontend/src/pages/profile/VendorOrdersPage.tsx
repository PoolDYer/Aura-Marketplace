import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Globe2, Mic, Search, ShoppingBag, X } from 'lucide-react';

import { Order, ordersApi } from '../../api/orders';
import { useAuthStore } from '../../store/authStore';

const STATUS_OPTIONS = ['PENDIENTE', 'CONFIRMADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA', 'CANCELADA', 'ESCALADA'];
const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_PREPARACION: 'En preparación',
  DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
  ESCALADA: 'Escalada',
};
const DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: 'last7', label: 'Últimos 7 días' },
  { value: 'last30', label: 'Últimos 30 días' },
  { value: 'month', label: 'Este mes' },
];
const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const chipDateFormatter = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

type DateFilter =
  | { mode: 'preset'; value: string }
  | { mode: 'exact'; value: string }
  | { mode: 'range'; start: string; end: string }
  | null;

function orderCode(order: Order) {
  return `#${order.numeroConfirmacion?.split('-').pop() || order.id.slice(-6).toUpperCase()}`;
}

function statusClasses(status: string) {
  switch (status) {
    case 'PENDIENTE':
    case 'CONFIRMADA':
      return 'bg-[#ffb347]/20 text-[#704700] border-[#ffb347]/40';
    case 'EN_PREPARACION':
      return 'bg-[#f5d9fd] text-[#5d4865] border-[#d4b9db]';
    case 'DESPACHADA':
    case 'ENTREGADA':
      return 'bg-[#96f0db]/40 text-[#00705f] border-[#96f0db]';
    case 'CANCELADA':
    case 'ESCALADA':
      return 'bg-[#ffdad6]/70 text-[#93000a] border-[#ffdad6]';
    default:
      return 'bg-[#e5e1e3] text-[#524535] border-[#d6c3b0]/50';
  }
}

function vendorOrderTotal(order: Order, vendorId?: string) {
  if (!vendorId) return Number(order.total || 0);

  const vendorLines = order.lineas?.filter((line) => line.publicacion?.vendedorId === vendorId) ?? [];
  if (vendorLines.length === 0) return Number(order.total || 0);

  return vendorLines.reduce((sum, line) => sum + Number(line.subtotal || 0), 0);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function dateFromInput(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getDateRange(filter: DateFilter) {
  if (!filter) return null;

  const today = new Date();

  if (filter.mode === 'exact') {
    const date = dateFromInput(filter.value);
    return { start: startOfDay(date), end: endOfDay(date) };
  }

  if (filter.mode === 'range') {
    const startDate = dateFromInput(filter.start);
    const endDate = dateFromInput(filter.end);
    const start = startDate <= endDate ? startDate : endDate;
    const end = startDate <= endDate ? endDate : startDate;
    return { start: startOfDay(start), end: endOfDay(end) };
  }

  if (filter.value === 'today') {
    return { start: startOfDay(today), end: endOfDay(today) };
  }

  if (filter.value === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
  }

  if (filter.value === 'last7') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: startOfDay(start), end: endOfDay(today) };
  }

  if (filter.value === 'last30') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    return { start: startOfDay(start), end: endOfDay(today) };
  }

  if (filter.value === 'month') {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: endOfDay(today) };
  }

  return null;
}

function dateFilterLabel(filter: DateFilter) {
  if (!filter) return '';
  if (filter.mode === 'exact') return chipDateFormatter.format(dateFromInput(filter.value));
  if (filter.mode === 'range') {
    const startDate = dateFromInput(filter.start);
    const endDate = dateFromInput(filter.end);
    const start = startDate <= endDate ? startDate : endDate;
    const end = startDate <= endDate ? endDate : startDate;
    return `${chipDateFormatter.format(start)} - ${chipDateFormatter.format(end)}`;
  }
  return DATE_FILTER_OPTIONS.find((option) => option.value === filter.value)?.label || 'Fecha';
}

export default function VendorOrdersPage() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter>(null);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.getVendorOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders().catch(() => setIsLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const dateRange = getDateRange(selectedDateFilter);

    return orders.filter((order) => {
      const haystack = [
        orderCode(order),
        order.numeroConfirmacion,
        order.comprador?.nombre,
        order.comprador?.email,
        order.estado,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = query ? haystack.includes(query) : true;
      const matchesStatus = selectedStatuses.length > 0 ? selectedStatuses.includes(order.estado) : true;
      const orderDate = new Date(order.createdAt);
      const matchesDate = dateRange ? orderDate >= dateRange.start && orderDate <= dateRange.end : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, search, selectedStatuses, selectedDateFilter]);

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
    );
  };

  const removeStatusFilter = (status: string) => {
    setSelectedStatuses((current) => current.filter((item) => item !== status));
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, estado: newStatus } : order)));
    } finally {
      setUpdatingId(null);
    }
  };

  const exportOrders = () => {
    const rows = filteredOrders.map((order) => [
      orderCode(order),
      order.createdAt,
      order.comprador?.nombre || '',
      order.comprador?.email || '',
      vendorOrderTotal(order, user?.id).toFixed(2),
      order.estado,
    ]);
    const csv = [['Pedido', 'Fecha', 'Cliente', 'Email', 'Total', 'Estado'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pedidos-vendedor.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#1c1b1d]">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-auth-display text-[40px] font-bold leading-[48px] text-[#845400]">Gestión de Pedidos</h1>
            <p className="mt-1 text-[16px] leading-6 text-[#524535]">Administra y revisa el historial de órdenes recientes.</p>
          </div>
          <button
            type="button"
            onClick={exportOrders}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 text-[14px] font-semibold text-[#704700] shadow-sm transition hover:brightness-105 active:scale-95"
          >
            <Download className="h-5 w-5" />
            Exportar Reporte
          </button>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d6c3b0]/30 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[#d6c3b0]/30 p-6 md:flex-row md:items-center md:justify-between">
            <div className="relative min-w-[240px] flex-1 md:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#d6c3b0]/70 bg-white pl-12 pr-4 text-[14px] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#845400]"
                placeholder="Buscar por ID, cliente..."
                type="text"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterOpen((current) => !current);
                    setIsDateFilterOpen(false);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f6f2f4] px-4 text-[14px] font-semibold text-[#1c1b1d] transition hover:bg-[#e5e1e3]"
                  aria-expanded={isFilterOpen}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 transition ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen ? (
                  <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-[#d6c3b0]/40 bg-white p-2 shadow-[0_16px_36px_rgba(33,21,39,0.12)]">
                    {STATUS_OPTIONS.map((status) => {
                      const selected = selectedStatuses.includes(status);

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => toggleStatusFilter(status)}
                          className={`flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-[13px] font-semibold transition ${
                            selected ? 'bg-[#96f0db] text-[#00705f]' : 'text-[#524535] hover:bg-[#f6f2f4]'
                          }`}
                        >
                          {STATUS_LABELS[status]}
                          {selected ? <span className="h-2 w-2 rounded-full bg-[#00705f]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {selectedStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => removeStatusFilter(status)}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-[12px] font-semibold uppercase transition hover:brightness-95 ${statusClasses(status)}`}
                  aria-label={`Quitar filtro ${STATUS_LABELS[status]}`}
                >
                  {STATUS_LABELS[status]}
                  <X className="h-4 w-4" />
                </button>
              ))}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDateFilterOpen((current) => !current);
                    setIsFilterOpen(false);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f6f2f4] px-4 text-[14px] font-semibold text-[#1c1b1d] transition hover:bg-[#e5e1e3]"
                  aria-expanded={isDateFilterOpen}
                >
                  <CalendarDays className="h-4 w-4" />
                  Fecha
                  <ChevronDown className={`h-4 w-4 transition ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDateFilterOpen ? (
                  <div className="absolute right-0 top-12 z-20 w-64 overflow-hidden rounded-xl border border-[#d6c3b0]/40 bg-white p-2 shadow-[0_16px_36px_rgba(33,21,39,0.12)]">
                    {DATE_FILTER_OPTIONS.map((option) => {
                      const selected = selectedDateFilter?.mode === 'preset' && selectedDateFilter.value === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedDateFilter({ mode: 'preset', value: option.value });
                            setRangeStart('');
                            setRangeEnd('');
                            setIsDateFilterOpen(false);
                          }}
                          className={`flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-[13px] font-semibold transition ${
                            selected ? 'bg-[#ffb347]/30 text-[#704700]' : 'text-[#524535] hover:bg-[#f6f2f4]'
                          }`}
                        >
                          {option.label}
                          {selected ? <span className="h-2 w-2 rounded-full bg-[#845400]" /> : null}
                        </button>
                      );
                    })}

                    <div className="mt-2 border-t border-[#d6c3b0]/30 px-2 pt-3">
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Día específico</label>
                      <input
                        type="date"
                        value={selectedDateFilter?.mode === 'exact' ? selectedDateFilter.value : ''}
                        onChange={(event) => {
                          if (!event.target.value) {
                            setSelectedDateFilter(null);
                            return;
                          }
                          setSelectedDateFilter({ mode: 'exact', value: event.target.value });
                          setRangeStart('');
                          setRangeEnd('');
                          setIsDateFilterOpen(false);
                        }}
                        className="h-10 w-full rounded-lg border border-[#d6c3b0]/70 bg-white px-3 text-[13px] font-semibold text-[#1c1b1d] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                      />
                    </div>

                    <div className="mt-3 border-t border-[#d6c3b0]/30 px-2 pt-3">
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Rango de fechas</label>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="mb-1 block text-[11px] font-semibold text-[#847463]">Fecha de inicio</span>
                          <input
                            type="date"
                            value={rangeStart}
                            onChange={(event) => setRangeStart(event.target.value)}
                            className="h-10 w-full rounded-lg border border-[#d6c3b0]/70 bg-white px-3 text-[13px] font-semibold text-[#1c1b1d] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                          />
                        </div>
                        <div>
                          <span className="mb-1 block text-[11px] font-semibold text-[#847463]">Fecha de fin</span>
                          <input
                            type="date"
                            value={rangeEnd}
                            onChange={(event) => setRangeEnd(event.target.value)}
                            className="h-10 w-full rounded-lg border border-[#d6c3b0]/70 bg-white px-3 text-[13px] font-semibold text-[#1c1b1d] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRangeStart('');
                            setRangeEnd('');
                            if (selectedDateFilter?.mode === 'range') {
                              setSelectedDateFilter(null);
                            }
                          }}
                          className="h-9 flex-1 rounded-lg border border-[#d6c3b0]/60 bg-white text-[12px] font-semibold text-[#524535] transition hover:bg-[#f6f2f4]"
                        >
                          Limpiar
                        </button>
                        <button
                          type="button"
                          disabled={!rangeStart || !rangeEnd}
                          onClick={() => {
                            setSelectedDateFilter({ mode: 'range', start: rangeStart, end: rangeEnd });
                            setIsDateFilterOpen(false);
                          }}
                          className="h-9 flex-1 rounded-lg bg-[#ffb347] text-[12px] font-semibold text-[#704700] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Aplicar rango
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {selectedDateFilter ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateFilter(null);
                    setRangeStart('');
                    setRangeEnd('');
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ffb347]/45 bg-[#ffb347]/20 px-4 text-[12px] font-semibold uppercase text-[#704700] transition hover:brightness-95"
                  aria-label={`Quitar filtro de fecha ${dateFilterLabel(selectedDateFilter)}`}
                >
                  {dateFilterLabel(selectedDateFilter)}
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ffb347] border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
              <ShoppingBag className="h-14 w-14 text-[#524535]" />
              <div>
                <p className="font-auth-display text-[20px] font-semibold text-[#1c1b1d]">Sin pedidos</p>
                <p className="mt-1 text-[14px] text-[#524535]">Cuando alguien compre tus productos, aparecerán aquí.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d6c3b0]/30 bg-[#f6f2f4]/70">
                      <th className="px-6 py-5 font-auth-display text-[16px] font-semibold text-[#524535]">Order ID</th>
                      <th className="px-6 py-5 font-auth-display text-[16px] font-semibold text-[#524535]">Fecha</th>
                      <th className="px-6 py-5 font-auth-display text-[16px] font-semibold text-[#524535]">Cliente</th>
                      <th className="px-6 py-5 text-center font-auth-display text-[16px] font-semibold text-[#524535]">Origen</th>
                      <th className="px-6 py-5 text-right font-auth-display text-[16px] font-semibold text-[#524535]">Total</th>
                      <th className="px-6 py-5 text-right font-auth-display text-[16px] font-semibold text-[#524535]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6c3b0]/20">
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id} className="transition-colors hover:bg-[#fcf8fa]">
                        <td className="px-6 py-4 font-mono text-[14px] text-[#1c1b1d]">{orderCode(order)}</td>
                        <td className="px-6 py-4 text-[14px] text-[#524535]">{dateFormatter.format(new Date(order.createdAt))}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#1c1b1d]">{order.comprador?.nombre || 'Cliente sin nombre'}</p>
                          <p className="mt-1 text-[12px] text-[#524535]">{order.comprador?.email || 'Sin email'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {index % 2 === 0 ? <Mic className="mx-auto h-5 w-5 text-[#006b5b]" /> : <Globe2 className="mx-auto h-5 w-5 text-[#524535]" />}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-[14px] text-[#1c1b1d]">{currency.format(vendorOrderTotal(order, user?.id))}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative ml-auto inline-block w-44">
                            <select
                              value={order.estado}
                              disabled={updatingId === order.id}
                              onChange={(event) => handleUpdateStatus(order.id, event.target.value)}
                              className={`h-9 w-full appearance-none rounded-lg border px-3 pr-8 text-[12px] font-semibold outline-none transition focus:ring-2 focus:ring-[#845400]/20 ${statusClasses(order.estado)}`}
                              aria-label={`Actualizar estado de ${orderCode(order)}`}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-current" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[#d6c3b0]/10 bg-white px-6 py-5 sm:flex-row">
                <p className="text-[14px] text-[#524535]">
                  Mostrando <span className="font-semibold text-[#845400]">{filteredOrders.length}</span> de{' '}
                  <span className="font-semibold text-[#845400]">{orders.length}</span> pedidos
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d6c3b0]/30 text-[#524535] opacity-50" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="h-10 w-10 rounded-lg bg-[#ffb347] font-semibold text-[#704700]">1</button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d6c3b0]/30 text-[#524535] opacity-50" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
