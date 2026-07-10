import type { ReactNode } from 'react';

type AuthLayoutProps = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
};

export function AuthLayout({ imageSrc, imageAlt, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF6F8] text-[#211527]">
      <div className="flex min-h-screen w-full">
        <div className="relative hidden overflow-hidden md:block md:w-1/2">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-[#FFFFFF] px-6 py-10 md:w-1/2 md:px-12 md:py-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-10 text-center md:mb-12">
              <h1 className="font-auth-display text-[32px] font-bold tracking-tight text-[#845400] md:text-[40px]">
                Aura
              </h1>
            </div>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
