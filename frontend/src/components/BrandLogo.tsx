import auraLogo from '../assets/brand/aura-logo.png';
import { cn } from '../lib/utils';

type BrandLogoProps = {
  variant?: 'header' | 'auth' | 'footer';
  className?: string;
};

const variantClass = {
  header: 'h-12 w-12 md:h-14 md:w-14',
  auth: 'mx-auto h-28 w-28 md:h-32 md:w-32',
  footer: 'h-20 w-20 md:h-24 md:w-24',
};

export function BrandLogo({ variant = 'header', className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        variantClass[variant],
        className,
      )}
      aria-label="Aura Marketplace"
    >
      <img
        src={auraLogo}
        alt=""
        className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(132,84,0,0.18)]"
        draggable={false}
      />
    </span>
  );
}
