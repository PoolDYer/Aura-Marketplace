import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  Edit3,
  Heart,
  Mic,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Star,
  StarHalf,
} from 'lucide-react';

import { AuraHeader } from '../components/AuraHeader';
import { productsApi } from '../api/products';
import api from '../lib/axios';
import { useAgentStore } from '../store/agentStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

type ProductImage = { url: string };

type ProductRecord = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  imagenes?: ProductImage[];
  inventario?: { cantidad?: number; cantidadReservada?: number };
  promociones?: Array<{ porcentajeDescuento?: number | string }>;
  categoria?: { nombre?: string } | string;
  categoriaNombre?: string;
  vendedor?: { id?: string; nombre?: string };
  estado?: string;
};

type ReviewRecord = {
  id: string;
  calificacion: number;
  comentario?: string;
  comprador?: { nombre?: string };
};

function formatPrice(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: string | number) {
  return `$${formatPrice(value).toFixed(2)}`;
}

function getAvailableStock(product: ProductRecord) {
  const total = product.inventario?.cantidad ?? 0;
  const reserved = product.inventario?.cantidadReservada ?? 0;
  return Math.max(total - reserved, 0);
}

function getImageUrls(product: ProductRecord) {
  return Array.from(new Set(product.imagenes?.map((image) => image.url).filter(Boolean) ?? []));
}

function getCategoryName(product: ProductRecord) {
  return typeof product.categoria === 'string'
    ? product.categoria
    : product.categoria?.nombre || product.categoriaNombre || 'Productos';
}

function computeAverageRating(reviews: ReviewRecord[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, review) => sum + review.calificacion, 0) / reviews.length;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => {
    const filled = rating >= index + 1;
    const half = !filled && rating > index && rating < index + 1;

    return half ? (
      <StarHalf key={index} className="h-4 w-4 fill-current text-[#006b5b]" />
    ) : (
      <Star key={index} className={cn('h-4 w-4', filled ? 'fill-current text-[#006b5b]' : 'text-[#d6c3b0]')} />
    );
  });
}

function ProductImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f6f2f4] px-6 text-center text-[14px] font-medium text-[#845400]">
      {label}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleChat } = useAgentStore();

  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewError, setReviewError] = useState('');
  const [cartError, setCartError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewScore, setReviewScore] = useState('5');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setNotFound(false);
      try {
        const [productResponse, reviewResponse] = await Promise.allSettled([
          productsApi.getProductById(id),
          api.get(`/products/${id}/reviews`),
        ]);

        if (productResponse.status === 'fulfilled') {
          setProduct(productResponse.value.data || null);
          setNotFound(!productResponse.value.data);
        } else {
          setProduct(null);
          setNotFound(true);
        }

        if (reviewResponse.status === 'fulfilled') {
          setReviews(Array.isArray(reviewResponse.value.data) ? reviewResponse.value.data : []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error loading product detail', error);
        setProduct(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

  useEffect(() => {
    let active = true;

    if (!id || !hasHydrated || !isAuthenticated || user?.rol !== 'COMPRADOR') {
      setIsFavorite(false);
      return () => {
        active = false;
      };
    }

    api
      .get('/favorites')
      .then((response) => {
        if (!active) return;

        const favorites = Array.isArray(response.data) ? response.data : [];
        setIsFavorite(
          favorites.some((favorite) => favorite.publicacionId === id || favorite.publicacion?.id === id),
        );
      })
      .catch(() => {
        if (active) setIsFavorite(false);
      });

    return () => {
      active = false;
    };
  }, [hasHydrated, id, isAuthenticated, user?.rol]);

  const imageUrls = useMemo(() => (product ? getImageUrls(product) : []), [product]);
  const selectedImage = imageUrls[selectedImageIndex] ?? imageUrls[0];
  const stock = product ? getAvailableStock(product) : 0;
  const price = product ? formatPrice(product.precio) : 0;
  const avgRating = computeAverageRating(reviews);
  const activePromotion = product?.promociones?.[0];
  const discount = Number(activePromotion?.porcentajeDescuento || 0);
  const categoryName = product ? getCategoryName(product) : '';
  const isBuyerExperience = !isAuthenticated || user?.rol === 'COMPRADOR';
  const isVendorExperience = isAuthenticated && user?.rol === 'VENDEDOR';
  const isOwnVendorProduct = isVendorExperience && product?.vendedor?.id === user?.id;

  const handleAddToCart = async () => {
    setCartError('');

    if (!product || !hasHydrated) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.rol !== 'COMPRADOR') {
      setCartError('Tu cuenta esta activa, pero solo los compradores pueden agregar productos al carrito.');
      return;
    }

    if (stock <= 0) return;

    try {
      await addItem(product.id, 1, {
        nombre: product.nombre,
        precio: product.precio,
        imageUrl: imageUrls[0],
        stock,
      });
      navigate('/cart');
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFavorite = async () => {
    setFavoriteError('');

    if (!product || !hasHydrated || favoriteLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.rol !== 'COMPRADOR') {
      setFavoriteError('Solo los compradores pueden guardar productos como favoritos.');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${product.id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { publicacionId: product.id });
        setIsFavorite(true);
      }
    } catch (error: any) {
      setFavoriteError(error.response?.data?.message || 'No pudimos actualizar tus favoritos.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewError('');

    if (!id) return;

    try {
      await api.post(`/products/${id}/reviews`, {
        calificacion: Number(reviewScore),
        comentario: reviewText,
      });

      const response = await api.get(`/products/${id}/reviews`);
      setReviews(Array.isArray(response.data) ? response.data : []);
      setReviewText('');
      setReviewScore('5');
    } catch (error: any) {
      setReviewError(error.response?.data?.message || 'Error al enviar resena');
    }
  };

  if (loading || !hasHydrated) {
    return (
      <div className="min-h-screen bg-[#FAF6F8] px-4 py-12 text-[#524535]">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-[28px] border border-[#d6c3b0]/20 bg-white px-6 py-20 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#845400]/20" />
            <p className="font-auth-display text-[22px] font-semibold text-[#845400]">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#FAF6F8] px-4 py-12 text-[#524535]">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-[28px] border border-[#d6c3b0]/20 bg-white px-6 py-20 shadow-sm">
          <div className="text-center">
            <p className="font-auth-display text-[26px] font-semibold text-[#845400]">Producto no encontrado</p>
            <p className="mt-2 text-sm">No existe una publicacion activa en la base de datos para este enlace.</p>
            <button type="button" onClick={() => navigate('/catalog')} className="mt-6 rounded-full bg-[#845400] px-6 py-3 text-sm font-semibold text-white">
              Volver al catalogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <AuraHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
        <nav className="hidden items-center gap-2 text-[12px] font-medium text-[#524535] md:flex">
          <Link to="/catalog" className="hover:text-[#845400]">Catalogo</Link>
          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
          <Link to="/catalog" className="hover:text-[#845400]">{categoryName}</Link>
          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
          <span className="font-semibold text-[#845400]">{product.nombre}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-12">
          <section className="md:col-span-6 lg:col-span-7">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-[18px] border border-[#d6c3b0]/20 bg-white shadow-sm">
              {selectedImage ? (
                <img src={selectedImage} alt={product.nombre} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <ProductImagePlaceholder label="Sin imagen registrada" />
              )}
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#524535] shadow-sm backdrop-blur-sm">
                  <span className={cn('h-2 w-2 rounded-full', stock > 0 ? 'bg-[#006b5b]' : 'bg-[#d6c3b0]')} />
                  {stock > 0 ? 'Disponible' : 'Sin stock'}
                </span>
                {discount > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#ffb347] px-3 py-1.5 text-[12px] font-medium text-[#704700] shadow-sm">
                    -{discount}% promocion
                  </span>
                ) : null}
              </div>
            </div>

            {imageUrls.length > 1 ? (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {imageUrls.map((imageUrl, index) => (
                  <button key={imageUrl} type="button" onClick={() => setSelectedImageIndex(index)} className={cn('group relative aspect-square overflow-hidden rounded-[16px] border bg-white shadow-sm transition-colors', selectedImageIndex === index ? 'border-[#845400]' : 'border-[#d6c3b0]/20 hover:border-[#845400]/50')}>
                    <img src={imageUrl} alt={`${product.nombre} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="md:col-span-6 lg:col-span-5 md:sticky md:top-24 md:self-start">
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-2 flex items-center gap-1 text-[#006b5b]">
                  {renderStars(avgRating)}
                  <a href="#reviews" className="ml-2 text-[12px] font-medium text-[#524535] underline hover:text-[#845400]">
                    {reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} resenas)` : 'Sin resenas'}
                  </a>
                </div>
                <h1 className="font-auth-display text-[34px] font-bold leading-tight tracking-tight text-[#1c1b1d] md:text-[40px]">{product.nombre}</h1>
                <div className="mt-2 flex items-end gap-3">
                  <span className="font-auth-display text-[28px] font-semibold text-[#845400]">{formatCurrency(price)}</span>
                </div>
              </div>

              {product.descripcion ? <p className="text-[16px] leading-7 text-[#524535]">{product.descripcion}</p> : null}

              <div className="rounded-[18px] border border-[#d6c3b0]/20 bg-white p-4 text-sm text-[#524535] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#d6c3b0]/20 pb-3">
                  <span>Categoria</span>
                  <span className="font-semibold text-[#211527]">{categoryName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#d6c3b0]/20 py-3">
                  <span>Stock disponible</span>
                  <span className="font-semibold text-[#211527]">{stock}</span>
                </div>
                {product.vendedor?.nombre ? (
                  <div className="flex items-center justify-between pt-3">
                    <span>Vendedor</span>
                    <span className="font-semibold text-[#211527]">{product.vendedor.nombre}</span>
                  </div>
                ) : null}
              </div>

              {isBuyerExperience ? (
                <div className="pt-1">
                  <button type="button" onClick={handleAddToCart} disabled={stock <= 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffb347] px-6 py-4 font-auth-display text-[18px] font-semibold text-[#704700] shadow-sm transition-transform hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
                    <ShoppingBag className="h-5 w-5" />
                    {stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className={cn(
                      'mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 font-auth-display text-[16px] font-semibold shadow-sm transition-colors active:scale-[0.99] disabled:cursor-wait disabled:opacity-60',
                      isFavorite
                        ? 'border-[#93000a]/20 bg-[#ffdad6] text-[#93000a] hover:bg-[#ffd0cb]'
                        : 'border-[#d6c3b0]/30 bg-white text-[#845400] hover:border-[#845400]/35 hover:bg-[#f6f2f4]',
                    )}
                  >
                    <Heart className={cn('h-5 w-5', isFavorite ? 'fill-current' : '')} />
                    {favoriteLoading ? 'Guardando...' : isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                  </button>
                  {cartError ? <p className="mt-3 text-center text-sm text-[#b42318]">{cartError}</p> : null}
                  {favoriteError ? <p className="mt-3 text-center text-sm text-[#b42318]">{favoriteError}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[12px] text-[#524535]">
                    <ShieldCheck className="h-4 w-4" />
                    Pago protegido al finalizar la compra
                  </div>
                </div>
              ) : null}

              {isVendorExperience ? (
                <div className="rounded-[18px] border border-[#d6c3b0]/25 bg-white p-4 shadow-sm">
                  <div className="mb-4">
                    <p className="font-auth-display text-[20px] font-semibold text-[#845400]">Vista de vendedor</p>
                    <p className="mt-1 text-[13px] leading-5 text-[#524535]">
                      {isOwnVendorProduct
                        ? 'Esta es la ficha publica de tu producto. Gestiona precio, stock, imagenes y estado desde tu catalogo.'
                        : `Este producto pertenece a ${product.vendedor?.nombre || 'otro vendedor'}. Puedes revisarlo como referencia sin acciones de compra.`}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {isOwnVendorProduct ? (
                      <Link
                        to={`/vendor/catalog/${product.id}/edit`}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-4 font-auth-display text-[16px] font-semibold text-[#704700] shadow-sm transition hover:brightness-95 active:scale-[0.99]"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Link>
                    ) : (
                      <Link
                        to="/vendor/catalog"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb347] px-4 font-auth-display text-[16px] font-semibold text-[#704700] shadow-sm transition hover:brightness-95 active:scale-[0.99]"
                      >
                        <PackageSearch className="h-4 w-4" />
                        Mi catalogo
                      </Link>
                    )}

                    <Link
                      to="/vendor/orders"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#d6c3b0]/40 bg-white px-4 font-auth-display text-[16px] font-semibold text-[#845400] shadow-sm transition hover:border-[#845400]/35 hover:bg-[#f6f2f4] active:scale-[0.99]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Pedidos
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section id="reviews" className="border-t border-[#d6c3b0]/30 pt-8 md:pt-10">
          <h2 className="mb-6 font-auth-display text-[28px] font-semibold text-[#1c1b1d] md:text-[32px]">Voces de la comunidad</h2>

          {reviews.length === 0 ? (
            <div className="rounded-[18px] border border-[#d6c3b0]/20 bg-white p-4 text-sm text-[#524535] shadow-sm">
              Este producto aun no tiene resenas registradas.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-[18px] border border-[#d6c3b0]/20 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-1 text-[#006b5b]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={cn('h-4 w-4', index < review.calificacion ? 'fill-current text-[#006b5b]' : 'text-[#d6c3b0]')} />
                        ))}
                      </div>
                      {review.comentario ? <p className="text-[14px] leading-6 text-[#524535]">{review.comentario}</p> : null}
                    </div>
                    <span className="rounded-full bg-[#f6f2f4] px-3 py-1 text-[12px] font-medium text-[#845400]">
                      {review.comprador?.nombre || 'Comprador'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {user?.rol === 'COMPRADOR' ? (
            <form onSubmit={handleSubmitReview} className="mt-6 rounded-[18px] border border-[#d6c3b0]/20 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="font-auth-display text-[22px] font-semibold text-[#1c1b1d]">Escribir una resena</h3>
                <div className="rounded-full bg-[#f6f2f4] px-3 py-1 text-[12px] text-[#524535]">Solo compradores</div>
              </div>

              {reviewError ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{reviewError}</div> : null}

              <div className="mb-4 flex items-center gap-3">
                <label className="text-[13px] font-medium text-[#211527]">Calificacion</label>
                <select value={reviewScore} onChange={(event) => setReviewScore(event.target.value)} className="rounded-lg border-0 bg-[#f6f2f4] px-3 py-2 text-[13px] text-[#211527] outline-none ring-1 ring-transparent focus:ring-[#845400]/25">
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}
                </select>
              </div>

              <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} rows={3} placeholder="Que te parecio este producto?" className="w-full rounded-[14px] border-0 bg-[#f6f2f4] px-4 py-3 text-[14px] text-[#211527] outline-none ring-1 ring-transparent placeholder:text-[#524535]/50 focus:ring-[#845400]/25" />

              <button type="submit" className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#845400] px-5 py-3 font-auth-display text-[16px] font-semibold text-white transition-transform hover:bg-[#704700] active:scale-[0.99]">
                Enviar resena
              </button>
            </form>
          ) : null}
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
