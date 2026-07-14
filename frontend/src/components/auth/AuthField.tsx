import type { ComponentType, InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/utils';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ComponentType<{ className?: string }>;
  error?: string;
  helperText?: string;
  rightAdornment?: ReactNode;
};

export function AuthField({
  label,
  icon: Icon,
  error,
  helperText,
  rightAdornment,
  className,
  id,
  ...props
}: AuthFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="ml-1 text-[12px] font-medium leading-none text-[#524535]"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-12 w-full rounded-lg border border-[#d6c3b0]/60 bg-[#fcf8fa] pl-11 pr-4 text-[14px] leading-5 text-[#211527] outline-none transition-shadow placeholder:text-[#524535]/50 focus:border-[#845400] focus:ring-1 focus:ring-[#845400]',
            rightAdornment && 'pr-11',
            error && 'border-[#E8927C]/70 focus:border-[#E8927C] focus:ring-[#E8927C]',
            className,
          )}
          {...props}
        />
        {rightAdornment ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#524535]">
            {rightAdornment}
          </div>
        ) : null}
      </div>
      <p
        className={cn(
          'ml-1 min-h-4 text-[12px] leading-4',
          error ? 'text-[#A84B2F]' : 'text-[#524535]',
        )}
        aria-live="polite"
      >
        {error || helperText || '\u00a0'}
      </p>
    </div>
  );
}
