import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  Camera,
  CheckCircle2,
  Edit3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react';

import { adminApi } from '../../api/admin';
import { categoriesApi } from '../../api/categories';
import { usersApi } from '../../api/users';
import { useProfilePhotoStore } from '../../store/profilePhotoStore';

type Profile = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  fechaRegistro?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);
  return (initials || 'AD').toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
}

function fileToProfilePhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No pudimos leer la imagen.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('No pudimos procesar la imagen.'));
      image.onload = () => {
        const size = 320;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('No pudimos preparar la imagen.'));
          return;
        }

        canvas.width = size;
        canvas.height = size;

        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const x = (size - width) / 2;
        const y = (size - height) / 2;

        context.drawImage(image, x, y, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminProfilePage() {
  const { photos, setPhoto } = useProfilePhotoStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metrics, setMetrics] = useState({
    users: 0,
    vendors: 0,
    products: 0,
    categories: 0,
    orders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      usersApi.getProfile(),
      adminApi.getUsers(),
      adminApi.getOrders(),
      adminApi.getProducts(),
      categoriesApi.getCategories(),
    ]).then(([profileResult, usersResult, ordersResult, productsResult, categoriesResult]) => {
      if (!active) return;

      if (profileResult.status === 'fulfilled') {
        const nextProfile = profileResult.value.data;
        setProfile(nextProfile);
        setNombre(nextProfile.nombre || '');
        setTelefono(nextProfile.telefono || '');
      }

      const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
      const products = productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [];
      const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.data || [] : [];

      setMetrics({
        users: users.length,
        vendors: users.filter((user: any) => user.rol === 'VENDEDOR').length,
        products: products.length,
        categories: categories.length,
        orders: orders.length,
      });
      setRecentOrders(orders.slice(0, 4));
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const initials = getInitials(profile?.nombre || nombre || 'Administrador Aura');
  const profilePhoto = profile?.id ? photos[profile.id] : undefined;

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await usersApi.updateProfile({ nombre, telefono });
      setProfile((current) => ({ ...current!, ...response.data, nombre, telefono }));
      setEditing(false);
    } catch {
      setError('No pudimos guardar los cambios. Inténtalo nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    setError('');
    try {
      const photoUrl = await fileToProfilePhoto(file);
      setPhoto(profile.id, photoUrl);
    } catch (photoError: any) {
      setError(photoError.message || 'No pudimos actualizar la foto.');
    } finally {
      event.target.value = '';
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAF6F8]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffb347] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="aura-profile-page">
      <div className="aura-profile-shell">
        <aside className="aura-profile-sidebar">
          <section className="aura-profile-card">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            {editing ? (
              <form onSubmit={handleUpdate} className="aura-profile-form">
                <div className="aura-profile-avatar-wrap">
                  <div className="aura-profile-avatar aura-profile-avatar-edit">
                    <div className="aura-profile-avatar-inner">
                      {profilePhoto ? <img src={profilePhoto} alt={profile.nombre} /> : initials}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aura-profile-avatar-action" aria-label="Cambiar foto de perfil">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="aura-profile-fields">
                  <label className="aura-profile-field">
                    <span>Nombre y Apellido</span>
                    <input value={nombre} onChange={(event) => setNombre(event.target.value)} className="aura-profile-input" />
                  </label>
                  <label className="aura-profile-field">
                    <span>Correo electrónico</span>
                    <input value={profile.email} disabled className="aura-profile-input" />
                  </label>
                  <label className="aura-profile-field">
                    <span>Teléfono</span>
                    <input value={telefono} onChange={(event) => setTelefono(event.target.value)} className="aura-profile-input" />
                  </label>
                  <label className="aura-profile-field">
                    <span>Rol</span>
                    <input value="Administrador" disabled className="aura-profile-input" />
                  </label>
                  <label className="aura-profile-field">
                    <span>Estado</span>
                    <input value={profile.estado || 'Activo'} disabled className="aura-profile-input" />
                  </label>
                </div>

                {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-2 text-sm text-[#93000a]">{error}</p> : null}

                <button type="submit" disabled={saving} className="aura-profile-save">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            ) : (
              <div className="aura-profile-saved">
                <div className="aura-profile-avatar-wrap">
                  <div className="aura-profile-avatar">
                    <div className="aura-profile-avatar-inner">
                      {profilePhoto ? <img src={profilePhoto} alt={profile.nombre} /> : initials}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aura-profile-check" aria-label="Cambiar foto de perfil">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="aura-profile-identity">
                  <h1>{profile.nombre}</h1>
                  <p>{profile.email}</p>
                </div>

                <div className="aura-profile-info">
                  <InfoRow label="Teléfono" value={profile.telefono || 'Sin registrar'} />
                  <InfoRow label="Rol" value="Administrador" />
                  <InfoRow label="Estado" value={profile.estado || 'Activo'} />
                  <InfoRow label="Registro" value={formatDate(profile.fechaRegistro)} />
                </div>

                <button type="button" onClick={() => setEditing(true)} className="aura-profile-edit">
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </button>
              </div>
            )}
          </section>

          <section className="aura-voice-card">
            <div className="aura-voice-glow" />
            <h2>
              <ShieldCheck className="h-4 w-4" />
              Acceso Admin
            </h2>
            <div className="aura-voice-rows">
              <div className="aura-voice-row aura-voice-row-border">
                <span>Permisos</span>
                <strong>Total</strong>
              </div>
              <div className="aura-voice-row">
                <span>Panel</span>
                <strong>Activo</strong>
              </div>
            </div>
          </section>
        </aside>

        <div className="aura-profile-main">
          <section className="aura-profile-section">
            <div className="aura-profile-section-head">
              <h2>
                <ShieldCheck className="h-4 w-4" />
                Perfil de Administrador
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminSummaryCard icon={<Users className="h-5 w-5" />} label="Usuarios gestionados" value={metrics.users} detail={`${metrics.vendors} vendedores registrados`} />
              <AdminSummaryCard icon={<PackageCheck className="h-5 w-5" />} label="Productos supervisados" value={metrics.products} detail={`${metrics.categories} categorías activas`} />
              <AdminSummaryCard icon={<ShoppingBag className="h-5 w-5" />} label="Pedidos monitoreados" value={metrics.orders} detail="Flujo administrativo" />
              <AdminSummaryCard icon={<Store className="h-5 w-5" />} label="Rol operativo" value="Admin" detail="Gestión completa del marketplace" />
            </div>
          </section>

          <section className="aura-profile-section">
            <h2 className="aura-profile-section-title">
              <CheckCircle2 className="h-4 w-4" />
              Capacidades del Rol
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Gestionar pedidos y estados',
                'Supervisar clientes registrados',
                'Administrar vendedores',
                'Controlar publicaciones y catálogo',
                'Mantener categorías',
                'Auditar métricas del marketplace',
              ].map((permission) => (
                <div key={permission} className="flex items-center gap-3 rounded-xl border border-[#d6c3b0]/25 bg-white px-4 py-3 text-sm font-medium text-[#211527] shadow-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e1f7f0] text-[#006b5b]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {permission}
                </div>
              ))}
            </div>
          </section>

          <section className="aura-profile-section">
            <h2 className="aura-profile-section-title">
              <ShoppingBag className="h-4 w-4" />
              Pedidos Recientes del Sistema
            </h2>

            <div className="aura-orders-card">
              {recentOrders.length === 0 ? (
                <div className="aura-empty-state">
                  <ShoppingBag className="h-10 w-10 text-[#d6c3b0]" />
                  <p className="text-[14px] text-[#524535]">No hay pedidos recientes para revisar.</p>
                </div>
              ) : (
                recentOrders.map((order, index) => (
                  <div key={order.id} className={`aura-order-row ${index > 0 ? 'aura-order-row-border' : ''}`}>
                    <div className="aura-order-thumb">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="aura-order-copy">
                      <p>{order.numeroConfirmacion || `Pedido ${order.id?.slice(0, 8)}`}</p>
                      <span>{order.comprador?.nombre || 'Cliente sin nombre'} - {formatDate(order.createdAt)}</span>
                    </div>
                    <span className="aura-order-status bg-[#e1f7f0] text-[#006b5b]">
                      {order.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AdminSummaryCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string | number; detail: string }) {
  return (
    <article className="rounded-xl border border-[#d6c3b0]/25 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff3df] text-[#845400]">{icon}</span>
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#524535]">{label}</p>
      <p className="mt-1 font-auth-display text-2xl font-bold text-[#845400]">{value}</p>
      <p className="mt-2 text-sm text-[#524535]">{detail}</p>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="aura-profile-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
