import { useState, useEffect } from 'react';
import api from '../../lib/axios';

const C = {
  primary: '#845400',
  primaryContainer: '#ffb347',
  secondary: '#006b5b',
  secondaryContainer: '#96f0db',
  surface: '#fcf8fa',
  bgCatalog: '#FAF6F8',
  surfaceCatalog: '#FFFFFF',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f2f4',
  surfaceContainer: '#f1edef',
  surfaceContainerHigh: '#ebe7e9',
  surfaceContainerHighest: '#e5e1e3',
  onSurface: '#1c1b1d',
  onSurfaceVariant: '#524535',
  outlineVariant: '#d6c3b0',
  outline: '#847463',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#704700',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00705f',
  bgVoice: '#211527',
  surfaceVoice: '#2E1C36',
  textVoice: '#F5EEF0',
  textMuted: '#C9B8CE',
  borderMuted: '#4A2F52',
  tertiaryFixedDim: '#d8bee0',
  secondaryFixedDim: '#7dd7c2',
  primaryFixedDim: '#ffb95a',
};

interface Reports {
  totalUsers: number;
  activeProducts: number;
  totalOrders: number;
  totalSales: number;
}

interface RecentOrder {
  id: string;
  numeroConfirmacion: string;
  total: string | number;
  estado: string;
  createdAt: string;
  comprador?: { nombre: string; email: string };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Reports | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  // Auth store available if needed for personalization

