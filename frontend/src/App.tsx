import { Navigate, Outlet, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ProtectedLayout, RoleRoute } from './layouts/ProtectedLayout';
import { AdminLayout } from './layouts/AdminLayout';
import ProfilePage from './pages/profile/ProfilePage';
import PreferencesPage from './pages/profile/PreferencesPage';
import FavoritesPage from './pages/profile/FavoritesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import VendorProductsPage from './pages/profile/VendorProductsPage';
import ProductFormPage from './pages/profile/ProductFormPage';
import VendorClientsPage from './pages/profile/VendorClientsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import CheckoutShippingPage from './pages/CheckoutShippingPage';
import CheckoutPaymentPage from './pages/CheckoutPaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/profile/OrderHistoryPage';
import OrderDetailPage from './pages/profile/OrderDetailPage';
import VendorOrdersPage from './pages/profile/VendorOrdersPage';
import CartPage from './pages/CartPage';
import { ChatAgente } from './components/ChatAgente';
import { useAgentStore, setNavigationCallback, setAddToCartCallback } from './store/agentStore';
import { useCartStore } from './store/cartStore';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function StorefrontRoute() {
  const { user, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F8]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#845400]/20 border-t-[#845400]" />
      </div>
    );
  }

  if (user?.rol === 'ADMINISTRADOR') {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Outlet />;
}

function App() {
  const { toggleChat, fetchHistory } = useAgentStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const hideGlobalBot =
    location.pathname === '/' ||
    location.pathname === '/catalog' ||
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/products/');

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Register navigation callback for the copilot
  useEffect(() => {
    setNavigationCallback((path: string) => {
      if (user?.rol === 'ADMINISTRADOR' && (path === '/' || path === '/catalog' || path === '/cart' || path.startsWith('/products/'))) {
        navigate('/admin/orders');
        return;
      }

      navigate(path);
    });
    setAddToCartCallback(async (productId: string, cantidad: number, preview?: any) => {
      if (user?.rol === 'ADMINISTRADOR') {
        navigate('/admin/orders');
        useAgentStore.getState().closeChat();
        return;
      }

      await addItem(productId, cantidad, preview);
      navigate('/cart');
      useAgentStore.getState().closeChat();
    });
  }, [navigate, addItem, user?.rol]);

  return (
    <>
      <Routes>
        <Route element={<StorefrontRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

      <Route element={<RoleRoute role="COMPRADOR" />}>
        <Route path="/cart" element={<CartPage />} />
      </Route>
        
      <Route element={<ProtectedLayout />}>
          <Route path="/checkout" element={<CheckoutShippingPage />} />
          <Route path="/checkout/shipping" element={<CheckoutShippingPage />} />
          <Route path="/checkout/payment/:orderId" element={<CheckoutPaymentPage />} />
          <Route path="/orders/success" element={<OrderSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/preferences" element={<PreferencesPage />} />
          
          <Route element={<RoleRoute role="COMPRADOR" />}>
            <Route path="/profile/orders" element={<OrderHistoryPage />} />
            <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile/favorites" element={<FavoritesPage />} />
          </Route>
          
          <Route element={<RoleRoute role="VENDEDOR" />}>
            <Route path="/vendor/catalog" element={<VendorProductsPage />} />
            <Route path="/vendor/catalog/new" element={<ProductFormPage />} />
            <Route path="/vendor/catalog/:id/edit" element={<ProductFormPage />} />
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            <Route path="/vendor/clients" element={<VendorClientsPage />} />
            <Route path="/profile/products" element={<VendorProductsPage />} />
            <Route path="/profile/products/new" element={<ProductFormPage />} />
            <Route path="/profile/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/profile/vendor-orders" element={<VendorOrdersPage />} />
            <Route path="/profile/vendor-clients" element={<VendorClientsPage />} />
          </Route>
          
          <Route element={<RoleRoute role="ADMINISTRADOR" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/clients" element={<AdminUsersPage role="COMPRADOR" title="Gestión de Clientes" description="Consulta las cuentas de compra y administra su acceso a Aura." />} />
              <Route path="/admin/vendors" element={<AdminUsersPage role="VENDEDOR" title="Gestión de Vendedores" description="Supervisa a quienes publican y gestionan el catálogo." />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/profile" element={<AdminProfilePage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <ChatAgente />
      
      {/* Botón Flotante Agente - Redesigned */}
      {user && !hideGlobalBot && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 group p-0 bg-transparent border-none shadow-none z-40 focus:outline-none"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffb95a] via-[#845400] to-[#006b5b] text-white shadow-[0_8px_30px_rgba(132,84,0,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(132,84,0,0.34)] active:scale-95">
            <Sparkles className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
            </span>
          </div>
        </button>
      )}
    </>
  );
}

export default App;
