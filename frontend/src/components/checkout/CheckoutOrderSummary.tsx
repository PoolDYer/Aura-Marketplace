import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type CheckoutSummaryItem = {
  id: string;
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type CheckoutOrderSummaryProps = {
  items: CheckoutSummaryItem[];
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
  currency?: string;
  couponSlot?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
  };
  className?: string;
};

function formatCurrency(value: number, currency = '$') {
  return `${currency}${value.toFixed(2)}`;
}

function ProductImageFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f6f2f4] px-2 text-center text-[11px] font-medium text-[#845400]">
      Sin imagen
    </div>
  );
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shipping = 0,
  discount = 0,
  total,
  currency = '$',
  couponSlot,
  action,
  className,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className={cn('h-fit lg:sticky lg:top-24', className)}>
      <div className="rounded-[28px] border border-[#d6c3b0]/30 bg-white/80 p-6 shadow-xl backdrop-blur-md md:p-8">
        <h2 className="mb-8 font-auth-display text-[28px] font-semibold leading-9 text-[#1c1b1d]">
          Resumen del Pedido
        </h2>

        <div className="mb-8 flex flex-col gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.productId}`}
              className="group flex items-center gap-4 rounded-2xl transition-colors hover:bg-[#f6f2f4]"
            >
              <div className="h-24 w-20 flex-none overflow-hidden rounded-xl bg-[#e5e1e3]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <ProductImageFallback />
                )}
              </div>

              <div className="min-w-0 flex-1 py-1">
                <h3 className="line-clamp-2 font-auth-display text-[16px] font-bold leading-5 text-[#1c1b1d] group-hover:text-[#845400]">
                  {item.name}
                </h3>
                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-[#524535]">{item.description}</p>
                ) : null}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="font-auth-body text-[13px] text-[#524535]">Cant: {item.quantity}</span>
                  <span className="font-auth-display text-[15px] font-bold text-[#845400]">
                    {formatCurrency(item.subtotal, currency)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-8 flex flex-col gap-2 border-t border-[#d6c3b0]/30 pt-6 text-[14px]">
          <div className="flex justify-between text-[#524535]">
            <span>Subtotal</span>
            <span className="font-auth-body">{formatCurrency(subtotal, currency)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between font-medium text-[#006b5b]">
              <span>Descuento</span>
              <span>-{formatCurrency(discount, currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-[#524535]">
            <span>Envio</span>
            <span className={cn('font-auth-body', shipping === 0 ? 'text-[#006b5b]' : '')}>
              {shipping === 0 ? 'Gratis' : formatCurrency(shipping, currency)}
            </span>
          </div>
          <div className="mt-2 flex justify-between font-auth-display text-[20px] font-semibold text-[#1c1b1d]">
            <span>Total</span>
            <span className="text-[#845400]">{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {couponSlot ? <div className="mb-4">{couponSlot}</div> : null}

        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[#ffb347] py-4 font-auth-display text-[18px] font-semibold text-[#704700] shadow-lg shadow-[#ffb347]/20 transition-all hover:scale-[1.01] hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{action.loading ? action.loadingLabel || action.label : action.label}</span>
            {!action.loading ? <ArrowRight className="h-5 w-5" /> : null}
          </button>
        ) : null}

        <p className="mt-4 px-4 text-center text-[12px] leading-5 text-[#524535]">
          Pago seguro garantizado por Aura Commerce. Envio estimado en 3-5 dias laborables.
        </p>
      </div>
    </aside>
  );
}
