import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';

import api from '../lib/axios';
import { forgotPasswordSchema, ForgotPasswordData } from '../lib/validations';
import { AuthField } from '../components/auth/AuthField';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthMessage } from '../components/auth/AuthMessage';

const loginHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626782/Aura/assets/frontend/src/assets/auth/login-hero.jpg';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', data);
      setMessage(response.data.message || 'Revisa tu correo para continuar.');
    } catch (err: unknown) {
      const apiMessage = (err as any)?.response?.data?.message;
      setError(apiMessage || 'No pudimos enviar el enlace. Intenta nuevamente.');
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
          Recuperar Contrasena
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#524535]">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contrasena.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

        <AuthField
          label="Correo Electronico"
          icon={Mail}
          type="email"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-6 font-auth-display text-[20px] font-semibold text-white transition-all hover:bg-[#704700] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{isLoading ? 'Enviando...' : 'Enviar enlace'}</span>
          {!isLoading ? <ArrowRight className="h-5 w-5" /> : null}
        </button>
      </form>
    </AuthLayout>
  );
}
