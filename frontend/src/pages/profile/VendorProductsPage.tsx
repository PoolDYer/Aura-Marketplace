import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Edit3, ImageIcon, Package, Plus, Search, Trash2, TrendingUp } from 'lucide-react';

import { categoriesApi } from '../../api/categories';
import { productsApi } from '../../api/products';

type VendorProduct = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  estado: 'BORRADOR' | 'ACTIVA' | 'INACTIVA' | 'ELIMINADA';
  categoriaId?: string;
  categoria?: { nombre: string };
  inventario?: { cantidad: number; cantidadReservada: number };
  imagenes?: Array<{ url: string }>;
};

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

function productSku(id: string) {
  return `AUR-${id.slice(0, 8).toUpperCase()}`;
}

function getAvailableStock(product: VendorProduct) {
  const total = product.inventario?.cantidad ?? 0;
  const reserved = product.inventario?.cantidadReservada ?? 0;
  return Math.max(0, total - reserved);
}

function getProductStatus(product: VendorProduct) {
  const stock = getAvailableStock(product);

  if (product.estado === 'INACTIVA' || stock === 0) {
    return {
      label: stock === 0 ? 'Agotado' : 'Inactivo',
      className: 'bg-[#e5e1e3] text-[#524535]',
      icon: AlertTriangle,
    };
  }

  if (product.estado === 'BORRADOR') {
    return {
      label: 'Borrador',
      className: 'bg-[#f5d9fd] text-[#5d4865]',
      icon: Edit3,
    };
  }

  if (stock <= 5) {
    return {
      label: 'Poco stock',
      className: 'bg-[#ffb347]/70 text-[#704700]',
      icon: AlertTriangle,
    };
  }

  return {
    label: 'Disponible',
    className: 'bg-[#96f0db] text-[#00705f]',
    icon: CheckCircle2,
  };
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; nombre: string }>>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getVendorProducts(),
        categoriesApi.getCategories().catch(() => ({ data: [] })),
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts().catch(() => setLoading(false));
  }, []);

  const categoryName = (product: VendorProduct) =>
    product.categoria?.nombre || categories.find((category) => category.id === product.categoriaId)?.nombre || 'Sin categoría';

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const haystack = [product.nombre, productSku(product.id), categoryName(product), product.estado].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [products, search, categories]);

  const stats = useMemo(() => {
    const stock = products.reduce((sum, product) => sum + getAvailableStock(product), 0);
    const value = products.reduce((sum, product) => sum + getAvailableStock(product) * Number(product.precio || 0), 0);
    const alerts = products.filter((product) => getAvailableStock(product) <= 5 || product.estado === 'INACTIVA').length;

    return { stock, value, alerts };
  }, [products]);

  const updateStatus = async (product: VendorProduct, estado: VendorProduct['estado']) => {
    setUpdatingId(product.id);
    try {
      await productsApi.updateProductStatus(product.id, estado);
      setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, estado } : item)));
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (product: VendorProduct) => {
    if (!confirm(`Eliminar "${product.nombre}" del catálogo?`)) return;

    setUpdatingId(product.id);
    try {
      await productsApi.deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#1c1b1d]">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-auth-display text-[40px] font-bold leading-[48px] text-[#845400]">Gestión de Catálogo</h1>
            <p className="mt-1 text-[16px] leading-6 text-[#524535]">Administra productos, inventario y precios.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[240px] sm:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#d6c3b0]/70 bg-white pl-12 pr-4 text-[14px] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#845400]"
                placeholder="Filtrar por SKU o nombre..."
                type="text"
              />
            </div>

            <Link
              to="/vendor/catalog/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 text-[14px] font-semibold text-[#704700] shadow-sm transition hover:brightness-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Agregar Producto
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d6c3b0]/30 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ffb347] border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
              <Package className="h-14 w-14 text-[#524535]" />
              <div>
                <p className="font-auth-display text-[20px] font-semibold text-[#1c1b1d]">No hay publicaciones para mostrar</p>
                <p className="mt-1 text-[14px] text-[#524535]">Crea tu primer producto o ajusta la búsqueda.</p>
              </div>
              <Link to="/vendor/catalog/new" className="rounded-full bg-[#845400] px-5 py-3 text-[14px] font-semibold text-white">
                Crear publicación
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d6c3b0]/20 bg-[#f6f2f4]/70">
                      {['Imagen', 'Producto', 'Categoría', 'SKU', 'Estado', 'Precio', 'Acciones'].map((heading, index) => (
                        <th
                          key={heading}
                          className={`px-6 py-5 font-auth-display text-[16px] font-semibold text-[#524535] ${index === 5 ? 'text-right' : ''} ${index === 6 ? 'text-center' : ''}`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6c3b0]/10">
                    {filteredProducts.map((product) => {
                      const status = getProductStatus(product);
                      const StatusIcon = status.icon;
                      const stock = getAvailableStock(product);

                      return (
                        <tr key={product.id} className="group transition-colors hover:bg-[#fcf8fa]">
                          <td className="px-6 py-4">
                            <Link
                              to={`/products/${product.id}`}
                              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-[#f1edef] text-[#524535] transition-transform duration-300 hover:ring-2 hover:ring-[#845400]/30 group-hover:scale-105"
                              aria-label={`Ver publicacion de ${product.nombre}`}
                              title="Ver publicacion"
                            >
                              {product.imagenes?.[0]?.url ? (
                                <img src={product.imagenes[0].url} alt={product.nombre} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-6 w-6" />
                              )}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#845400]">{product.nombre}</p>
                            <p className="mt-1 max-w-[260px] truncate text-[12px] text-[#524535]">{stock} unidades disponibles</p>
                          </td>
                          <td className="px-6 py-4 text-[14px] text-[#524535]">{categoryName(product)}</td>
                          <td className="px-6 py-4 font-mono text-[13px] uppercase text-[#524535]">{productSku(product.id)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold ${status.className}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#845400]">{currency.format(Number(product.precio || 0))}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <select
                                value={product.estado}
                                disabled={updatingId === product.id}
                                onChange={(event) => updateStatus(product, event.target.value as VendorProduct['estado'])}
                                className="h-9 rounded-lg border border-[#d6c3b0]/50 bg-[#f6f2f4] px-2 text-[12px] font-semibold text-[#524535] outline-none focus:ring-2 focus:ring-[#845400]/20"
                                aria-label={`Cambiar estado de ${product.nombre}`}
                              >
                                <option value="BORRADOR">Borrador</option>
                                <option value="ACTIVA">Activa</option>
                                <option value="INACTIVA">Inactiva</option>
                              </select>
                              <Link
                                to={`/vendor/catalog/${product.id}/edit`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#845400] transition hover:bg-[#ffb347]/20"
                                title="Editar"
                                aria-label={`Editar ${product.nombre}`}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product)}
                                disabled={updatingId === product.id}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#93000a] transition hover:bg-[#ffdad6]"
                                title="Eliminar"
                                aria-label={`Eliminar ${product.nombre}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[#d6c3b0]/10 bg-white px-6 py-5 sm:flex-row">
                <p className="text-[14px] text-[#524535]">
                  Mostrando <span className="font-semibold text-[#845400]">{filteredProducts.length}</span> de{' '}
                  <span className="font-semibold text-[#845400]">{products.length}</span> productos
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

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#d6c3b0]/30 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#96f0db] text-[#00705f]">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Stock Total</p>
                <p className="font-auth-display text-[26px] font-bold text-[#845400]">{stats.stock} <span className="text-[14px] font-normal text-[#524535]">unidades</span></p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#d6c3b0]/30 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb347] text-[#704700]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Valor Inventario</p>
                <p className="font-auth-display text-[26px] font-bold text-[#845400]">{currency.format(stats.value)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#d6c3b0]/30 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Alertas Críticas</p>
                <p className="font-auth-display text-[26px] font-bold text-[#93000a]">{stats.alerts} <span className="text-[14px] font-normal text-[#524535]">artículos</span></p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
