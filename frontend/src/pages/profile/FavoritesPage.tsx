import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartMinus, ImageIcon, Mic, ShoppingBag, SlidersHorizontal, Sparkles } from 'lucide-react';

import api from '../../lib/axios';
import { useAgentStore } from '../../store/agentStore';
import { useCartStore } from '../../store/cartStore';

type FavoriteRecord = {
  id: string;
  publicacionId: string;
  publicacion?: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: string | number;
    imagenes?: Array<{ url: string }>;
    inventario?: { cantidad?: number; cantidadReservada?: number };
  };
};

type SortMode = 'recent' | 'price-asc' | 'price-desc';

const getAvailableStock = (favorite: FavoriteRecord) => {
  const inventory = favorite.publicacion?.inventario;
  return Math.max(0, Number(inventory?.cantidad ?? 0) - Number(inventory?.cantidadReservada ?? 0));
};

const formatPrice = (value: string | number | undefined) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
};

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toggleChat } = useAgentStore();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    api
      .get('/favorites')
      .then((res) => setFavorites(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const sortedFavorites = useMemo(() => {
    const next = [...favorites];
    if (sortMode === 'price-asc') {
      next.sort((a, b) => Number(a.publicacion?.precio ?? 0) - Number(b.publicacion?.precio ?? 0));
    }
    if (sortMode === 'price-desc') {
      next.sort((a, b) => Number(b.publicacion?.precio ?? 0) - Number(a.publicacion?.precio ?? 0));
    }
    return next;
  }, [favorites, sortMode]);

  const removeFavorite = async (publicacionId: string) => {
    try {
      await api.delete(`/favorites/${publicacionId}`);
      loadFavorites();
    } catch {
      alert('Error eliminando favorito');
    }
  };

  const handleAddToCart = async (favorite: FavoriteRecord) => {
    const product = favorite.publicacion;
    if (!product || getAvailableStock(favorite) <= 0) return;

    await addItem(product.id, 1, {
      nombre: product.nombre,
      precio: product.precio,
      imageUrl: product.imagenes?.[0]?.url,
      stock: getAvailableStock(favorite),
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ffb347] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#1c1b1d]">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-1 font-auth-display text-[32px] font-bold leading-10 text-[#1c1b1d] md:text-[40px] md:leading-[48px]">
              Mis Favoritos
            </h1>
            <p className="text-[16px] leading-6 text-[#524535]">
              Una seleccion curada de tus piezas preferidas.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSortMode((current) =>
                current === 'recent' ? 'price-asc' : current === 'price-asc' ? 'price-desc' : 'recent',
              )
            }
            className="flex w-fit items-center gap-2 rounded-full bg-[#ebe7e9] px-4 py-2 text-[14px] text-[#1c1b1d] transition-colors hover:bg-[#e5e1e3]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Ordenar
          </button>
        </div>

        {sortedFavorites.length === 0 ? (
          <section className="rounded-[24px] border border-dashed border-[#d6c3b0] bg-white p-10 text-center md:p-16">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#ffb347]/20 text-[#845400]">
              <HeartMinus className="h-10 w-10" />
            </div>
            <h2 className="font-auth-display text-[24px] font-semibold text-[#1c1b1d]">No tienes favoritos aun</h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#524535]">
              Explora el catalogo y guarda los productos que mas te gusten.
            </p>
            <Link
              to="/catalog"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#845400] px-6 py-3 text-[14px] font-semibold text-white"
            >
              Explorar catalogo
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedFavorites.map((favorite, index) => {
              const product = favorite.publicacion;
              const stock = getAvailableStock(favorite);
              const isAvailable = stock > 0;
              const badge =
                stock <= 0 ? 'Agotado' : stock <= 5 ? 'Pocas unidades' : 'Disponible';

              if (!product) return null;

              return (
                <article
                  key={favorite.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#ebe7e9] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d6c3b0] hover:shadow-[0_14px_34px_rgba(132,84,0,0.12)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f6f2f4]">
                    <Link to={`/products/${favorite.publicacionId}`} className="block h-full w-full">
                      {product.imagenes?.[0]?.url ? (
                        <img
                          src={product.imagenes[0].url}
                          alt={product.nombre}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#524535]">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeFavorite(favorite.publicacionId)}
                      className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[#93000a] shadow-sm backdrop-blur-md transition-colors hover:bg-[#ffdad6]"
                      aria-label={`Eliminar ${product.nombre} de favoritos`}
                    >
                      <HeartMinus className="h-5 w-5 fill-current" />
                    </button>

                    <div className="absolute bottom-1 left-2">
                      <span
                        className={`rounded-lg px-2 py-1 text-[12px] ${
                          isAvailable
                            ? stock <= 5
                              ? 'bg-[#ffddb6] text-[#643f00]'
                              : 'bg-[#96f0db] text-[#00705f]'
                            : 'bg-[#e5e1e3] text-[#524535]'
                        }`}
                      >
                        {badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-4">
                    <div>
                      <Link
                        to={`/products/${favorite.publicacionId}`}
                        className="block truncate font-auth-display text-[20px] font-semibold leading-7 text-[#1c1b1d] hover:text-[#845400]"
                      >
                        {product.nombre}
                      </Link>
                      <p className="line-clamp-2 text-[14px] leading-5 text-[#524535]">
                        {product.descripcion || 'Producto guardado en tu lista personal.'}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="font-auth-body text-[14px] font-semibold text-[#845400]">
                        {formatPrice(product.precio)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(favorite)}
                        disabled={!isAvailable}
                        className={`flex items-center gap-1 rounded-full px-3 py-2 text-[12px] font-semibold transition-colors active:scale-95 ${
                          isAvailable
                            ? 'bg-[#ffb347] text-[#704700] hover:bg-[#ffddb6]'
                            : 'cursor-not-allowed bg-[#ebe7e9] text-[#C9B8CE]'
                        }`}
                        aria-label={`${isAvailable ? 'Anadir' : 'No disponible'} ${product.nombre}`}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {isAvailable ? 'Anadir' : 'Avisar'}
                      </button>
                    </div>
                  </div>

                  {index === 3 ? (
                    <span className="sr-only">Sugerencia de Aura disponible despues de esta fila</span>
                  ) : null}
                </article>
              );
            })}

            <section className="flex flex-col items-start gap-6 rounded-2xl border border-dashed border-[#d6c3b0] bg-[#f6f2f4] p-8 lg:col-span-2">
              <div className="space-y-3">
                <p className="font-auth-body text-[13px] font-semibold uppercase tracking-[0.18em] text-[#845400]">
                  Buscas algo mas?
                </p>
                <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#1c1b1d]">
                  Tu asistente Aura puede ayudarte a encontrar lo que amas.
                </h2>
              </div>
              <button
                type="button"
                onClick={toggleChat}
                className="inline-flex items-center gap-2 rounded-full bg-[#845400] px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#704700]"
              >
                <Mic className="h-5 w-5" />
                Preguntale a Aura
              </button>
              <div className="ml-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#ffb347]/30">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#845400] shadow-lg">
                  <Sparkles className="h-10 w-10 fill-current" />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
