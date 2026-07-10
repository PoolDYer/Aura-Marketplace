import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AxiosError } from 'axios';

import { loginSchema, LoginData } from '../lib/validations';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField } from '../components/auth/AuthField';
import { AuthMessage } from '../components/auth/AuthMessage';

const loginHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/auth/login-hero.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
      const response = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data;

      setAuth(user, accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || '/');
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        if (err.response.data.message === 'ACCOUNT_LOCKED') {
          setError(
            'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta en 15 minutos.',
          );
        } else if (err.response.data.message === 'EMAIL_NOT_VERIFIED') {
          setError('Debes verificar tu correo antes de iniciar sesion.');
        } else if (err.response.data.message === 'ACCOUNT_SUSPENDED') {
          setError('Tu cuenta esta suspendida. Contacta con soporte.');
        } else {
          setError('Credenciales inválidas');
        }
      } else {
        setError('Credenciales inválidas');
      }
    } finally {
      setIsLoading(false);
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
      const response = await api.post('/auth/resend-verification', { email: emailValue });
      setResendMessage(response.data?.message || 'Revisa tu bandeja de entrada.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'No pudimos reenviar el correo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout imageSrc={loginHero} imageAlt="Persona sosteniendo un teléfono con la interfaz de Aura">
      <div className="mb-6">
        <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#211527]">
          Iniciar Sesión
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#524535]">
          Ingresa a tu cuenta para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
        {resendMessage ? <AuthMessage tone="success">{resendMessage}</AuthMessage> : null}

        <AuthField
          label="Correo Electrónico"
          icon={Mail}
          type="email"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthField
          label="Contraseña"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="transition-colors hover:text-[#211527]"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
          {...register('password')}
        />

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

      <div className="mt-6 text-center">
        <p className="text-[12px] leading-4 text-[#524535]">
          ¿No tienes cuenta?{' '}
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
