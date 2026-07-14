import type { ReactNode } from 'react';
import { BrandLogo } from '../BrandLogo';

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
            <div className="mb-8 text-center md:mb-10">
              <div className="flex items-center justify-center gap-2">
                <BrandLogo variant="auth" className="h-20 w-20 -translate-x-[17px] md:h-24 md:w-24 md:-translate-x-[25px]" />
                <div className="-ml-2 -translate-x-[45px] text-left md:-translate-x-[65px]">
                  <p className="font-auth-display text-[27px] font-bold leading-8 text-[#845400]">
                    Aura
                  </p>
                  <p className="font-auth-display text-[21px] font-semibold leading-6 text-[#211527]">
                    Marketplace Perú
                  </p>
                </div>
              </div>
              <div className="mx-auto mt-5 max-w-[370px] text-center">
                <p className="font-auth-display text-[21px] font-bold leading-[1.14] text-[#211527] md:text-[23px]">
                  Compra con confianza o empieza a{' '}
                  <span className="text-[#845400]">vender en minutos.</span>
                </p>
                <p className="mx-auto mt-3 max-w-[330px] text-[15px] font-medium leading-6 text-[#524535]">
                  Aura conecta productos, vendedores y clientes en una experiencia{' '}
                  <span className="font-semibold text-[#845400]">simple, segura y cercana.</span>
                </p>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
