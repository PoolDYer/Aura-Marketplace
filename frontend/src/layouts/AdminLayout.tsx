import { Bell, LogOut, Search } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { authClient } from '../lib/neonAuth';
import { useAuthStore } from '../store/authStore';
import { useProfilePhotoStore } from '../store/profilePhotoStore';

const links = [
  { to: '/admin/orders', label: 'Pedidos' },
  { to: '/admin/clients', label: 'Clientes' },
  { to: '/admin/vendors', label: 'Vendedores' },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/categories', label: 'Categorías' },
];

function getInitials(name?: string) {
  const parts = (name || 'Administrador Aura').trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);
  return (initials || 'AD').toUpperCase();
}

export const AdminLayout = () => {
  const { user, hasHydrated, logout } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profilePhoto = useProfilePhotoStore((state) => (user?.id ? state.photos[user.id] : undefined));

  const handleLogout = async () => {
    await authClient.signOut().catch(() => undefined);
    logout();
    navigate('/login', { replace: true });
  };

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcf8fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ffb347] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1c1b1d]">
      <header className="sticky top-0 z-50 border-b border-[#d6c3b0]/35 bg-[#fcf8fa]/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link to="/admin/orders" className="flex shrink-0 items-center" aria-label="Aura Marketplace">
            <BrandLogo />
          </Link>

          <nav className="ml-8 hidden min-w-0 flex-1 items-center gap-[52px] lg:flex" aria-label="Navegación administrativa">
            {links.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-1 py-2 text-base font-semibold transition-colors ${active ? 'border-b-2 border-[#845400] text-[#845400]' : 'text-[#524535] hover:text-[#845400]'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden h-11 w-[310px] items-center rounded-full bg-[#f6f2f4] px-4 lg:flex">
            <Search className="h-4 w-4 text-[#847463]" />
            <span className="ml-3 text-sm text-[#847463]">Búsqueda global...</span>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full text-[#524535] hover:bg-[#f6f2f4]" aria-label="Notificaciones">
            <Bell className="h-4 w-4" />
          </button>
          <Link
            to="/admin/profile"
            className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-[#ffb347] bg-[#ffddb6] text-sm font-bold text-[#704700]"
            aria-label="Administrador"
          >
            {profilePhoto ? <img src={profilePhoto} alt={user?.nombre || 'Administrador'} className="h-full w-full object-cover" /> : getInitials(user?.nombre)}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#d6c3b0]/45 bg-[#f6f2f4] text-[#845400] transition hover:border-transparent hover:bg-gradient-to-br hover:from-[#ffddb6] hover:via-[#ffb347] hover:to-[#006b5b] hover:text-white hover:shadow-sm hover:shadow-[#845400]/15"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex gap-5 overflow-x-auto border-t border-[#d6c3b0]/25 px-4 py-2 lg:hidden" aria-label="Navegación administrativa móvil">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={`whitespace-nowrap text-xs ${pathname === link.to ? 'font-bold text-[#845400]' : 'text-[#524535]'}`}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1440px]">
        <Outlet />
      </main>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
    </div>
  );
};

