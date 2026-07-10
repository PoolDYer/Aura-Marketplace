import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, MoreVertical, Search, TrendingUp, UserPlus, Users } from 'lucide-react';

import { Order, ordersApi } from '../../api/orders';
import { useAuthStore } from '../../store/authStore';

type VendorClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  total: number;
  lastPurchase: Date;
};

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const dateFormatter = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || 'C') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
}

function vendorOrderTotal(order: Order, vendorId?: string) {
  if (!vendorId) return Number(order.total || 0);

  const vendorLines = order.lineas?.filter((line) => line.publicacion?.vendedorId === vendorId) ?? [];
  if (vendorLines.length === 0) return Number(order.total || 0);

  return vendorLines.reduce((sum, line) => sum + Number(line.subtotal || 0), 0);
}

function buildClients(orders: Order[], vendorId?: string): VendorClient[] {
  const map = new Map<string, VendorClient>();

  orders.forEach((order) => {
    const id = order.compradorId || order.comprador?.email || order.id;
    const current = map.get(id);
    const createdAt = new Date(order.createdAt);
    const total = vendorOrderTotal(order, vendorId);

    if (!current) {
      map.set(id, {
        id,
        name: order.comprador?.nombre || 'Cliente sin nombre',
        email: order.comprador?.email || 'Sin email',
        phone: order.comprador?.telefono || 'Sin teléfono',
        orders: 1,
        total,
        lastPurchase: createdAt,
      });
      return;
    }

    current.orders += 1;
    current.total += total;
    if (createdAt > current.lastPurchase) {
      current.lastPurchase = createdAt;
    }
  });

  return Array.from(map.values()).sort((a, b) => b.lastPurchase.getTime() - a.lastPurchase.getTime());
}

export default function VendorClientsPage() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getVendorOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const clients = useMemo(() => buildClients(orders, user?.id), [orders, user?.id]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) =>
      [client.name, client.email, client.phone, `C-${client.id.slice(0, 5)}`].join(' ').toLowerCase().includes(query),
    );
  }, [clients, search]);

  const stats = useMemo(() => {
    const repeated = clients.filter((client) => client.orders > 1).length;
    const retention = clients.length ? Math.round((repeated / clients.length) * 1000) / 10 : 0;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newThisMonth = clients.filter((client) => client.lastPurchase >= monthStart).length;
    const revenue = clients.reduce((sum, client) => sum + client.total, 0);

    return { retention, newThisMonth, revenue };
  }, [clients]);

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#1c1b1d]">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-10">
          <h1 className="font-auth-display text-[40px] font-bold leading-[48px] text-[#845400]">Historial de Clientes</h1>
          <p className="mt-2 max-w-3xl text-[16px] leading-6 text-[#524535]">
            Analiza la frecuencia de compra para identificar y captar a tus clientes más leales.
          </p>
        </section>

        <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#845400]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-[14px] shadow-sm outline-none transition focus:ring-2 focus:ring-[#845400]/20"
              placeholder="Buscar por nombre, email o teléfono..."
              type="text"
            />
          </div>
          <button type="button" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#e5e1e3] px-6 text-[14px] font-semibold text-[#1c1b1d] transition hover:bg-[#dcd9db]">
            <Filter className="h-5 w-5" />
            Filtros
          </button>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#e5e1e3] bg-white shadow-sm">
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ffb347] border-t-transparent" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
              <Users className="h-14 w-14 text-[#524535]" />
              <div>
                <p className="font-auth-display text-[20px] font-semibold text-[#1c1b1d]">Sin clientes para mostrar</p>
                <p className="mt-1 text-[14px] text-[#524535]">Los compradores aparecerán aquí cuando recibas pedidos.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="border-b border-[#e5e1e3] bg-[#f6f2f4] text-[12px] uppercase tracking-wide text-[#524535]">
                    <tr>
                      <th className="px-5 py-5 font-semibold">Nombre</th>
                      <th className="px-5 py-5 font-semibold">Email</th>
                      <th className="px-5 py-5 font-semibold">Telefono</th>
                      <th className="px-5 py-5 font-semibold text-[#845400]">Total Pedidos</th>
                      <th className="px-5 py-5 font-semibold text-[#845400]">Total Comprado</th>
                      <th className="px-5 py-5 font-semibold">Última Compra</th>
                      <th className="px-5 py-5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e1e3]">
                    {filteredClients.map((client, index) => (
                      <tr key={client.id} className={`${index > 1 && client.orders === 1 ? 'opacity-75' : ''} transition-colors hover:bg-[#f6f2f4]`}>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${index % 3 === 0 ? 'bg-[#96f0db] text-[#00705f]' : index % 3 === 1 ? 'bg-[#f5d9fd] text-[#5d4865]' : 'bg-[#ffb347] text-[#704700]'}`}>
                              {initials(client.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1c1b1d]">{client.name}</p>
                              <p className="mt-1 text-[12px] text-[#524535]">ID: #C-{client.id.slice(0, 5).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-[14px] text-[#524535]">{client.email}</td>
                        <td className="px-5 py-5 text-[14px] text-[#524535]">{client.phone}</td>
                        <td className="px-5 py-5 font-mono text-[14px] text-[#845400]">{String(client.orders).padStart(2, '0')}</td>
                        <td className="px-5 py-5 font-mono text-[14px] text-[#845400]">{currency.format(client.total)}</td>
                        <td className="px-5 py-5 text-[14px] text-[#524535]">{dateFormatter.format(client.lastPurchase)}</td>
                        <td className="px-5 py-5 text-right">
                          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#524535] transition hover:bg-[#e5e1e3]" aria-label={`Opciones de ${client.name}`}>
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e5e1e3] bg-[#f6f2f4] px-5 py-5 sm:flex-row">
                <p className="text-[13px] text-[#524535]">
                  Mostrando <span className="font-bold">{filteredClients.length}</span> de <span className="font-bold">{clients.length}</span> clientes
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[#524535] opacity-40" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="h-9 w-9 rounded-lg bg-[#845400] text-[13px] font-bold text-white">1</button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[#524535] opacity-40" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#d6c3b0]/30 bg-white/80 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Users className="mb-3 h-6 w-6 text-[#845400]" />
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Tasa de Retención</p>
              </div>
              <p className="font-auth-display text-[32px] font-bold text-[#1c1b1d]">{stats.retention}%</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f1edef]">
              <div className="h-full rounded-full bg-[#006b5b]" style={{ width: `${Math.min(100, stats.retention)}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-[#d6c3b0]/30 bg-white/80 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <UserPlus className="mb-3 h-6 w-6 text-[#845400]" />
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Nuevos Este Mes</p>
              </div>
              <p className="font-auth-display text-[32px] font-bold text-[#1c1b1d]">+{stats.newThisMonth}</p>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#006b5b]">
              <TrendingUp className="h-4 w-4" />
              Basado en últimas compras
            </p>
          </div>
          <div className="rounded-xl border border-[#d6c3b0]/30 bg-white/80 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <TrendingUp className="mb-3 h-6 w-6 text-[#845400]" />
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Ingresos Clientes</p>
              </div>
              <p className="font-auth-display text-[28px] font-bold text-[#1c1b1d]">{currency.format(stats.revenue)}</p>
            </div>
            <p className="mt-4 text-[13px] text-[#524535]">Total atribuido a tus productos.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
