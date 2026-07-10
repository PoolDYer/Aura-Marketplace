import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  CheckCircle2,
  Mic,
  Plus,
  TriangleAlert,
} from 'lucide-react';

import { AuraHeader } from '../components/AuraHeader';
import { productsApi } from '../api/products';
import { useAgentStore } from '../store/agentStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

type ProductImage = { url: string };

type CatalogProduct = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  imagenes?: ProductImage[];
  inventario?: { cantidad?: number; cantidadReservada?: number };
  promociones?: Array<{ porcentajeDescuento?: number | string }>;
  categoria?: { nombre?: string } | string;
  categoriaNombre?: string;
};

type CatalogCard = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioLabel: string;
  imageUrl?: string;
  badge: string;
  badgeTone: 'available' | 'low' | 'none';
  categoryLabel: string;
  stock: number;
  searchText: string;
};

type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc' | 'novedades';

function formatPrice(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: string | number) {
  return `$${formatPrice(value).toFixed(2)}`;
}

function getAvailableStock(product: CatalogProduct) {
  const total = product.inventario?.cantidad ?? 0;
  const reserved = product.inventario?.cantidadReservada ?? 0;
  return Math.max(total - reserved, 0);
}

function getCategoryLabel(product: CatalogProduct) {
  const category =
    typeof product.categoria === 'string'
      ? product.categoria
      : product.categoria?.nombre || product.categoriaNombre;

  return category || 'Sin categoria';
}

function getBadge(stock: number, product: CatalogProduct) {
  if (stock <= 0) return { badge: 'Sin stock', tone: 'none' as const };
  if (stock <= 8 || (product.promociones?.length ?? 0) > 0) return { badge: 'Poco Stock', tone: 'low' as const };
  return { badge: 'Disponible', tone: 'available' as const };
}

function ProductImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f6f2f4] px-6 text-center text-[13px] font-medium text-[#845400]">
      {label}
    </div>
  );
}

