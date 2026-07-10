import { useEffect, useMemo, useState } from 'react';
import { categoriesApi } from '../../api/categories';
import { adminApi } from '../../api/admin';
import { AdminMetricStrip, AdminTableActions } from './AdminMetricStrip';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoriesApi.getCategories(),
        adminApi.getProducts().catch(() => ({ data: [] })),
      ]);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await categoriesApi.createCategory({ nombre });
      setNombre('');
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category', error);
    } finally {
      setCreating(false);
    }
  };

  const linkedProducts = (category: any) => products.filter((product) => product.categoria?.nombre === category.nombre);
  const visible = useMemo(() => categories.filter((category) => category.nombre?.toLowerCase().includes(query.toLowerCase())), [categories, query]);
  const mostActive = useMemo(() => {
    if (!categories.length) return 'Sin datos';
    return [...categories].sort((a, b) => linkedProducts(b).length - linkedProducts(a).length)[0]?.nombre || 'Sin datos';
  }, [categories, products]);
  const emptyCategories = categories.filter((category) => linkedProducts(category).length === 0).length;

  const metrics = [
    { label: 'Total Categorías', value: categories.length, detail: 'Consolidado', icon: 'category', tone: 'amber' as const },
    { label: 'Más Activa', value: mostActive, detail: 'Por productos', icon: 'star', tone: 'mint' as const },
    { label: 'Sin Stock', value: emptyCategories, detail: 'Requiere atención', icon: 'warning', tone: 'error' as const },
    { label: 'Nuevas Mes', value: categories.filter((category) => category.createdAt && new Date(category.createdAt).getMonth() === new Date().getMonth()).length, detail: 'Este mes', icon: 'add_circle', tone: 'purple' as const },
  ];

  return (
    <section className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-auth-display text-4xl font-bold tracking-tight text-[#845400]">Gestión de Categorías</h1>
          <p className="mt-2 text-base text-[#524535]">Organiza y supervisa la estructura del catálogo de Aura.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-[260px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#847463]">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar categoría..."
              className="h-12 w-full rounded-xl border border-[#d6c3b0]/70 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#845400] focus:ring-2 focus:ring-[#ffb347]/25"
            />
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 text-sm font-bold text-[#704700] shadow-sm transition hover:brightness-105"
          >
            <span className="material-symbols-outlined text-lg">{showForm ? 'close' : 'add_circle'}</span>
            {showForm ? 'Cancelar' : 'Nueva Categoría'}
          </button>
        </div>
      </div>

      <AdminMetricStrip metrics={metrics} />

      {showForm && (
        <div className="rounded-xl border border-[#d6c3b0]/35 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-auth-display text-xl font-semibold text-[#211527]">
            <span className="material-symbols-outlined text-[#845400]">add_circle</span>
            Nueva Categoría
          </h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Nombre de la categoría..."
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              className="h-12 flex-1 rounded-lg border border-[#d6c3b0]/55 bg-[#f6f2f4] px-4 text-sm outline-none transition focus:border-[#845400] focus:bg-white"
            />
            <button
              type="submit"
              disabled={creating}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#006b5b] px-6 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              {creating ? 'Creando...' : 'Crear Categoría'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#d6c3b0]/35 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d6c3b0]/35 px-5 py-4 sm:flex-row sm:items-center">
          <h2 className="font-auth-display text-xl font-semibold text-[#211527]">Listado de Categorías</h2>
          <AdminTableActions onRefresh={fetchCategories} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#f6f2f4] text-[#524535]">
                <th className="px-6 py-4 font-medium">Nombre de Categoría</th>
                <th className="px-6 py-4 text-center font-medium">Productos Vinculados</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e1e3]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-[#524535]">Cargando categorías...</td></tr>
              ) : visible.length ? visible.map((category) => {
                const count = linkedProducts(category).length;
                return (
                  <tr key={category.id} className="transition hover:bg-[#fcf8fa]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e1f7f0] text-[#006b5b]">
                          <span className="material-symbols-outlined">label</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#211527]">{category.nombre}</p>
                          <p className="font-mono text-xs text-[#847463]">{category.id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">{count}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${category.activa === false ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#96f0db]/60 text-[#006b5b]'}`}>
                        {category.activa === false ? 'Inactiva' : 'Activa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="material-symbols-outlined rounded-full p-2 text-[#847463] transition hover:bg-[#fff3df] hover:text-[#845400]" title="Editar">edit</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-[#524535]">No se encontraron categorías.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {categories.length > 0 && (
          <div className="border-t border-[#d6c3b0]/30 bg-[#f6f2f4] px-5 py-3 text-sm text-[#524535]">
            {categories.length} categorías en total
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminCategoriesPage;
