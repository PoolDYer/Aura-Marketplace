type AuthMessageProps = {
  tone: 'error' | 'success';
  children: string;
};

export function AuthMessage({ tone, children }: AuthMessageProps) {
  const isError = tone === 'error';

  return (
    <div
      className={[
        'rounded-xl border px-4 py-3 text-sm leading-5',
        isError
          ? 'border-[#E8927C]/30 bg-[#E8927C]/10 text-[#6b2f22]'
          : 'border-[#7fd9c4]/35 bg-[#7fd9c4]/10 text-[#0f3d33]',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
