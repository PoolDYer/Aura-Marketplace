import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Edit3,
  ImageIcon,
  MapPin,
  Mic2,
  PackageCheck,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';

import { ordersApi, type Order } from '../../api/orders';
import { usersApi } from '../../api/users';
import { useAgentStore } from '../../store/agentStore';
import { useProfilePhotoStore } from '../../store/profilePhotoStore';
import { cn } from '../../lib/utils';

type Profile = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  fechaRegistro?: string;
};

type Address = {
  id: string;
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  referencia?: string;
  predeterminada?: boolean;
};

type AddressDraft = {
  etiqueta: string;
  direccion: string;
};

const emptyAddressDraft: AddressDraft = {
  etiqueta: '',
  direccion: '',
};

const statusMap: Record<string, { label: string; className: string }> = {
  ENTREGADA: { label: 'Entregado', className: 'bg-[#96f0db] text-[#00705f]' },
  DESPACHADA: { label: 'En Camino', className: 'bg-[#ffb347] text-[#704700]' },
  EN_PREPARACION: { label: 'Preparando', className: 'bg-[#ffddb6] text-[#643f00]' },
  CONFIRMADA: { label: 'Confirmada', className: 'bg-[#96f0db]/70 text-[#00705f]' },
  PENDIENTE: { label: 'Pendiente', className: 'bg-[#ffddb6]/70 text-[#704700]' },
  CANCELADA: { label: 'Cancelada', className: 'bg-[#ffdad6] text-[#93000a]' },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);
  return (initials || 'AU').toUpperCase();
}

function getOrderCode(order: Order) {
  return order.numeroConfirmacion?.split('-').pop() || order.numeroConfirmacion || order.id.slice(0, 8);
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(new Date(value));
}

function getFirstImage(order: Order) {
  return order.lineas?.[0]?.publicacion?.imagenes?.[0]?.url;
}

