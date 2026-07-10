import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/admin';
import { AdminMetricStrip, AdminTableActions } from './AdminMetricStrip';

type Props = { role?: 'COMPRADOR' | 'VENDEDOR'; title?: string; description?: string };

const roleLabel = (role: string) => role === 'VENDEDOR' ? 'Vendedor' : role === 'COMPRADOR' ? 'Cliente' : 'Administrador';
const initials = (name = '') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AU';

export default function AdminUsersPage({ role, title = 'Usuarios', description = 'Administra los accesos y estados de las cuentas.' }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.getUsers(),
      adminApi.getOrders().catch(() => ({ data: [] })),
      adminApi.getProducts().catch(() => ({ data: [] })),
    ])
      .then(([usersRes, ordersRes, productsRes]) => {
        setUsers(usersRes.data);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = useMemo(() => users.filter((user) =>
    (!role || user.rol === role) && `${user.nombre} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  ), [users, search, role]);

  const updateStatus = async (user: any) => {
    await adminApi.updateUserStatus(user.id, user.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO');
    load();
  };

  const productCount = (user: any) => products.filter((product) => product.vendedor?.email === user.email).length;
  const orderCount = (user: any) => orders.filter((order) => order.comprador?.email === user.email).length;
  const spentTotal = (user: any) => orders
    .filter((order) => order.comprador?.email === user.email)
    .reduce((sum, order) => sum + Number(order.total), 0);

  const isVendor = role === 'VENDEDOR';
  const activeCount = visible.filter((user) => user.estado === 'ACTIVO').length;
  const pendingCount = visible.filter((user) => user.estado === 'PENDIENTE').length;

  const metrics = isVendor ? [
    { label: 'Volumen Total Ventas', value: `S/ ${orders.reduce((sum, order) => sum + Number(order.total), 0).toFixed(0)}`, detail: '+12%', icon: 'trending_up', tone: 'amber' as const },
    { label: 'Vendedores Activos', value: `${activeCount} / ${visible.length}`, detail: 'Operativos', icon: 'group', tone: 'mint' as const },
    { label: 'Media Productos', value: visible.length ? Math.round(products.length / visible.length) : 0, detail: 'Por vendedor', icon: 'inventory', tone: 'purple' as const },
    { label: 'Pendientes', value: pendingCount, detail: 'Por revisar', icon: 'schedule', tone: 'amber' as const },
  ] : [
    { label: 'Nuevos Clientes', value: visible.length, detail: '+12.4%', icon: 'group', tone: 'amber' as const },
    { label: 'Tasa de Retención', value: visible.length ? `${Math.round((activeCount / visible.length) * 100)}%` : '0%', detail: 'Activos', icon: 'refresh', tone: 'purple' as const },
    { label: 'Clientes VIP', value: visible.filter((user) => orderCount(user) >= 3).length, detail: '3+ pedidos', icon: 'verified', tone: 'mint' as const },
    { label: 'Suspendidos', value: visible.filter((user) => user.estado === 'SUSPENDIDO').length, detail: 'Sin acceso', icon: 'person_off', tone: 'error' as const },
  ];

  return (
    <section className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-auth-display text-4xl font-bold tracking-tight text-[#845400]">{title}</h1>
          <p className="mt-2 max-w-2xl text-base text-[#524535]">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-[260px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#847463]">search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Buscar ${isVendor ? 'vendedor' : 'cliente'}...`}
              className="h-12 w-full rounded-xl border border-[#d6c3b0]/70 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#845400] focus:ring-2 focus:ring-[#ffb347]/25"
            />
          </label>
          <button type="button" onClick={load} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 text-sm font-bold text-[#704700] shadow-sm transition hover:brightness-105">
            <span className="material-symbols-outlined text-lg">{isVendor ? 'add' : 'person_add'}</span>
            {isVendor ? 'Nuevo Vendedor' : 'Añadir Cliente'}
          </button>
        </div>
      </div>

      <AdminMetricStrip metrics={metrics} />

      <div className="overflow-hidden rounded-xl border border-[#d6c3b0]/35 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d6c3b0]/35 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-auth-display text-xl font-semibold text-[#211527]">Listado de {isVendor ? 'Vendedores' : 'Clientes'}</h2>
          <AdminTableActions onRefresh={load} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#f6f2f4] text-[#524535]">
                <th className="px-6 py-4 font-medium">{isVendor ? 'Vendedor' : 'Cliente'}</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Registro</th>
                <th className="px-6 py-4 font-medium">{isVendor ? 'Productos Asignados' : 'Total Pedidos'}</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e1e3]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-[#524535]">Cargando información...</td></tr>
              ) : visible.length ? visible.map((user) => (
                <tr key={user.id} className="transition hover:bg-[#fcf8fa]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ffddb6] font-bold text-[#704700]">{initials(user.nombre)}</div>
                      <div>
                        <p className="font-semibold text-[#211527]">{user.nombre}</p>
                        <p className="text-xs text-[#847463]">ID: {user.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#524535]">{user.email}</td>
                  <td className="px-6 py-4 text-[#524535]">{new Date(user.fechaRegistro).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211527]">{isVendor ? `${productCount(user)} productos` : `${orderCount(user)} pedidos`}</p>
                    {!isVendor && <p className="text-xs text-[#006b5b]">S/ {spentTotal(user).toFixed(2)}</p>}
                    {isVendor && <p className="text-xs text-[#847463]">{roleLabel(user.rol)}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${user.estado === 'ACTIVO' ? 'bg-[#96f0db]/60 text-[#006b5b]' : user.estado === 'PENDIENTE' ? 'bg-[#fff3df] text-[#845400]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => updateStatus(user)} className="rounded-lg border border-[#d6c3b0] px-3 py-2 text-xs font-bold text-[#845400] transition hover:bg-[#fff3df]">
                      {user.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-[#524535]">No se encontraron resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
