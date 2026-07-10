import { useState, useEffect } from 'react';
import { usersApi } from '../../api/users';

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
  bgVoice: '#211527', surfaceVoice: '#2E1C36',
  textVoice: '#F5EEF0', textMuted: '#C9B8CE', borderMuted: '#4A2F52',
  secondaryFixedDim: '#7dd7c2',
};

interface PrefRow {
  key: string;
  icon: string;
  title: string;
  desc: string;
  fixed?: boolean;
}

const PREF_ROWS: PrefRow[] = [
  { key: 'notifNuevaOrden', icon: 'shopping_bag', title: 'Nuevas Órdenes', desc: 'Recibe alertas sobre compras o ventas nuevas.' },
  { key: 'notifEstadoOrden', icon: 'local_shipping', title: 'Estado de Órdenes', desc: 'Actualizaciones cuando tu orden cambia de estado.' },
  { key: 'notifMarketing', icon: 'campaign', title: 'Marketing y Promociones', desc: 'Ofertas, cupones y novedades del marketplace.' },
  { key: 'notifSeguridad', icon: 'security', title: 'Alertas de Seguridad', desc: 'Avisos de inicio de sesión o cambios de contraseña. (Obligatorio)', fixed: true },
];

const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    disabled={disabled}
    style={{
      width: '44px', height: '26px', borderRadius: '9999px', padding: '3px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: value ? C.secondary : C.surfaceContainerHighest, transition: 'all 0.25s', position: 'relative', flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <div style={{
      width: '20px', height: '20px', borderRadius: '9999px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      transform: value ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 0.25s',
    }} />
  </button>
);

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    usersApi.getPreferences().then(res => setPrefs(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (field: string, value: boolean) => {
    const updated = { ...prefs, [field]: value };
    setPrefs(updated);
    try {
      await usersApi.updatePreferences({ [field]: value });
      setSaved(field);
      setTimeout(() => setSaved(''), 2000);
    } catch { alert('Error actualizando preferencia'); }
  };

  if (loading) {
    return (
      <div style={{ background: C.bgCatalog }} className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${C.primaryContainer} transparent` }} />
      </div>
    );
  }

  return (
    <div style={{ background: C.bgCatalog, fontFamily: "'General Sans', sans-serif", minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.outlineVariant}33`, background: C.surfaceContainerLowest }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 600, color: C.onSurface, marginBottom: '4px' }}>Preferencias</h2>
        <p style={{ color: C.onSurfaceVariant, fontSize: '14px' }}>Personaliza tus notificaciones y ajustes del asistente.</p>
      </div>

      <div style={{ padding: '24px', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Notifications */}
        <div style={{ background: C.surfaceCatalog, borderRadius: '16px', border: `1px solid ${C.outlineVariant}1A`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.outlineVariant}33`, background: C.surfaceContainerLowest }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '18px', fontWeight: 600, color: C.onSurface, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: C.primary }}>notifications</span>
              Notificaciones
            </h3>
          </div>

          {PREF_ROWS.map((row, idx) => (
            <div key={row.key}
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: idx < PREF_ROWS.length - 1 ? `1px solid ${C.outlineVariant}1A` : 'none', opacity: row.fixed ? 0.65 : 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${C.secondaryContainer}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.onSecondaryContainer }}>{row.icon}</span>
                </div>
                <div>
                  <p style={{ color: C.onSurface, fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{row.title}</p>
                  <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>{row.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {saved === row.key && (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.secondary }}>check_circle</span>
                )}
                <Toggle
                  value={row.fixed ? true : (prefs?.[row.key] ?? false)}
                  onChange={v => handleToggle(row.key, v)}
                  disabled={row.fixed}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Voice Assistant Preferences */}
        <div style={{ background: C.surfaceVoice, borderRadius: '16px', border: `1px solid ${C.borderMuted}`, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '160px', height: '160px', background: `${C.secondaryContainer}15`, borderRadius: '9999px', filter: 'blur(40px)' }} />
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.borderMuted}80`, position: 'relative' }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '18px', fontWeight: 600, color: C.textVoice, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: C.secondaryFixedDim }}>record_voice_over</span>
              Asistente de Voz
            </h3>
          </div>

          {[
            { label: 'Asistente Activo', value: true, key: 'voiceActive' },
            { label: 'Velocidad de Respuesta', value: false, key: 'voiceSpeed', display: 'Normal' },
            { label: 'Idioma Principal', value: false, key: 'voiceLang', display: 'Español (MX)' },
          ].map((item, i) => (
            <div key={item.key} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < 2 ? `1px solid ${C.borderMuted}50` : 'none', position: 'relative' }}>
              <span style={{ color: C.textVoice, fontSize: '14px' }}>{item.label}</span>
              {item.display ? (
                <span style={{ color: C.secondaryFixedDim, fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px' }}>{item.display}</span>
              ) : (
                <Toggle value={item.value} onChange={() => {}} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
