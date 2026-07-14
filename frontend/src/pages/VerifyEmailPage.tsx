import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthMessage } from '../components/auth/AuthMessage';
import { authClient, syncNeonSession } from '../lib/neonAuth';
import { useAuthStore } from '../store/authStore';

const loginHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/auth/login-hero.jpg';

type VerifyState = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verificando tu correo...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState('error');
      setMessage('El enlace de verificacion no incluye un token valido.');
      return;
    }

    const verify = async () => {
      try {
        const response = await authClient.verifyEmail({
          query: {
            token,
            callbackURL: `${window.location.origin}/auth/callback`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'No pudimos verificar tu correo.');
        }

        try {
          const synced = await syncNeonSession();
          setAuth(synced.user, synced.accessToken);
        } catch {
          // Neon may verify email without opening a session; login remains available below.
        }

        setState('success');
        setMessage('Correo verificado correctamente.');
      } catch (err: any) {
        setState('error');
        setMessage(err.message || 'No pudimos verificar tu correo.');
      }
    };

    verify();
  }, [searchParams, setAuth]);

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const Icon = isLoading ? Loader2 : isSuccess ? CheckCircle2 : MailWarning;

  return (
    <AuthLayout imageSrc={loginHero} imageAlt="Persona sosteniendo un telefono con la interfaz de Aura">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3df] text-[#845400]">
          <Icon className={`h-7 w-7 ${isLoading ? 'animate-spin' : ''}`} />
        </div>
        <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#211527]">
          Verificacion de correo
        </h2>
        <p className="mt-2 text-[14px] leading-5 text-[#524535]">
          Estamos confirmando que este correo pertenece a tu cuenta Aura.
        </p>
      </div>

      <div className="mt-6">
        <AuthMessage tone={isSuccess ? 'success' : 'error'}>{message}</AuthMessage>
      </div>

      {!isLoading ? (
        <Link
          to="/login"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#845400] px-6 font-auth-display text-[18px] font-semibold text-white transition-all hover:bg-[#704700] active:scale-[0.98]"
        >
          Ir a iniciar sesion
        </Link>
      ) : null}
    </AuthLayout>
  );
}
