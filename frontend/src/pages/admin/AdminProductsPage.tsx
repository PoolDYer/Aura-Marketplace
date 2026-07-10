import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/admin';
import { AdminMetricStrip, AdminTableActions } from './AdminMetricStrip';

const statusLabel: Record<string, string> = { BORRADOR: 'Borrador', ACTIVA: 'Activa', INACTIVA: 'Inactiva' };
const statusStyle: Record<string, string> = {
  BORRADOR: 'bg-[#fff3df] text-[#845400]',
  ACTIVA: 'bg-[#96f0db]/60 text-[#006b5b]',
  INACTIVA: 'bg-[#ffdad6] text-[#93000a]',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getProducts().then(({ data }) => setProducts(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = useMemo(() => products.filter((item) =>
    `${item.nombre} ${item.vendedor?.nombre || ''} ${item.vendedor?.email || ''} ${item.categoria?.nombre || ''}`.toLowerCase().includes(query.toLowerCase()),
  ), [products, query]);

  const update = async (id: string, estado: string) => {
    await adminApi.updateProductStatus(id, estado);
    load();
  };

  const remove = async (id: string) => {
    if (window.confirm('¿Retirar esta publicación del catálogo?')) {
      await adminApi.deleteProduct(id);
      load();
    }
  };

  const inStock = products.filter((product) => (product.inventario?.cantidad ?? 0) > 0).length;
  const lowStock = products.filter((product) => {
    const stock = product.inventario?.cantidad ?? 0;
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStock = products.filter((product) => (product.inventario?.cantidad ?? 0) === 0).length;

  const metrics = [
    { label: 'Total Productos', value: products.length, detail: 'Catálogo', icon: 'inventory', tone: 'amber' as const },
    { label: 'En Stock', value: inStock, detail: 'Disponibles', icon: 'check_circle', tone: 'mint' as const },
    { label: 'Stock Bajo', value: lowStock, detail: 'Revisar', icon: 'warning', tone: 'amber' as const },
    { label: 'Agotados', value: outOfStock, detail: 'Atención', icon: 'error', tone: 'error' as const },
  ];

  return (
    <section className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-auth-display text-4xl font-bold tracking-tight text-[#845400]">Gestión de Productos</h1>
          <p className="mt-2 text-base text-[#524535]">Controla tu catálogo, actualiza existencias y gestiona precios.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-[260px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#847463]">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar productos..."
              className="h-12 w-full rounded-xl border border-[#d6c3b0]/70 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#845400] focus:ring-2 focus:ring-[#ffb347]/25"
            />
          </label>
          <button type="button" onClick={load} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 text-sm font-bold text-[#704700] shadow-sm transition hover:brightness-105">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Nuevo Producto
          </button>
        </div>
      </div>

      <AdminMetricStrip metrics={metrics} />

      <div className="overflow-hidden rounded-xl border border-[#d6c3b0]/35 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d6c3b0]/35 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-auth-display text-xl font-semibold text-[#211527]">Listado de Productos</h2>
          <AdminTableActions onRefresh={load} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#f6f2f4] text-[#524535]">
                <th className="px-6 py-4 font-medium">Miniatura</th>
                <th className="px-6 py-4 font-medium">Nombre & SKU</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Vendedor</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e1e3]">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-[#524535]">Cargando productos...</td></tr>
              ) : visible.length ? visible.map((product) => {
                const stock = product.inventario?.cantidad ?? 0;
                const image = product.imagenes?.[0]?.url;
                return (
                  <tr key={product.id} className="group transition hover:bg-[#fcf8fa]">
                    <td className="px-6 py-4">
                      <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-[#f1edef] text-[#845400] transition group-hover:scale-105">
                        {image ? <img src={image} alt={product.nombre} className="h-full w-full object-cover" /> : <span className="material-symbols-outlined">inventory_2</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#211527]">{product.nombre}</p>
                      <p className="font-mono text-xs text-[#847463]">SKU: {product.id?.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-[#f1e8f3] px-2.5 py-1 text-xs font-medium uppercase text-[#6c5774]">{product.categoria?.nombre || 'Sin categoría'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211527]">{product.vendedor?.nombre || 'Sin vendedor'}</p>
                      <p className="text-xs text-[#847463]">{product.vendedor?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold">S/ {Number(product.precio).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${stock === 0 ? 'bg-[#ba1a1a]' : stock <= 5 ? 'bg-[#ffb347]' : 'bg-[#006b5b]'}`} />
                        <span className="font-medium">{stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={product.estado}
                        onChange={(event) => update(product.id, event.target.value)}
                        className={`rounded-lg border-0 px-3 py-1.5 text-xs font-bold uppercase outline-none ${statusStyle[product.estado] || 'bg-[#f1edef] text-[#524535]'}`}
                      >
                        {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => remove(product.id)} className="rounded-lg px-3 py-2 text-xs font-bold text-[#93000a] transition hover:bg-[#ffdad6]">Retirar</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-[#524535]">No se encontraron publicaciones.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
