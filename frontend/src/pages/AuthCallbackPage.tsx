import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MailWarning } from 'lucide-react';

import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthMessage } from '../components/auth/AuthMessage';
import { getNeonRegistrationStatus } from '../lib/neonAuth';
import { useAuthStore } from '../store/authStore';

const loginHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/auth/login-hero.jpg';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const status = await getNeonRegistrationStatus();

        if (!status.registered) {
          navigate('/register?provider=google', {
            replace: true,
            state: {
              verifiedEmail: status.neonUser.email,
              suggestedName: status.neonUser.nombre,
            },
          });
          return;
        }

        if (!status.user) {
          throw new Error('No pudimos recuperar tu usuario de Aura.');
        }

        setAuth(status.user, status.accessToken);
        navigate(status.user.rol === 'VENDEDOR' ? '/vendor/catalog' : '/', { replace: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '';
        if (message.toLowerCase().includes('no hay sesion activa en neon')) {
          setStatus('success');
          setMessage('Correo verificado correctamente. Inicia sesion para continuar.');
          return;
        }

        setStatus('error');
        setMessage(message || 'No pudimos completar el inicio de sesion.');
      }
    };

    finishSignIn();
  }, [navigate, setAuth]);

  return (
    <AuthLayout imageSrc={loginHero} imageAlt="Persona sosteniendo un telefono con la interfaz de Aura">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3df] text-[#845400]">
          {status === 'loading' ? <Loader2 className="h-7 w-7 animate-spin" /> : <MailWarning className="h-7 w-7" />}
        </div>
        <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#211527]">
          Conectando tu cuenta
        </h2>
        <p className="mt-2 text-[14px] leading-5 text-[#524535]">
          Estamos confirmando tu sesion con Neon Auth.
        </p>
      </div>

      {status !== 'loading' ? (
        <>
          <div className="mt-6">
            <AuthMessage tone={status === 'success' ? 'success' : 'error'}>{message}</AuthMessage>
          </div>
          <Link
            to="/login"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#845400] px-6 font-auth-display text-[18px] font-semibold text-white transition-all hover:bg-[#704700] active:scale-[0.98]"
          >
            Volver a iniciar sesion
          </Link>
        </>
      ) : null}
    </AuthLayout>
  );
}