function buildCard(product: CatalogProduct, index: number): CatalogCard {
  const stock = getAvailableStock(product);
  const categoryLabel = getCategoryLabel(product);
  const badgeInfo = getBadge(stock, product);
  const price = formatPrice(product.precio);

  return {
    id: product.id || String(index),
    nombre: product.nombre,
    descripcion: product.descripcion || '',
    precio: price,
    precioLabel: formatCurrency(price),
    imageUrl: product.imagenes?.[0]?.url,
    badge: badgeInfo.badge,
    badgeTone: badgeInfo.tone,
    categoryLabel,
    stock,
    searchText: [
      product.nombre,
      product.descripcion,
      categoryLabel,
      typeof product.categoria === 'string' ? product.categoria : product.categoria?.nombre,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchCart, addItem } = useCartStore();
  const { toggleChat } = useAgentStore();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set());
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevancia');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await productsApi.getProducts();
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading catalog products', error);
        setProducts([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => undefined);
    }
  }, [fetchCart, isAuthenticated]);

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  const cards = useMemo(() => products.map((product, index) => buildCard(product, index)), [products]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(cards.map((card) => card.categoryLabel))).sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const visibleCards = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const searchNeedle = search.trim().toLowerCase();

    const filtered = cards.filter((card) => {
      const matchesSearch = searchNeedle.length === 0 || card.searchText.includes(searchNeedle);
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(card.categoryLabel);
      const matchesStock = !onlyStock || card.stock > 0;
      const matchesMin = min == null || card.precio >= min;
      const matchesMax = max == null || card.precio <= max;

      return matchesSearch && matchesCategory && matchesStock && matchesMin && matchesMax;
    });

    const sorted = [...filtered];
    if (sortBy === 'precio-asc') sorted.sort((a, b) => a.precio - b.precio);
    if (sortBy === 'precio-desc') sorted.sort((a, b) => b.precio - a.precio);
    if (sortBy === 'novedades') sorted.reverse();

    return sorted;
  }, [cards, maxPrice, minPrice, onlyStock, search, selectedCategories, sortBy]);

  const handleSearch = (query: string) => {
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  const handleAddItem = async (card: CatalogCard) => {
    if (!isAuthenticated || user?.rol !== 'COMPRADOR') {
      navigate('/login');
      return;
    }

    if (card.stock <= 0) return;

    try {
      await addItem(card.id, 1, {
        nombre: card.nombre,
        precio: card.precio,
        imageUrl: card.imageUrl,
        stock: card.stock,
      });
      navigate('/cart');
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <AuraHeader searchValue={search} onSearchChange={setSearch} onSearchSubmit={handleSearch} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:flex-row md:gap-8 md:px-8 md:py-8">
        <aside className="hidden w-full flex-shrink-0 flex-col gap-6 md:flex md:w-64">
          <div className="text-[14px] font-semibold tracking-wide text-[#211527]">Filtros</div>

          <div className="border-b border-[#d6c3b0]/30 pb-4">
            <div className="mb-3 text-[13px] font-semibold text-[#211527]">Categoria</div>
            <div className="flex flex-col gap-2">
              {categoryOptions.length === 0 ? (
                <p className="text-[13px] text-[#524535]">Sin categorias registradas</p>
              ) : (
                categoryOptions.map((category) => (
                  <label key={category} className="flex cursor-pointer items-center gap-2 text-[13px] text-[#524535] transition-colors hover:text-[#845400]">
                    <input type="checkbox" checked={selectedCategories.has(category)} onChange={() => toggleCategory(category)} className="rounded border-[#d6c3b0] text-[#845400] focus:ring-[#845400]" />
                    <span>{category}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="border-b border-[#d6c3b0]/30 pb-4">
            <div className="mb-3 text-[13px] font-semibold text-[#211527]">Precio</div>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="w-full rounded-lg border-0 bg-[#f6f2f4] px-3 py-2 text-[13px] text-[#211527] outline-none ring-1 ring-transparent placeholder:text-[#524535]/50 focus:ring-[#845400]/25" />
              <span className="text-[#524535]">-</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="w-full rounded-lg border-0 bg-[#f6f2f4] px-3 py-2 text-[13px] text-[#211527] outline-none ring-1 ring-transparent placeholder:text-[#524535]/50 focus:ring-[#845400]/25" />
            </div>
          </div>

          <div>
            <div className="mb-3 text-[13px] font-semibold text-[#211527]">Disponibilidad</div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#524535] transition-colors hover:text-[#845400]">
              <input type="checkbox" checked={onlyStock} onChange={(event) => setOnlyStock(event.target.checked)} className="rounded border-[#d6c3b0] text-[#845400] focus:ring-[#845400]" />
              <span>En stock</span>
            </label>
          </div>
        </aside>

        <section className="flex-1">
          <h1 className="sr-only">Catálogo de Productos</h1>

          <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-[#d6c3b0]/10 bg-white px-4 py-3 shadow-sm">
            <span className="text-[12px] text-[#524535] md:text-[13px]">
              Mostrando {visibleCards.length} de {cards.length} productos
            </span>

            <div className="flex items-center gap-2">
              <span className="hidden text-[12px] text-[#524535] sm:inline">Ordenar por:</span>
              <div className="relative">
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="cursor-pointer appearance-none rounded-lg border-0 bg-[#f6f2f4] px-3 py-2 pr-9 text-[13px] text-[#211527] outline-none ring-1 ring-transparent focus:ring-[#845400]/25">
                  <option value="relevancia">Relevancia</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="novedades">Novedades</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#524535]" />
              </div>
            </div>
          </div>

          {visibleCards.length === 0 ? (
            <div className="rounded-[18px] border border-[#d6c3b0]/10 bg-white p-8 text-center text-[#524535] shadow-sm">
              No hay productos activos que coincidan con los filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCards.map((card) => (
                <article key={card.id} className="group flex flex-col overflow-hidden rounded-[18px] border border-[#d6c3b0]/10 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <Link to={`/products/${card.id}`} className="block">
                    <div className="relative h-64 overflow-hidden bg-[#f6f2f4]">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt={card.nombre} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <ProductImagePlaceholder label="Sin imagen registrada" />
                      )}
                      <div
                        className={cn(
                          'absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium backdrop-blur-sm',
                          card.badgeTone === 'available'
                            ? 'bg-[#96f0db]/80 text-[#005144]'
                            : card.badgeTone === 'low'
                              ? 'border border-[#ffb347]/30 bg-[#ffb347]/20 text-[#704700]'
                              : 'bg-[#e5e1e3]/80 text-[#524535]',
                        )}
                      >
                        {card.badgeTone === 'available' ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        {card.badgeTone === 'low' ? <TriangleAlert className="h-3.5 w-3.5" /> : null}
                        <span>{card.badge}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="line-clamp-1 text-[16px] font-semibold text-[#211527]">{card.nombre}</h2>
                    {card.descripcion ? <p className="mt-1 line-clamp-2 min-h-[40px] text-[12px] leading-5 text-[#524535]">{card.descripcion}</p> : null}

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[20px] font-semibold text-[#845400]">{card.precioLabel}</p>
                        {card.stock > 0 ? <p className="text-[11px] text-[#524535]">Stock: {card.stock}</p> : <p className="text-[11px] text-[#524535]">Sin stock</p>}
                      </div>
                      <button type="button" onClick={() => handleAddItem(card)} disabled={card.stock <= 0} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f1edef] text-[#845400] transition-colors hover:bg-[#845400] hover:text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Agregar ${card.nombre}`}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-8 border-t border-[#d6c3b0]/20 bg-[#f1edef] px-4 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 text-center">
          <span className="font-auth-display text-[40px] font-bold leading-none text-[#845400]">Aura</span>
          <p className="text-[12px] text-[#524535]">© 2024 Aura Commerce.</p>
        </div>
      </footer>

      <button type="button" onClick={toggleChat} className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb95a] to-[#006b5b] text-white shadow-[0_10px_25px_rgba(46,28,54,0.24)] transition-transform hover:scale-105 md:hidden" aria-label="Abrir asistente de voz">
        <Mic className="h-6 w-6" />
      </button>
    </div>
  );
}
