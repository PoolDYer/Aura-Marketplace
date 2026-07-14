import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Lock, Mail, Store, UserRound, type LucideIcon } from 'lucide-react';

import { registerSchema, RegisterData, UserRole } from '../lib/validations';
import {
  authClient,
  completeGoogleRegistration,
  getNeonRegistrationStatus,
  rememberPendingRole,
  syncNeonSession,
} from '../lib/neonAuth';
import { useAuthStore } from '../store/authStore';
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
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
  const isGoogleCompletion = searchParams.get('provider') === 'google';
  const routeState = location.state as { verifiedEmail?: string; suggestedName?: string } | null;
  const verifiedEmail = routeState?.verifiedEmail || watch('email');

  useEffect(() => {
    if (!isGoogleCompletion) return;

    if (routeState?.verifiedEmail) {
      setValue('email', routeState.verifiedEmail, { shouldValidate: true });
    }

    if (routeState?.suggestedName) {
      setValue('nombre', routeState.suggestedName, { shouldValidate: true });
    }

    setValue('rol', 'COMPRADOR', { shouldValidate: true });
  }, [isGoogleCompletion, routeState?.suggestedName, routeState?.verifiedEmail, setValue]);

  useEffect(() => {
    if (!isGoogleCompletion || routeState?.verifiedEmail) return;

    getNeonRegistrationStatus()
      .then((status) => {
        if (status.registered && status.user) {
          setAuth(status.user, status.accessToken);
          navigate(status.user.rol === 'VENDEDOR' ? '/vendor/catalog' : '/', { replace: true });
          return;
        }

        setValue('email', status.neonUser.email, { shouldValidate: true });
        setValue('nombre', status.neonUser.nombre, { shouldValidate: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [isGoogleCompletion, navigate, routeState?.verifiedEmail, setAuth, setValue]);

  const onSubmit = async (data: RegisterData) => {
    const { confirmPassword, rol, ...payload } = data;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isGoogleCompletion) {
        const synced = await completeGoogleRegistration({
          nombre: payload.nombre,
          password: payload.password,
          rol,
        });

        setAuth(synced.user, synced.accessToken);
        navigate('/');
        return;
      }

      const result = await authClient.signUp.email({
        name: payload.nombre,
        email: payload.email,
        password: payload.password,
        callbackURL: `${window.location.origin}/auth/callback`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Error al registrar usuario');
      }

      rememberPendingRole(payload.email, rol);

      try {
        const synced = await syncNeonSession({ nombre: payload.nombre, rol });
        setAuth(synced.user, synced.accessToken);
        navigate(rol === 'VENDEDOR' ? '/vendor/catalog' : '/');
        return;
      } catch {
        setSuccess('Registro exitoso. Verifique su correo electronico antes de iniciar sesion.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
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
          {isGoogleCompletion ? 'Completa tu cuenta para entrar a Aura.' : 'Elige como quieres empezar.'}
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

        {isGoogleCompletion ? (
          <div className="rounded-lg border border-[#d6c3b0] bg-white px-4 py-3 shadow-sm">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#847463]">
                Correo Electronico
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f7ef] px-2 py-1 text-[12px] font-semibold text-[#006b5b]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verificado
              </span>
            </div>
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#211527]">
              <Mail className="h-4 w-4 text-[#845400]" />
              <span className="truncate">{verifiedEmail}</span>
            </div>
          </div>
        ) : null}

        <AuthField
          label="Nombre Completo"
          icon={UserRound}
          type="text"
          placeholder="Ej. Maria Garcia"
          autoComplete="name"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        {isGoogleCompletion ? (
          <input type="hidden" {...register('email')} />
        ) : (
          <AuthField
            label="Correo Electronico"
            icon={Mail}
            type="email"
            placeholder="hola@ejemplo.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        )}

        <AuthField
          label="Contrasena"
          icon={Lock}
          type="password"
          placeholder="********"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Min. 8 caracteres, mayuscula, minuscula y numero."
          {...register('password')}
        />

        <AuthField
          label="Confirmar Contrasena"
          icon={Lock}
          type="password"
          placeholder="********"
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
          Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-[#845400] underline-offset-4 hover:underline"
          >
            Inicia sesion
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
