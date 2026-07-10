import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi, Order } from '../../api/orders';

const C = {
  primary: '#845400', primaryContainer: '#ffb347', secondary: '#006b5b',
  secondaryContainer: '#96f0db', bgCatalog: '#FAF6F8', surfaceCatalog: '#FFFFFF',
  surfaceContainerLowest: '#ffffff', surfaceContainerLow: '#f6f2f4',
  surfaceContainer: '#f1edef', surfaceContainerHigh: '#ebe7e9',
  surfaceContainerHighest: '#e5e1e3',
  onSurface: '#1c1b1d', onSurfaceVariant: '#524535',
  outlineVariant: '#d6c3b0', outline: '#847463',
  onPrimary: '#ffffff', onPrimaryContainer: '#704700',
  onSecondary: '#ffffff', onSecondaryContainer: '#00705f',
};

const STATUS_STEPS = ['PENDIENTE', 'CONFIRMADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA'];

const getStatusStyle = (estado: string) => {
  switch (estado) {
    case 'ENTREGADA': return { bg: `${C.secondaryContainer}60`, color: C.onSecondaryContainer, icon: 'check_circle', label: 'Entregado' };
    case 'DESPACHADA': return { bg: `${C.primaryContainer}40`, color: C.onPrimaryContainer, icon: 'local_shipping', label: 'En Camino' };
    case 'EN_PREPARACION': return { bg: '#f5d9fd80', color: '#5d4865', icon: 'manufacturing', label: 'En Preparación' };
    case 'CONFIRMADA': return { bg: `${C.secondaryContainer}40`, color: C.onSecondaryContainer, icon: 'verified', label: 'Confirmada' };
    case 'PENDIENTE': return { bg: `${C.primaryContainer}20`, color: C.onPrimaryContainer, icon: 'schedule', label: 'Pendiente' };
    case 'CANCELADA': return { bg: '#ffdad640', color: '#93000a', icon: 'cancel', label: 'Cancelada' };
    default: return { bg: C.surfaceContainerHighest, color: C.onSurfaceVariant, icon: 'package_2', label: estado };
  }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersApi.getOrderById(id).then(res => setOrder(res.data)).catch(console.error).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ background: C.bgCatalog }} className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${C.primaryContainer} transparent` }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ background: C.bgCatalog, minHeight: '100vh', padding: '40px 24px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '56px', color: C.onSurfaceVariant, display: 'block', marginBottom: '12px' }}>search_off</span>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 600, color: C.onSurface, marginBottom: '8px' }}>Orden no encontrada</h2>
        <Link to="/profile/orders" style={{ color: C.primary, fontSize: '14px' }}>← Volver a mis órdenes</Link>
      </div>
    );
  }

  const st = getStatusStyle(order.estado);
  const currentStep = STATUS_STEPS.indexOf(order.estado);

  return (
    <div style={{ background: C.bgCatalog, fontFamily: "'General Sans', sans-serif", minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.outlineVariant}33`, background: C.surfaceContainerLowest, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/profile/orders"
          style={{ padding: '8px', borderRadius: '9999px', color: C.onSurfaceVariant, display: 'flex', textDecoration: 'none', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.surfaceContainerHigh}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px', fontWeight: 600, color: C.onSurface, marginBottom: '2px' }}>
            Detalle de Orden
          </h2>
          <p style={{ color: C.onSurfaceVariant, fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px' }}>#{order.numeroConfirmacion}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ background: st.bg, color: st.color, padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'IBM Plex Mono', monospace" }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{st.icon}</span>
            {st.label}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Status Timeline (only for non-cancelled) */}
        {order.estado !== 'CANCELADA' && (
          <div style={{ background: C.surfaceCatalog, borderRadius: '16px', padding: '20px 24px', border: `1px solid ${C.outlineVariant}1A`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '16px', fontWeight: 600, color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ color: C.primary }}>timeline</span>
              Seguimiento
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: isCurrent ? '32px' : '24px', height: isCurrent ? '32px' : '24px',
                        borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? C.secondary : C.surfaceContainerHigh,
                        border: isCurrent ? `3px solid ${C.secondaryContainer}` : 'none',
                        transition: 'all 0.3s',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: done ? C.onSecondary : C.onSurfaceVariant, fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>
                          {done ? 'check' : 'radio_button_unchecked'}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: done ? C.secondary : C.onSurfaceVariant, fontWeight: isCurrent ? 700 : 400, marginTop: '4px', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap' }}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div style={{ height: '2px', flex: 1, background: idx < currentStep ? C.secondary : C.surfaceContainerHigh, marginBottom: '14px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Products */}
          <div className="md:col-span-2" style={{ background: C.surfaceCatalog, borderRadius: '16px', padding: '20px', border: `1px solid ${C.outlineVariant}1A`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '16px', fontWeight: 600, color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ color: C.primary }}>shopping_bag</span>
              Productos ({order.lineas.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.lineas.map(linea => (
                <div key={linea.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', borderRadius: '10px', background: C.surfaceContainerLowest, border: `1px solid ${C.outlineVariant}1A` }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: C.surfaceContainerHigh, overflow: 'hidden', flexShrink: 0 }}>
                    {linea.publicacion?.imagenes?.[0]?.url && (
                      <img src={linea.publicacion.imagenes[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.onSurface, fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{linea.nombreProducto}</p>
                    <p style={{ color: C.onSurfaceVariant, fontSize: '12px' }}>Cant: {linea.cantidad}</p>
                  </div>
                  <p style={{ color: C.onSurface, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px' }}>
                    ${Number(linea.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.outlineVariant}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: C.onSurfaceVariant, fontSize: '14px' }}>Total del Pedido</span>
              <span style={{ color: C.onSurface, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", fontSize: '20px' }}>
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Shipping */}
            <div style={{ background: C.surfaceCatalog, borderRadius: '16px', padding: '16px', border: `1px solid ${C.outlineVariant}1A`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '15px', fontWeight: 600, color: C.onSurface, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.primary }}>location_on</span>
                Dirección de Envío
              </h3>
              {order.direccion ? (
                <div style={{ color: C.onSurfaceVariant, fontSize: '13px', lineHeight: 1.6 }}>
                  <p style={{ color: C.onSurface, fontWeight: 500 }}>{order.direccion.calle}</p>
                  <p>{order.direccion.ciudad}, {order.direccion.estado} {order.direccion.codigoPostal}</p>
                </div>
              ) : <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>No disponible</p>}
            </div>

            {/* Payment */}
            <div style={{ background: C.surfaceCatalog, borderRadius: '16px', padding: '16px', border: `1px solid ${C.outlineVariant}1A`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '15px', fontWeight: 600, color: C.onSurface, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.primary }}>credit_card</span>
                Pago
              </h3>
              {order.pago ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>Estado</span>
                    <span style={{ color: C.onSurface, fontSize: '13px', fontWeight: 500 }}>{order.pago.estado}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>Método</span>
                    <span style={{ color: C.onSurface, fontSize: '13px', fontWeight: 500 }}>{order.pago.metodoPago || 'N/A'}</span>
                  </div>
                </div>
              ) : <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>No disponible</p>}
            </div>

            {/* Order Info */}
            <div style={{ background: C.surfaceCatalog, borderRadius: '16px', padding: '16px', border: `1px solid ${C.outlineVariant}1A`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '15px', fontWeight: 600, color: C.onSurface, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.primary }}>info</span>
                Detalles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>Fecha</span>
                  <span style={{ color: C.onSurface, fontSize: '13px', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('es')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>ID Orden</span>
                  <span style={{ color: C.onSurface, fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>#{order.numeroConfirmacion?.split('-')[2]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