  useEffect(() => {
    Promise.all([
      api.get('/admin/reports').then(r => setReports(r.data)).catch(() => {}),
      api.get('/admin/orders?limit=5').then(r => setRecentOrders(r.data?.items || r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return { bg: `${C.primaryContainer}40`, color: C.onPrimaryContainer };
      case 'CONFIRMADA': case 'EN_PREPARACION': return { bg: `${C.secondaryContainer}40`, color: C.onSecondaryContainer };
      case 'ENTREGADA': return { bg: `${C.secondaryContainer}60`, color: C.onSecondaryContainer };
      case 'CANCELADA': return { bg: '#ffdad6', color: '#93000a' };
      default: return { bg: C.surfaceContainerHighest, color: C.onSurfaceVariant };
    }
  };

  if (loading) {
    return (
      <div style={{ background: C.bgCatalog }} className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: `${C.primaryContainer} transparent ${C.primaryContainer} transparent` }}
        />
      </div>
    );
  }

  return (
    <div style={{ background: C.bgCatalog, fontFamily: "'General Sans', sans-serif", minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-3"
        style={{ borderBottom: `1px solid ${C.outlineVariant}33` }}
      >
        <div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '40px', fontWeight: 700, color: C.onSurface, lineHeight: 1.2 }}>
            Visión General
          </h1>
          <p style={{ color: C.onSurfaceVariant, fontSize: '16px', marginTop: '4px' }}>
            Métricas en tiempo real y estado del sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            style={{ background: C.surfaceContainerHigh, color: C.onSurface, border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Últimos 30 Días
          </button>
          <button
            style={{ background: C.primary, color: C.onPrimary, border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ventas Totales */}
          <div style={{ background: C.surfaceCatalog, borderRadius: '16px', border: `1px solid ${C.outlineVariant}33`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="flex justify-between items-start mb-6">
              <span style={{ color: C.onSurfaceVariant, fontSize: '14px' }}>Ventas Totales</span>
              <div style={{ background: `${C.primaryContainer}33`, borderRadius: '9999px', padding: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: C.primary }}>payments</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '32px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>
                S/ {reports ? Number(reports.totalSales).toLocaleString() : '—'}
              </div>
              <div className="flex items-center gap-1" style={{ color: C.secondary, fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>Acumulado total</span>
              </div>
            </div>
          </div>

          {/* Tasa de Éxito - Voz */}
          <div style={{ background: C.surfaceCatalog, borderRadius: '16px', border: `1px solid ${C.outlineVariant}33`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-48px', top: '-48px', width: '128px', height: '128px', background: `${C.secondaryContainer}4D`, borderRadius: '9999px', filter: 'blur(32px)' }} />
            <div className="flex justify-between items-start mb-6 relative">
              <span style={{ color: C.onSurfaceVariant, fontSize: '14px' }}>Productos Activos</span>
              <div style={{ background: `${C.secondaryContainer}4D`, borderRadius: '9999px', padding: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: C.onSecondaryContainer }}>inventory_2</span>
              </div>
            </div>
            <div className="relative">
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '32px', fontWeight: 500, color: C.onSurface, marginBottom: '4px' }}>
                {reports?.activeProducts ?? '—'}
              </div>
              <div className="flex items-center gap-1" style={{ color: C.secondary, fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>En el catálogo</span>
              </div>
            </div>
          </div>

          {/* Usuarios & Órdenes */}
          <div style={{ background: C.surfaceCatalog, borderRadius: '16px', border: `1px solid ${C.outlineVariant}33`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex justify-between items-start">
              <div>
                <p style={{ color: C.onSurfaceVariant, fontSize: '13px', marginBottom: '4px' }}>Usuarios Totales</p>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '24px', fontWeight: 500, color: C.onSurface }}>{reports?.totalUsers ?? '—'}</p>
              </div>
              <div style={{ background: C.surfaceContainerHighest, borderRadius: '9999px', padding: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: C.onSurfaceVariant }}>people</span>
              </div>
            </div>
            <div style={{ height: '1px', background: `${C.outlineVariant}33` }} />
            <div className="flex justify-between items-start">
              <div>
                <p style={{ color: C.onSurfaceVariant, fontSize: '13px', marginBottom: '4px' }}>Órdenes Totales</p>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '24px', fontWeight: 500, color: C.onSurface }}>{reports?.totalOrders ?? '—'}</p>
              </div>
              <div style={{ background: C.surfaceContainerHighest, borderRadius: '9999px', padding: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: C.onSurfaceVariant }}>shopping_bag</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders + Voice Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div style={{ background: C.surfaceCatalog, borderRadius: '16px', border: `1px solid ${C.outlineVariant}33`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="lg:col-span-2">
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.outlineVariant}33`, background: C.surfaceContainerLowest, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 600, color: C.onSurface }}>Pedidos Recientes</h2>
              <a href="/admin/orders" style={{ color: C.primary, fontSize: '12px', textDecoration: 'none' }}>Ver todos</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.surfaceContainerLow, borderBottom: `1px solid ${C.outlineVariant}33` }}>
                    {['ID Pedido', 'Cliente', 'Total', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 500, textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? recentOrders.map((order) => {
                    const st = getStatusStyle(order.estado);
                    return (
                      <tr key={order.id} style={{ borderBottom: `1px solid ${C.outlineVariant}1A` }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td style={{ padding: '12px 16px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', color: C.onSurface }}>
                          #{order.numeroConfirmacion?.split('-')[2] || order.id.slice(-6)}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.onSurface, fontSize: '14px' }}>
                          {order.comprador?.nombre || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', color: C.onSurface }}>
                          S/ {Number(order.total).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {order.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: C.onSurfaceVariant, fontSize: '14px' }}>
                        No hay pedidos recientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Voice Analytics Widget */}
          <div style={{ background: C.surfaceVoice, borderRadius: '16px', border: `1px solid ${C.borderMuted}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(33,21,39,0.4) 0%, transparent 100%)', pointerEvents: 'none' }} />
            <div className="relative" style={{ borderBottom: `1px solid ${C.borderMuted}80`, paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: C.textVoice, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: C.primaryFixedDim }}>graphic_eq</span>
                Intenciones de Voz
              </h2>
            </div>
            <div className="relative flex flex-col gap-3 flex-1">
              {[
                { label: 'Búsqueda de Producto', sub: 'SKU, Nombre, Categoría', pct: 45, color: C.primaryFixedDim },
                { label: 'Estado de Pedido', sub: 'Tracking, Tiempos', pct: 30, color: C.secondaryFixedDim },
                { label: 'Soporte General', sub: 'Políticas, Devoluciones', pct: 25, color: C.tertiaryFixedDim },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p style={{ color: C.textVoice, fontSize: '13px' }}>{item.label}</p>
                      <p style={{ color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px' }}>{item.sub}</p>
                    </div>
                    <span style={{ color: item.color, fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px' }}>{item.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: C.borderMuted, borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
