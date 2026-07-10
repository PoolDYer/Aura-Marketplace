import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail, Store, UserRound, type LucideIcon } from 'lucide-react';

import { registerSchema, RegisterData, UserRole } from '../lib/validations';
import api from '../lib/axios';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthField } from '../components/auth/AuthField';
import { AuthMessage } from '../components/auth/AuthMessage';
import { cn } from '../lib/utils';

const registerHero =
  'https://res.cloudinary.com/dg4hes0tm/image/upload/v1783626783/Aura/assets/frontend/src/assets/auth/register-hero.jpg';

type RoleCardProps = {
  role: UserRole;
  label: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (role: UserRole) => void;
};

function RoleCard({ role, label, description, icon: Icon, selected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={cn(
        'flex-1 rounded-lg border-2 p-3 text-center transition-colors',
        selected
          ? 'border-[#ffb347] bg-[#ffb347]/10'
          : 'border-[#d6c3b0] bg-transparent hover:border-[#ffb347]/80 hover:bg-[#ffb347]/5',
      )}
      aria-pressed={selected}
    >
      <Icon
        className={cn(
          'mx-auto mb-2 h-5 w-5',
          selected ? 'text-[#845400]' : 'text-[#524535]',
        )}
      />
      <span className="block text-[12px] font-semibold leading-4 text-[#845400]">
        {label}
      </span>
      <span className="mt-0.5 block text-[11px] leading-4 text-[#524535]">
        {description}
      </span>
    </button>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      rol: 'COMPRADOR',
    },
  });

  const selectedRole = watch('rol') ?? 'COMPRADOR';

  const onSubmit = async (data: RegisterData) => {
    const { confirmPassword, ...payload } = data;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', payload);
      setSuccess('Registro exitoso. Verifique su correo electrónico antes de iniciar sesión.');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc={registerHero} imageAlt="Mochila de cuero y flores sobre una mesa de madera">
      <div className="mb-6">
        <h2 className="font-auth-display text-[28px] font-semibold leading-9 text-[#211527]">
          Crear Cuenta
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-[#524535]">
          Únete a nuestra comunidad de diseño.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
        {success ? <AuthMessage tone="success">{success}</AuthMessage> : null}

        <div className="mb-1 flex gap-3">
          <RoleCard
            role="COMPRADOR"
            label="Cliente"
            description="Comprar"
            icon={UserRound}
            selected={selectedRole === 'COMPRADOR'}
            onSelect={(role) => setValue('rol', role, { shouldDirty: true, shouldValidate: true })}
          />
          <RoleCard
            role="VENDEDOR"
            label="Vendedor"
            description="Publicar"
            icon={Store}
            selected={selectedRole === 'VENDEDOR'}
            onSelect={(role) => setValue('rol', role, { shouldDirty: true, shouldValidate: true })}
          />
        </div>
        <input type="hidden" {...register('rol')} />

        <AuthField
          label="Nombre Completo"
          icon={UserRound}
          type="text"
          placeholder="Ej. María García"
          autoComplete="name"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        <AuthField
          label="Correo Electrónico"
          icon={Mail}
          type="email"
          placeholder="hola@ejemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthField
          label="Contraseña"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Mín. 8 caracteres, mayúscula, minúscula y número."
          {...register('password')}
        />

        <AuthField
          label="Confirmar Contraseña"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#845400] px-6 font-auth-display text-[20px] font-semibold text-white transition-all hover:bg-[#704700] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{isLoading ? 'Registrando...' : 'Crear Cuenta'}</span>
          {!isLoading ? <ArrowRight className="h-5 w-5" /> : null}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[12px] leading-4 text-[#524535]">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-[#845400] underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
