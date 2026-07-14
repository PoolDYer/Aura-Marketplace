import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { loginSchema, LoginData } from '../lib/validations';
import { useAuthStore } from '../store/authStore';
import { authClient, consumePendingRole, syncNeonSession } from '../lib/neonAuth';
import api from '../lib/axios';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField } from '../components/auth/AuthField';
import { AuthMessage } from '../components/auth/AuthMessage';

const loginHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/auth/login-hero.jpg';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email');

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError('');
    setResendMessage('');

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (!result.error) {
        const synced = await syncNeonSession({ rol: consumePendingRole(data.email) });
        setAuth(synced.user, synced.accessToken);

        const from = (location.state as { from?: string } | null)?.from;
        navigate(from || '/');
        return;
      }

      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data;

      setAuth(user, accessToken);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || '/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      const normalized = message.toLowerCase();

      if (normalized.includes('verify') || normalized.includes('verification')) {
        setError('Debes verificar tu correo antes de iniciar sesion.');
      } else if (message === 'ACCOUNT_SUSPENDED') {
        setError('Tu cuenta esta suspendida. Contacta con soporte.');
      } else {
        setError(message || 'Credenciales invalidas');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    setError('');
    setResendMessage('');

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/auth/callback`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setError(message || 'No pudimos iniciar sesion con Google.');
      setIsGoogleLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!emailValue) {
      setError('Ingresa tu correo para reenviar la verificacion.');
      return;
    }

    setIsResending(true);
    setError('');
    setResendMessage('');

    try {
      const result = await authClient.sendVerificationEmail({
        email: emailValue,
        callbackURL: `${window.location.origin}/auth/callback`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'No pudimos reenviar el correo.');
      }

      setResendMessage('Revisa tu bandeja de entrada.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No pudimos reenviar el correo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout imageSrc={loginHero} imageAlt="Persona sosteniendo un telefono con la interfaz de Aura">
      <div className="mb-6">
        <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#211527]">
          Iniciar Sesion
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#524535]">
          Ingresa a tu cuenta para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
        {resendMessage ? <AuthMessage tone="success">{resendMessage}</AuthMessage> : null}

        <AuthField
          label="Correo Electronico"
          icon={Mail}
          type="email"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthField
          label="Contrasena"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          placeholder="********"
          autoComplete="current-password"
          error={errors.password?.message}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="transition-colors hover:text-[#211527]"
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          {...register('password')}
        />

        <div className="-mt-3 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[#845400] underline-offset-4 transition-colors hover:text-[#704700] hover:underline"
          >
            Olvidaste tu contrasena?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-6 font-auth-display text-[20px] font-semibold text-white transition-all hover:bg-[#704700] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{isLoading ? 'Iniciando...' : 'Entrar'}</span>
          {!isLoading ? <ArrowRight className="h-5 w-5" /> : null}
        </button>

        {error === 'Debes verificar tu correo antes de iniciar sesion.' ? (
          <button
            type="button"
            onClick={resendVerification}
            disabled={isResending}
            className="text-sm font-semibold text-[#845400] underline-offset-4 transition-colors hover:text-[#704700] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? 'Reenviando correo...' : 'Reenviar correo de verificacion'}
          </button>
        ) : null}
      </form>

      <div className="my-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#847463]">
        <span className="h-px flex-1 bg-[#d6c3b0]/70" />
        <span>o</span>
        <span className="h-px flex-1 bg-[#d6c3b0]/70" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={isGoogleLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d6c3b0] bg-white px-6 font-auth-display text-[18px] font-semibold text-[#211527] shadow-sm transition-all hover:border-[#845400]/45 hover:bg-[#f6f2f4] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <GoogleIcon />
        <span>{isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}</span>
      </button>

      <div className="mt-6 text-center">
        <p className="text-[12px] leading-4 text-[#524535]">
          No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-[#845400] underline-offset-4 hover:underline"
          >
            Crea una
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
