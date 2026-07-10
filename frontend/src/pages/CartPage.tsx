import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { AuraHeader } from '../components/AuraHeader';
import api from '../lib/axios';
import { cn } from '../lib/utils';
import { useCartStore } from '../store/cartStore';

type AppliedCoupon = {
  codigo: string;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  descuento: string | number;
};

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    error,
    fetchCart,
    isLoading,
    lastAddedAt,
    lastAddedPublicacionId,
    lastAddedPreview,
    removeItem,
    updateQuantity,
    clearCart,
    getCartItemsCount,
    getCartTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  const recentAddedItem = useMemo(() => {
    if (!cart || !lastAddedPublicacionId || !lastAddedAt) {
      return null;
    }

    const age = Date.now() - lastAddedAt;
    if (age > 90_000) {
      return null;
    }

    return cart.items.find((item) => item.publicacionId === lastAddedPublicacionId) ?? null;
  }, [cart, lastAddedAt, lastAddedPublicacionId]);

  const optimisticItems = useMemo(() => {
    if (cart && cart.items.length > 0) {
      return cart.items;
    }

    if (!lastAddedPreview || !lastAddedAt || Date.now() - lastAddedAt > 5 * 60 * 1000) {
      return [];
    }

    return [
      {
        id: `preview-${lastAddedPreview.publicacionId}`,
        carritoId: 'preview',
        publicacionId: lastAddedPreview.publicacionId,
        cantidad: lastAddedPreview.cantidad,
        agregadoAt: new Date(lastAddedAt).toISOString(),
        publicacion: {
          id: lastAddedPreview.publicacionId,
          nombre: lastAddedPreview.nombre,
          precio: String(lastAddedPreview.precio),
          inventario: {
            cantidad: lastAddedPreview.stock ?? 0,
            cantidadReservada: 0,
          },
          imagenes: lastAddedPreview.imageUrl ? [{ url: lastAddedPreview.imageUrl }] : [],
        },
      },
    ];
  }, [cart, lastAddedAt, lastAddedPreview]);

  const recentAddedLabel = recentAddedItem?.publicacion.nombre ?? lastAddedPreview?.nombre ?? '';

  const subtotal = getCartTotal();
  const hasVisibleItems = optimisticItems.length > 0;
  const shipping = hasVisibleItems ? 15 : 0;
  const discountBase =
    appliedCoupon?.tipo === 'PORCENTAJE'
      ? subtotal * (Number(appliedCoupon.descuento) / 100)
      : Number(appliedCoupon?.descuento ?? 0);
  const discount = Math.min(subtotal, discountBase || 0);
  const total = Math.max(subtotal + shipping - discount, 0);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponError('Ingresa un cupón válido.');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await api.post('/coupons/apply', { codigo: code });
      setAppliedCoupon(response.data.cupon);
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'No se pudo validar el cupón.');
    } finally {
      setCouponLoading(false);
    }
  };

  const emptyState = !isLoading && !hasVisibleItems;

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <AuraHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,185,90,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(0,107,91,0.08),_transparent_28%),linear-gradient(180deg,_rgba(250,246,248,1)_0%,_rgba(250,246,248,0.92)_100%)]" />
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <section className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {recentAddedLabel ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[#2E1C36] bg-[#2E1C36] px-4 py-3 text-[#F5EEF0] shadow-[0_12px_30px_rgba(46,28,54,0.18)]">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#ffb95a]/40 bg-[#ffb95a]/10 text-[#ffb95a]">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">
                      "{recentAddedLabel}" se añadió a tu carrito.
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#C9B8CE]">
                      Ya quedó guardado y lo estamos mostrando de inmediato.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {isLoading && !cart ? (
                  <div className="rounded-[24px] border border-[#d6c3b0]/20 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#845400]/20 border-t-[#845400]" />
                    <p className="mt-4 text-[14px] text-[#524535]">Cargando tu carrito...</p>
                  </div>
                ) : emptyState ? (
                  <div className="rounded-[24px] border border-[#d6c3b0]/20 bg-white px-6 py-14 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1edef] text-[#845400]">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                    <h2 className="font-auth-display text-[24px] font-semibold text-[#845400]">
                      Tu carrito está vacío
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-[#524535]">
                      Añade productos desde el catálogo o la ficha de producto y aparecerán aquí
                      listos para revisar.
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigate('/catalog')}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#845400] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#704700]"
                      >
                        Ir al catálogo
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center rounded-full border border-[#d6c3b0]/40 bg-white px-5 py-3 text-[14px] font-semibold text-[#524535] transition-colors hover:border-[#845400]/30 hover:text-[#845400]"
                      >
                        Volver al inicio
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {optimisticItems.map((item) => {
                        const isRecent = item.publicacionId === lastAddedPublicacionId;
                        const availableStock = Math.max(
                          0,
                          Number(item.publicacion.inventario?.cantidad ?? 0) -
                            Number(item.publicacion.inventario?.cantidadReservada ?? 0),
                        );
                        const stockLabel =
                          availableStock > 0 ? `${availableStock} disponibles` : 'Sin stock';
                        const maxReached = availableStock > 0 && item.cantidad >= availableStock;

                        return (
                          <article
                            key={item.id}
                            className={cn(
                              'relative overflow-hidden rounded-[22px] border bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
                              isRecent ? 'border-[#ffb95a] ring-1 ring-[#ffb95a]/40' : 'border-[#eadfd2]',
                            )}
                          >
                            {isRecent ? (
                              <div className="absolute right-4 top-4 rounded-full bg-[#ffb95a] px-3 py-1 text-[11px] font-semibold text-[#704700]">
                                Recién agregado
                              </div>
                            ) : null}

                            <div className="flex flex-col gap-4 sm:flex-row">
                              <div className="h-24 w-24 flex-none overflow-hidden rounded-2xl bg-[#f6f2f4]">
                                {item.publicacion.imagenes?.[0]?.url ? (
                                  <img
                                    src={item.publicacion.imagenes[0].url}
                                    alt={item.publicacion.nombre}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-[#524535]">
                                    Sin imagen
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <h3 className="truncate text-[18px] font-semibold text-[#211527]">
                                      {item.publicacion.nombre}
                                    </h3>
                                    <p className="mt-1 text-[13px] text-[#524535]">
                                      Producto guardado en tu carrito para que termines la compra cuando quieras.
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[12px] font-medium uppercase tracking-wide text-[#524535]">
                                      Precio
                                    </p>
                                    <p className="text-[18px] font-semibold text-[#845400]">
                                      {formatCurrency(Number(item.publicacion.precio))}
                                    </p>
                                    <p className="mt-1 text-[11px] text-[#524535]">{stockLabel}</p>
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="inline-flex items-center rounded-full border border-[#eadfd2] bg-[#fcf8fa] p-1 shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                      disabled={isLoading || item.cantidad <= 1 || item.id.startsWith('preview-')}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#524535] transition-colors hover:bg-[#f1edef] hover:text-[#845400] disabled:cursor-not-allowed disabled:opacity-40"
                                      aria-label={`Disminuir cantidad de ${item.publicacion.nombre}`}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center text-[14px] font-semibold text-[#211527]">
                                      {item.cantidad}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                      disabled={isLoading || item.id.startsWith('preview-') || maxReached}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#524535] transition-colors hover:bg-[#f1edef] hover:text-[#845400] disabled:cursor-not-allowed disabled:opacity-40"
                                      aria-label={`Aumentar cantidad de ${item.publicacion.nombre}`}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    disabled={isLoading || item.id.startsWith('preview-')}
                                    className="inline-flex items-center gap-2 self-start rounded-full border border-transparent px-3 py-2 text-[13px] font-medium text-[#b42318] transition-colors hover:border-[#f9c9c4] hover:bg-[#fff5f4] disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[26px] border border-[#eadfd2] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#845400]">
                      Resumen
                    </p>
                    <h2 className="mt-1 font-auth-display text-[24px] font-semibold text-[#211527]">
                      Tu compra
                    </h2>
                  </div>
                  <div className="rounded-full bg-[#f6f2f4] px-3 py-1 text-[12px] font-medium text-[#524535]">
                    {getCartItemsCount()} artículos
                  </div>
                </div>

                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#eadfd2] bg-[#fcf8fa] p-3">
                  <BadgePercent className="h-4 w-4 text-[#845400]" />
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Código de descuento"
                    className="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#524535]/50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="rounded-full bg-[#845400] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#704700] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {couponLoading ? 'Aplicando...' : 'Aplicar'}
                  </button>
                </div>

                {appliedCoupon ? (
                  <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#96f0db]/50 bg-[#f0fbf8] px-4 py-3 text-[13px] text-[#005144]">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Cupón {appliedCoupon.codigo} aplicado
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="font-semibold underline decoration-[#005144]/30 underline-offset-2"
                    >
                      Quitar
                    </button>
                  </div>
                ) : null}

                {couponError ? (
                  <p className="mb-4 text-[13px] text-[#b42318]">{couponError}</p>
                ) : null}

                <div className="space-y-3 border-b border-[#eadfd2] pb-5">
                  <div className="flex items-center justify-between text-[14px] text-[#524535]">
                    <span>Subtotal ({getCartItemsCount()} artículos)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px] text-[#524535]">
                    <span>Envío estimado</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px] text-[#005144]">
                    <span>Descuento {appliedCoupon ? `(${appliedCoupon.codigo})` : ''}</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[#211527]">Total</span>
                  <span className="font-auth-display text-[30px] font-bold tracking-tight text-[#845400]">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Link
                  to="/checkout/shipping"
                  state={appliedCoupon ? { couponCode: appliedCoupon.codigo } : undefined}
                  className={cn(
                    'mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-5 py-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(132,84,0,0.18)] transition-colors hover:bg-[#704700]',
                    !hasVisibleItems ? 'pointer-events-none cursor-not-allowed opacity-60' : '',
                  )}
                  aria-disabled={!hasVisibleItems}
                >
                  Realizar Pedido
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => navigate('/catalog')}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d6c3b0]/50 bg-white px-5 py-3 text-[14px] font-semibold text-[#524535] transition-colors hover:border-[#845400]/30 hover:text-[#845400]"
                >
                  <CreditCard className="h-4 w-4" />
                  Seguir comprando
                </button>

                <div className="mt-5 rounded-2xl border border-dashed border-[#eadfd2] bg-[#fcf8fa] px-4 py-3 text-[12px] leading-5 text-[#524535]">
                  Revisa cantidades, aplica un cupón y sigue al checkout cuando estés listo.
                </div>

                <button
                  type="button"
                  onClick={() => clearCart()}
                  disabled={!cart || cart.items.length === 0 || isLoading}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-transparent px-4 py-2 text-[13px] font-medium text-[#b42318] transition-colors hover:bg-[#fff5f4] disabled:opacity-50"
                >
                  Vaciar carrito
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
