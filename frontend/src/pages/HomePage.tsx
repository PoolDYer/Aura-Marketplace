import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  LayoutGrid,
  LogOut,
  Mic,
  Plus,
  Sparkles,
} from 'lucide-react';

import { AuraHeader } from '../components/AuraHeader';
import { BrandLogo } from '../components/BrandLogo';
import { productsApi } from '../api/products';
import { authClient } from '../lib/neonAuth';
import { useAgentStore } from '../store/agentStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

type HomeProduct = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  imagenes?: { url: string }[];
  inventario?: { cantidad?: number; cantidadReservada?: number };
};

type FeaturedCard = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  priceValue: number;
  imageUrl?: string;
  stock: number;
  badge: string;
};

function formatPrice(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function getAvailableStock(product: HomeProduct) {
  const total = product.inventario?.cantidad ?? 0;
  const reserved = product.inventario?.cantidadReservada ?? 0;
  return Math.max(total - reserved, 0);
}

function ProductImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f6f2f4] px-6 text-center text-[13px] font-medium text-[#845400]">
      {label}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { fetchCart, addItem } = useCartStore();
  const { toggleChat } = useAgentStore();
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await productsApi.getProducts();
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading home products', error);
        setProducts([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => undefined);
    }
  }, [isAuthenticated, fetchCart]);

  const cards = useMemo<FeaturedCard[]>(() => {
    return products.slice(0, 3).map((product) => {
      const stock = getAvailableStock(product);
      const priceValue = Number(product.precio);

      return {
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: formatPrice(product.precio),
        priceValue: Number.isFinite(priceValue) ? priceValue : 0,
        imageUrl: product.imagenes?.[0]?.url,
        stock,
        badge: stock > 10 ? 'Disponible' : stock > 0 ? 'Poco Stock' : 'Sin Stock',
      };
    });
  }, [products]);

  const heroProduct = cards[0];

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error(error);
    } finally {
      logout();
    }
  };

  const handleSearch = (query: string) => {
    navigate(`/catalog${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  const handleCardAction = async (product: FeaturedCard) => {
    if (!isAuthenticated || user?.rol !== 'COMPRADOR') {
      navigate('/login');
      return;
    }

    if (product.stock <= 0) return;

    try {
      await addItem(product.id, 1, {
        nombre: product.nombre,
        precio: product.priceValue,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
      navigate('/cart');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <AuraHeader searchValue={search} onSearchChange={setSearch} onSearchSubmit={handleSearch} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 md:px-8 md:py-10">
        <section className="flex flex-col items-center justify-center py-8 text-center md:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d6c3b0]/50 bg-white/80 px-4 py-2 text-[12px] font-medium text-[#845400] shadow-sm">
            <Sparkles className="h-4 w-4" />
            Catalogo conectado a la base de datos.
          </div>
          <h1 className="max-w-4xl font-auth-display text-[32px] font-bold leading-tight tracking-tight text-[#845400] md:text-[56px] md:leading-[64px]">
            Explora productos reales publicados en Aura.
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-6 text-[#524535] md:text-[18px] md:leading-7">
            Lo que ves aqui sale directamente de las publicaciones activas registradas.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <Link to={heroProduct ? `/products/${heroProduct.id}` : '/catalog'} className="group relative min-h-[380px] overflow-hidden rounded-[28px] border border-[#d6c3b0]/15 bg-white shadow-sm md:col-span-8">
            {heroProduct?.imageUrl ? (
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${heroProduct.imageUrl}')` }} />
            ) : (
              <div className="absolute inset-0 bg-[#f6f2f4]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#211527]/70 via-[#211527]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-7">
              <div className="inline-flex flex-col items-start rounded-2xl bg-white/80 p-4 backdrop-blur-md">
                <h2 className="font-auth-display text-[24px] font-semibold text-[#845400]">
                  {heroProduct?.nombre || 'Sin productos activos'}
                </h2>
                <span className="mt-1 inline-flex items-center gap-2 text-[14px] text-[#524535]">
                  {heroProduct ? 'Ver producto' : 'Ir al catalogo'} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-6 md:col-span-4">
            <div className="flex min-h-[170px] items-center rounded-[28px] border border-[#d6c3b0]/15 bg-white p-6 shadow-sm">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#845400]">Base de datos</p>
                <h3 className="mt-2 font-auth-display text-[28px] font-semibold text-[#211527]">
                  {products.length} {products.length === 1 ? 'producto activo' : 'productos activos'}
                </h3>
                <p className="mt-2 text-[13px] leading-5 text-[#524535]">
                  No se muestran productos de ejemplo ni respaldos locales.
                </p>
              </div>
            </div>

            <Link to="/catalog" className="flex min-h-[170px] items-center justify-center rounded-[28px] border border-[#d6c3b0]/20 bg-[#f6f2f4] shadow-sm transition-colors hover:border-[#845400]/40">
              <div className="p-4 text-center">
                <LayoutGrid className="mx-auto mb-3 h-12 w-12 text-[#845400]" />
                <h3 className="font-auth-display text-[20px] font-semibold text-[#845400]">Ver catalogo</h3>
                <p className="mt-1 text-[12px] text-[#524535]">Publicaciones activas</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="py-2 md:py-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-auth-display text-[28px] font-semibold text-[#845400]">Novedades</h2>
            <Link to="/catalog" className="hidden text-[14px] font-medium text-[#006b5b] transition-colors hover:text-[#005144] md:inline-flex">
              Ver todo
            </Link>
          </div>

          {cards.length === 0 ? (
            <div className="rounded-[24px] border border-[#d6c3b0]/15 bg-white p-8 text-center text-[#524535] shadow-sm">
              No hay productos activos registrados en la base de datos.
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cards.map((product) => (
                <article key={product.id} className="group flex h-[420px] w-[260px] flex-none flex-col rounded-[24px] border border-[#d6c3b0]/15 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:w-[300px]">
                  <Link to={`/products/${product.id}`} className="block h-[236px] overflow-hidden rounded-2xl bg-[#f6f2f4] md:h-[260px]">
                    <div className="relative h-full w-full overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.nombre} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <ProductImagePlaceholder label="Sin imagen registrada" />
                      )}
                      <div
                        className={cn(
                          'absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold',
                          product.badge === 'Disponible'
                            ? 'bg-[#96f0db] text-[#005144]'
                            : product.badge === 'Poco Stock'
                              ? 'bg-[#ffb347] text-[#704700]'
                              : 'bg-[#e5e1e3] text-[#524535]',
                        )}
                      >
                        {product.badge}
                      </div>
                    </div>
                  </Link>

                  <div className="mt-4 flex min-h-0 flex-1 flex-col">
                    <h4 className="line-clamp-1 text-[16px] font-medium text-[#211527]">{product.nombre}</h4>
                    {product.descripcion ? <p className="mt-1 line-clamp-1 text-[12px] text-[#524535]">{product.descripcion}</p> : null}
                    <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                      <div>
                        <p className="text-[20px] font-semibold text-[#845400]">{product.precio}</p>
                        {product.stock > 0 ? <p className="text-[11px] text-[#524535]">Stock: {product.stock}</p> : null}
                      </div>
                      <button type="button" onClick={() => handleCardAction(product)} disabled={product.stock <= 0} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1edef] text-[#845400] transition-colors hover:bg-[#845400] hover:text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Agregar ${product.nombre}`}>
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

      <footer className="mt-6 border-t border-[#d6c3b0]/20 bg-[#f1edef] px-4 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 text-center">
          <BrandLogo variant="footer" />
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/catalog" className="text-[12px] font-medium text-[#524535]">Privacidad</Link>
            <Link to="/catalog" className="text-[12px] font-medium text-[#524535]">Terminos</Link>
            <Link to="/catalog" className="text-[12px] font-medium text-[#524535]">Envios</Link>
            <Link to="/catalog" className="text-[12px] font-medium text-[#524535]">Contacto</Link>
          </div>
          <p className="text-[12px] text-[#524535]">© 2024 Aura Commerce.</p>
        </div>
      </footer>

      <button type="button" onClick={toggleChat} className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[#2E1C36] text-[#F5EEF0] shadow-[0_10px_30px_rgba(46,28,54,0.25)] transition-transform hover:scale-105" aria-label="Abrir voz">
        <span className="absolute inset-[-4px] -z-10 rounded-full bg-gradient-to-br from-[#ffb95a] to-[#006b5b] opacity-60" />
        <Mic className="h-8 w-8" />
      </button>

      {isAuthenticated ? (
        <div className="fixed left-6 bottom-6 z-20 hidden rounded-full bg-white/85 px-4 py-2 text-[12px] text-[#524535] shadow-sm backdrop-blur md:block">
          Bienvenido, <span className="font-semibold text-[#211527]">{user?.nombre}</span>
          <button type="button" onClick={handleLogout} className="ml-3 inline-flex items-center gap-1 font-medium text-[#845400] hover:underline">
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesion
          </button>
        </div>
      ) : null}
    </div>
  );
}
