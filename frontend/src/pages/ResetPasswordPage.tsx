import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';

import api from '../lib/axios';
import { resetPasswordSchema, ResetPasswordData } from '../lib/validations';
import { AuthField } from '../components/auth/AuthField';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthMessage } from '../components/auth/AuthMessage';

const loginHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/auth/login-hero.jpg';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'El enlace de recuperacion no es valido.');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) return;

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setMessage(response.data.message || 'Contrasena actualizada correctamente.');
      window.setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err: unknown) {
      const apiMessage = (err as any)?.response?.data?.message;
      setError(apiMessage || 'No pudimos actualizar tu contrasena.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc={loginHero} imageAlt="Persona sosteniendo un telefono con la interfaz de Aura">
      <div className="mb-6">
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#845400] transition-colors hover:text-[#704700]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesion
        </Link>
        <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#211527]">
          Crear nueva contrasena
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#524535]">
          Escribe una contrasena segura y confirmala para recuperar el acceso.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

        <AuthField
          label="Nueva Contrasena"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          placeholder="********"
          autoComplete="new-password"
          helperText="Minimo 8 caracteres, una mayuscula, una minuscula y un numero."
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

        <AuthField
          label="Confirmar Contrasena"
          icon={Lock}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="********"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="transition-colors hover:text-[#211527]"
              aria-label={showConfirmPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isLoading || !token}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-6 font-auth-display text-[20px] font-semibold text-white transition-all hover:bg-[#704700] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{isLoading ? 'Actualizando...' : 'Actualizar contrasena'}</span>
          {!isLoading ? <ArrowRight className="h-5 w-5" /> : null}
        </button>
      </form>
    </AuthLayout>
  );
}