function getFirstProductName(order: Order) {
  return order.lineas?.[0]?.nombreProducto || `Pedido #${getOrderCode(order)}`;
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

function addressToDraft(address?: Address): AddressDraft {
  if (!address) return { etiqueta: 'Casa', direccion: '' };

  return {
    etiqueta: address.referencia || 'Casa',
    direccion: [address.calle, `${address.ciudad}, ${address.estado}, ${address.codigoPostal}`]
      .filter(Boolean)
      .join('\n'),
  };
}

function draftToAddressPayload(draft: AddressDraft, current?: Address) {
  const lines = draft.direccion
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const calle = lines[0] || '';
  const location = lines.slice(1).join(', ');
  const parts = location.split(',').map((part) => part.trim()).filter(Boolean);

  return {
    calle,
    ciudad: parts[0] || current?.ciudad || 'Sin ciudad',
    estado: parts[1] || current?.estado || 'Sin estado',
    codigoPostal: parts[2] || current?.codigoPostal || '00000',
    pais: current?.pais || 'Peru',
    referencia: draft.etiqueta || 'Casa',
  };
}

export default function ProfilePage() {
  const { toggleChat } = useAgentStore();
  const { photos, setPhoto } = useProfilePhotoStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(emptyAddressDraft);
  const [newAddressDraft, setNewAddressDraft] = useState<AddressDraft>({ etiqueta: 'Casa', direccion: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      usersApi.getProfile(),
      ordersApi.getMyOrders(),
      usersApi.getAddresses(),
    ]).then(([profileResult, ordersResult, addressesResult]) => {
      if (!active) return;

      if (profileResult.status === 'fulfilled') {
        const nextProfile = profileResult.value.data;
        setProfile(nextProfile);
        setNombre(nextProfile.nombre || '');
        setTelefono(nextProfile.telefono || '');
      }

      if (ordersResult.status === 'fulfilled') {
        setRecentOrders((ordersResult.value.data || []).slice(0, 2));
      }

      if (addressesResult.status === 'fulfilled') {
        setAddresses(addressesResult.value.data || []);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.predeterminada) || addresses[0],
    [addresses],
  );

  const initials = getInitials(profile?.nombre || nombre || 'Aura');
  const profilePhoto = profile?.id ? photos[profile.id] : undefined;

  useEffect(() => {
    if (!editingAddressId) {
      setAddressDraft(addressToDraft(defaultAddress));
    }
  }, [defaultAddress, editingAddressId]);

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await usersApi.updateProfile({ nombre, telefono });
      setProfile((current) => ({ ...current!, ...response.data, nombre, telefono }));
      setEditing(false);
    } catch {
      setError('No pudimos guardar los cambios. Intentalo nuevamente.');
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

  const reloadAddresses = async () => {
    const response = await usersApi.getAddresses();
    setAddresses(response.data || []);
  };

  const handleSaveAddress = async (event: FormEvent<HTMLFormElement>, address: Address) => {
    event.preventDefault();

    setAddressError('');
    setAddressSaving(true);
    try {
      await usersApi.updateAddress(address.id, draftToAddressPayload(addressDraft, address));
      await reloadAddresses();
      setEditingAddressId(null);
    } catch {
      setAddressError('No pudimos guardar la direccion.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleCreateAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setAddressError('');
    setAddressSaving(true);
    try {
      await usersApi.createAddress(draftToAddressPayload(newAddressDraft));
      setNewAddressDraft({ etiqueta: 'Casa', direccion: '' });
      setShowNewAddress(false);
      await reloadAddresses();
    } catch {
      setAddressError('No pudimos crear la direccion.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddressError('');
    setAddressSaving(true);
    try {
      await usersApi.deactivateAddress(addressId);
      if (editingAddressId === addressId) {
        setEditingAddressId(null);
      }
      await reloadAddresses();
    } catch {
      setAddressError('No pudimos eliminar la direccion.');
    } finally {
      setAddressSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#FAF6F8]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffb347] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="aura-profile-page">
      <div className="aura-profile-shell">
        <aside className="aura-profile-sidebar">
          <section className="aura-profile-card">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {editing ? (
              <form onSubmit={handleUpdate} className="aura-profile-form">
                <div className="aura-profile-avatar-wrap">
                  <div className="aura-profile-avatar aura-profile-avatar-edit">
                    <div className="aura-profile-avatar-inner">
                      {profilePhoto ? <img src={profilePhoto} alt={profile.nombre} /> : initials}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aura-profile-avatar-action"
                      aria-label="Cambiar foto de perfil"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="aura-profile-fields">
                  <label className="aura-profile-field">
                    <span>Nombre y Apellido</span>
                    <input
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      className="aura-profile-input"
                    />
                  </label>

                  <label className="aura-profile-field">
                    <span>Correo electronico</span>
                    <input
                      value={profile.email}
                      disabled
                      className="aura-profile-input"
                    />
                  </label>

                  <label className="aura-profile-field">
                    <span>Telefono</span>
                    <input
                      value={telefono}
                      onChange={(event) => setTelefono(event.target.value)}
                      className="aura-profile-input"
                    />
                  </label>

                  <label className="aura-profile-field">
                    <span>Rol</span>
                    <input
                      value={profile.rol || 'Usuario'}
                      disabled
                      className="aura-profile-input"
                    />
                  </label>

                  <label className="aura-profile-field">
                    <span>Estado</span>
                    <input
                      value={profile.estado || 'Activo'}
                      disabled
                      className="aura-profile-input"
                    />
                  </label>
                </div>

                {error ? <p className="rounded-lg bg-[#ffdad6] px-4 py-2 text-sm text-[#93000a]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="aura-profile-save"
                >
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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aura-profile-check"
                      aria-label="Cambiar foto de perfil"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="aura-profile-identity">
                  <h1>{profile.nombre}</h1>
                  <p>{profile.email}</p>
                </div>

                <div className="aura-profile-info">
                  <InfoRow label="Telefono" value={profile.telefono || 'Sin registrar'} />
                  <InfoRow label="Rol" value={profile.rol || 'Usuario'} />
                  <InfoRow label="Estado" value={profile.estado || 'Activo'} />
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="aura-profile-edit"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </button>
              </div>
            )}
          </section>

          <section className="aura-voice-card">
            <div className="aura-voice-glow" />
            <h2>
              <Mic2 className="h-4 w-4" />
              Voz
            </h2>
            <div className="aura-voice-rows">
              <button
                type="button"
                onClick={toggleChat}
                className="aura-voice-row aura-voice-row-border"
              >
                <span>Asistente</span>
                <span className="aura-voice-toggle">
                  <span />
                </span>
              </button>
              <div className="aura-voice-row">
                <span>Idioma</span>
                <strong>Espanol (MX)</strong>
              </div>
            </div>
          </section>
        </aside>

        <div className="aura-profile-main">
          <section className="aura-profile-section">
            <div className="aura-profile-section-head">
              <h2>
                <Truck className="h-4 w-4" />
                Mis Pedidos
              </h2>
              <Link to="/profile/orders">
                Ver historial
              </Link>
            </div>

            <div className="aura-orders-card">
              {recentOrders.length === 0 ? (
                <div className="aura-empty-state">
                  <PackageCheck className="h-10 w-10 text-[#d6c3b0]" />
                  <p className="text-[14px] text-[#524535]">No tienes pedidos recientes.</p>
                  <Link to="/catalog" className="text-[14px] font-semibold text-[#845400] hover:underline">
                    Ir al catalogo
                  </Link>
                </div>
              ) : (
                recentOrders.map((order, index) => {
                  const status = statusMap[order.estado] || {
                    label: order.estado,
                    className: 'bg-[#e5e1e3] text-[#524535]',
                  };
                  const image = getFirstImage(order);

                  return (
                    <Link
                      key={order.id}
                      to={`/profile/orders/${order.id}`}
                      className={cn('aura-order-row', index > 0 ? 'aura-order-row-border' : '')}
                    >
                      <div className="aura-order-thumb">
                        {image ? (
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="aura-order-copy">
                        <p>
                          {getFirstProductName(order)}
                        </p>
                        <span>
                          #{getOrderCode(order)} - {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <span className={cn('aura-order-status', status.className)}>
                        {status.label}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          <section className="aura-profile-section">
            <h2 className="aura-profile-section-title">
              <MapPin className="h-4 w-4" />
              Direcciones
            </h2>

            <div className="aura-address-grid">
              {addresses.map((address, index) =>
                editingAddressId === address.id ? (
                  <AddressEditorCard
                    key={address.id}
                    draft={addressDraft}
                    onChange={setAddressDraft}
                    onSubmit={(event) => handleSaveAddress(event, address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    saving={addressSaving}
                    submitLabel="Guardar"
                    showDefault={index === 0}
                  />
                ) : (
                  <article key={address.id} className="aura-address-card">
                    <div className="aura-address-head">
                      <h3>{address.referencia || 'Casa'}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressDraft(addressToDraft(address));
                          setEditingAddressId(address.id);
                          setShowNewAddress(false);
                        }}
                        aria-label="Editar direccion"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    </div>
                    <p>
                      {address.calle}
                      <br />
                      {address.ciudad}, {address.estado}, {address.codigoPostal}
                    </p>
                    {index === 0 ? <span>Predeterminada</span> : null}
                  </article>
                ),
              )}

              {showNewAddress || addresses.length === 0 ? (
                <AddressEditorCard
                  draft={newAddressDraft}
                  onChange={setNewAddressDraft}
                  onSubmit={handleCreateAddress}
                  saving={addressSaving}
                  submitLabel="Guardar"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAddress(true);
                    setEditingAddressId(null);
                  }}
                  className="aura-address-add"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-[14px]">Nueva Direccion</span>
                </button>
              )}
            </div>
            {addressError ? <p className="aura-address-error">{addressError}</p> : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function AddressEditorCard({
  draft,
  onChange,
  onSubmit,
  onDelete,
  saving,
  submitLabel,
  showDefault = false,
}: {
  draft: AddressDraft;
  onChange: (draft: AddressDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  saving: boolean;
  submitLabel: string;
  showDefault?: boolean;
}) {
  return (
    <form className="aura-address-edit-card" onSubmit={onSubmit}>
      <label className="aura-address-edit-field">
        <span>Etiqueta</span>
        <input
          value={draft.etiqueta}
          onChange={(event) => onChange({ ...draft, etiqueta: event.target.value })}
          placeholder="Casa"
          required
        />
      </label>

      <label className="aura-address-edit-field">
        <span>Direccion</span>
        <textarea
          value={draft.direccion}
          onChange={(event) => onChange({ ...draft, direccion: event.target.value })}
          placeholder={'Av. de los Insurgentes Sur 105\nRoma Sur, Cuauhtemoc, 06760'}
          rows={2}
          required
        />
      </label>

      <div className="aura-address-edit-actions">
        {showDefault ? <span className="aura-address-default-pill">Predeterminada</span> : <span />}
        {onDelete ? (
          <button type="button" onClick={onDelete} className="aura-address-delete" aria-label="Eliminar direccion">
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
        <button type="submit" disabled={saving} className="aura-address-save">
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="aura-profile-info-row">
      <span>{label}</span>
      <strong>
        {value}
      </strong>
    </div>
  );
}
