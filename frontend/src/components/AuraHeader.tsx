import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Mic, Search, ShoppingCart } from 'lucide-react';

import { useAgentStore } from '../store/agentStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useProfilePhotoStore } from '../store/profilePhotoStore';

type AuraHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
};

function getInitials(name?: string) {
  const parts = (name || 'Aura').trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);
  return (initials || 'AU').toUpperCase();
}

export function AuraHeader({ searchValue, onSearchChange, onSearchSubmit }: AuraHeaderProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { fetchCart, getCartItemsCount } = useCartStore();
  const { toggleChat } = useAgentStore();
  const profilePhoto = useProfilePhotoStore((state) => (user?.id ? state.photos[user.id] : undefined));
  const [localSearch, setLocalSearch] = useState('');

  const search = searchValue ?? localSearch;
  const cartCount = getCartItemsCount();
  const navTarget = (target: string) => (isAuthenticated ? target : '/login');
  const isBuyer = user?.rol === 'COMPRADOR';
  const isVendor = user?.rol === 'VENDEDOR';
  const navItems = isVendor
    ? [
        { label: 'Catálogo', to: '/vendor/catalog' },
        { label: 'Pedidos', to: '/vendor/orders' },
        { label: 'Clientes', to: '/vendor/clients' },
      ]
    : [
        { label: 'Explorar', to: '/catalog' },
        { label: 'Favoritos', to: navTarget('/profile/favorites') },
        { label: 'Pedidos', to: navTarget('/profile/orders') },
      ];

  useEffect(() => {
    if (isAuthenticated && isBuyer) {
      fetchCart().catch(() => undefined);
    }
  }, [fetchCart, isAuthenticated, isBuyer]);

  const updateSearch = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
      return;
    }

    setLocalSearch(value);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();

    if (onSearchSubmit) {
      onSearchSubmit(query);
      return;
    }

    const target = isVendor ? '/vendor/catalog' : '/catalog';
    navigate(`${target}${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#d6c3b0]/30 bg-[#FAF6F8]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="-translate-x-[50px] font-auth-display text-[30px] font-bold leading-none tracking-tight text-[#845400] md:text-[34px]">
          Aura
        </Link>

        <nav className="hidden items-center gap-[34px] md:flex">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="text-[17px] font-semibold text-[#845400] transition-colors hover:text-[#704700]">
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden min-w-[220px] flex-1 items-center md:flex">
          <div className="relative mx-auto w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
            <input
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              className="h-14 w-full rounded-full border-0 bg-[#f6f2f4] pl-14 pr-16 text-[14px] text-[#211527] shadow-sm outline-none ring-1 ring-transparent placeholder:text-[#524535]/60 focus:ring-[#845400]/20"
              placeholder={isVendor ? 'Buscar en tu catálogo...' : 'Buscar productos...'}
              type="text"
            />
            <button
              type="button"
              onClick={toggleChat}
              aria-label="Activar búsqueda por voz"
              className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb95a] to-[#006b5b] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 text-[#524535] md:ml-0 md:gap-3">
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/cart' : '/login')}
            className="relative rounded-full p-2 transition-colors hover:bg-[#e5e1e3]/70 hover:text-[#845400] md:p-2.5"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#845400]" /> : null}
          </button>
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-transparent transition-colors hover:border-[#845400]/40 hover:bg-[#e5e1e3]/70 hover:text-[#845400]"
            aria-label="Perfil"
          >
            {isAuthenticated && profilePhoto ? (
              <img src={profilePhoto} alt={user?.nombre || 'Perfil'} className="h-full w-full object-cover" />
            ) : isAuthenticated ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#ffb347] bg-[#ffddb6] font-auth-display text-[13px] font-bold text-[#845400] shadow-sm">
                {getInitials(user?.nombre)}
              </span>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#ffb347] bg-[#ffddb6] font-auth-display text-[13px] font-bold text-[#845400] shadow-sm">
                AU
              </span>
            )}
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
      </div>
    </header>
  );
}
