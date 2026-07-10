import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { AuraHeader } from '../components/AuraHeader';
import { useAuthStore } from '../store/authStore';

export const ProtectedLayout = () => {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#845400]/20 border-t-[#845400]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (location.pathname.startsWith('/admin')) {
    return <Outlet />;
  }

  if (user?.rol === 'ADMINISTRADOR') {
    return <Navigate to="/admin/profile" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6F8]">
      <AuraHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export const RoleRoute = ({ role }: { role: string }) => {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#845400]/20 border-t-[#845400]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (user?.rol !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
