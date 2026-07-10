import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ImagePlus,
  Layers3,
  Loader2,
  Package,
  Palette,
  Save,
  UploadCloud,
  X,
} from 'lucide-react';

import { categoriesApi } from '../../api/categories';
import { productsApi } from '../../api/products';

type Category = {
  id: string;
  nombre: string;
};

type VendorProduct = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string | number;
  estado: 'BORRADOR' | 'ACTIVA' | 'INACTIVA';
  categoriaId: string;
  inventario?: { cantidad: number; cantidadReservada: number };
  imagenes?: Array<{ url: string }>;
};

const swatches = [
  { name: 'Lino claro', value: '#E5DCC5' },
  { name: 'Salvia', value: '#A3B19B' },
  { name: 'Grafito', value: '#4A4A4A' },
];

const materials = ['Acabado madera natural', 'Roble oscuro', 'Nogal', 'Tela premium', 'Cerámica artesanal'];

const statusOptions = [
  { value: 'ACTIVA', label: 'Publicar ahora' },
  { value: 'BORRADOR', label: 'Guardar como borrador' },
  { value: 'INACTIVA', label: 'Guardar inactivo' },
];

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' ');
  }

  return responseMessage || fallback;
};

const getAvailableStock = (product: VendorProduct) => {
  const total = Number(product.inventario?.cantidad ?? 0);
  const reserved = Number(product.inventario?.cantidadReservada ?? 0);
  return Math.max(0, total - reserved);
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [stock, setStock] = useState('10');
  const [estado, setEstado] = useState<'BORRADOR' | 'ACTIVA' | 'INACTIVA'>('ACTIVA');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImageSlot, setSelectedImageSlot] = useState(0);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [selectedSwatch, setSelectedSwatch] = useState(swatches[0].value);
  const [material, setMaterial] = useState(materials[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadForm = async () => {
      setIsLoading(Boolean(id));
      try {
        const [categoryRes, productRes] = await Promise.all([
          categoriesApi.getCategories().catch(() => ({ data: [] })),
          id ? productsApi.getVendorProductById(id) : Promise.resolve({ data: null }),
        ]);

        if (ignore) return;

        setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);

        const product = productRes.data as VendorProduct | null;
        if (product) {
          setNombre(product.nombre || '');
          setDescripcion(product.descripcion || '');
          setPrecio(String(product.precio ?? ''));
          setCategoriaId(product.categoriaId || '');
          setStock(String(getAvailableStock(product)));
          setEstado(product.estado || 'BORRADOR');
          setImageUrls((product.imagenes || []).map((image) => image.url).filter(Boolean));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadForm().catch(() => {
      if (!ignore) {
        setMessage('No se pudo cargar el producto.');
        setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [id]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoriaId)?.nombre || 'Sin categoría',
    [categories, categoriaId],
  );

  const pricePreview = Number(precio || 0) > 0 ? currency.format(Number(precio)) : 'S/ 0.00';
  const hasImage = Boolean(imageUrls[0]);
  const isBusy = isSaving || uploadingSlot !== null;

  const openImagePicker = (slot: number) => {
    setSelectedImageSlot(slot);
    fileInputRef.current?.click();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('La imagen no debe superar los 5MB.');
      return;
    }

    setMessage(null);
    setUploadingSlot(selectedImageSlot);
    try {
      const response = await productsApi.uploadProductImage(file, id);
      setImageUrls((current) => {
        const next = [...current];
        next[selectedImageSlot] = response.data.url;
        return next.filter(Boolean);
      });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo subir la imagen a Cloudinary. Revisa la configuración del servidor.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const parsedPrice = Number(precio);
    const parsedStock = Number(stock);

    if (!nombre.trim()) {
      setMessage('Ingresa un título para el producto.');
      return;
    }

    if (!categoriaId) {
      setMessage('Selecciona una categoría.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage('El precio debe ser mayor a 0.');
      return;
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setMessage('El stock no puede ser negativo.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parsedPrice,
      categoriaId,
      stock: Math.floor(parsedStock),
      estado,
      imageUrls: imageUrls.filter(Boolean),
    };

    setIsSaving(true);
    try {
      if (id) {
        await productsApi.updateProduct(id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      navigate('/vendor/catalog');
    } catch (error) {
      console.error(error);
      setMessage(getApiErrorMessage(error, isEditing ? 'No se pudo actualizar el producto.' : 'No se pudo guardar el producto.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F8] text-[#211527]">
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-12 lg:px-8 lg:py-12">
        <section className="lg:col-span-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              to="/vendor/catalog"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d6c3b0]/50 bg-white px-4 text-[14px] font-semibold text-[#524535] transition hover:bg-[#f6f2f4] hover:text-[#845400]"
            >
              <ArrowLeft className="h-4 w-4" />
              Catálogo
            </Link>
            <span className="hidden rounded-full bg-white px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-[#845400] shadow-sm sm:inline-flex">
              {isEditing ? 'Modo edición' : 'Nuevo producto'}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => openImagePicker(0)}
              disabled={uploadingSlot !== null}
              className="group relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d6c3b0] bg-[#f1edef] text-center transition hover:border-[#845400]"
            >
              {hasImage ? (
                <>
                  <img src={imageUrls[0]} alt={nombre || 'Vista previa del producto'} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#211527]/45 opacity-0 transition group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#845400]">
                      <UploadCloud className="h-5 w-5" />
                      Cambiar imagen
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ImagePlus className="mb-3 h-12 w-12 text-[#C9B8CE]" />
                  <p className="text-[14px] text-[#524535]">Sube la imagen principal</p>
                  <p className="mt-1 text-[12px] text-[#847463]">PNG, JPG, max 5MB</p>
                </>
              )}
              {uploadingSlot === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 text-[#845400] backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-[14px] font-semibold">Subiendo a Cloudinary...</span>
                </div>
              ) : null}
            </button>

            <input ref={fileInputRef} onChange={handleFile} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" />

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => openImagePicker(slot)}
                  disabled={uploadingSlot !== null}
                  className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#d6c3b0] bg-[#f1edef] text-[#C9B8CE] transition hover:border-[#845400] hover:text-[#845400]"
                  aria-label={`Agregar imagen secundaria ${slot}`}
                >
                  {imageUrls[slot] ? <img src={imageUrls[slot]} alt={`Imagen ${slot + 1}`} className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}
                  {uploadingSlot === slot ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-[#845400]" />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-[#d6c3b0]/30 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-auth-display text-[20px] font-semibold text-[#845400]">{nombre || 'Nombre del producto'}</p>
                  <p className="text-[13px] text-[#524535]">{selectedCategory} · {stock || 0} unidades</p>
                </div>
                <p className="font-auth-display text-[28px] font-bold text-[#211527]">{pricePreview}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="flex min-h-full flex-col gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl lg:p-8">
            <div>
              <h1 className="font-auth-display text-[32px] font-bold leading-10 text-[#845400]">
                {isEditing ? 'Editar producto' : 'Agregar producto'}
              </h1>
              <p className="mt-2 text-[14px] leading-5 text-[#524535]">
                Construye una publicación clara, visual y lista para vender en Aura.
              </p>
            </div>

            {isLoading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#845400]" />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Título del Producto</label>
                  <input
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    className="w-full rounded-lg border border-[#d6c3b0] bg-white px-4 py-3 font-auth-display text-[24px] font-semibold leading-8 text-[#211527] outline-none transition placeholder:text-[#dcd9db] focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                    placeholder="Ej: Sillón Lounge Serenidad"
                    type="text"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Precio (PEN)</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-auth-display text-[22px] font-semibold text-[#524535]">S/</span>
                      <input
                        value={precio}
                        onChange={(event) => setPrecio(event.target.value)}
                        className="w-full rounded-lg border border-[#d6c3b0] bg-white py-3 pl-12 pr-4 font-auth-display text-[24px] font-semibold leading-8 text-[#211527] outline-none transition placeholder:text-[#dcd9db] focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                        placeholder="0.00"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Stock</label>
                    <div className="relative">
                      <Box className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
                      <input
                        value={stock}
                        onChange={(event) => setStock(event.target.value)}
                        className="w-full rounded-lg border border-[#d6c3b0] bg-white py-3 pl-12 pr-4 font-auth-display text-[24px] font-semibold leading-8 text-[#211527] outline-none transition placeholder:text-[#dcd9db] focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                        placeholder="0"
                        type="number"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-wide text-[#524535]">Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    className="min-h-[132px] w-full resize-none rounded-lg border border-[#d6c3b0] bg-white px-4 py-3 text-[16px] leading-6 text-[#211527] outline-none transition placeholder:text-[#dcd9db] focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                    placeholder="Describe los materiales, ergonomía y la sensación de calma que aporta..."
                    rows={4}
                    required
                  />
                </div>

                <div className="border-t border-[#e5e1e3] py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <label className="font-auth-display text-[20px] font-semibold text-[#211527]">Variantes de Color</label>
                    <button type="button" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#006b5b]">
                      <Palette className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {swatches.map((swatch) => (
                      <button
                        key={swatch.value}
                        type="button"
                        onClick={() => setSelectedSwatch(swatch.value)}
                        className={`h-10 w-10 rounded-full border-2 border-white transition ${
                          selectedSwatch === swatch.value ? 'ring-2 ring-[#d6c3b0]' : 'ring-2 ring-transparent hover:ring-[#d6c3b0]'
                        }`}
                        style={{ backgroundColor: swatch.value }}
                        aria-label={swatch.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="font-auth-display text-[20px] font-semibold text-[#211527]">Acabado / Material</label>
                    <div className="relative">
                      <select
                        value={material}
                        onChange={(event) => setMaterial(event.target.value)}
                        className="h-12 w-full appearance-none rounded-lg border border-[#d6c3b0] bg-white px-4 pr-10 text-[15px] text-[#211527] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                      >
                        {materials.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-auth-display text-[20px] font-semibold text-[#211527]">Categoría</label>
                    <div className="relative">
                      <Layers3 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
                      <select
                        value={categoriaId}
                        onChange={(event) => setCategoriaId(event.target.value)}
                        className="h-12 w-full appearance-none rounded-lg border border-[#d6c3b0] bg-white pl-10 pr-10 text-[15px] text-[#211527] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                        required
                      >
                        <option value="">Seleccionar</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="flex flex-col gap-2">
                    <label className="font-auth-display text-[20px] font-semibold text-[#211527]">Estado</label>
                    <div className="relative">
                      <Package className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
                      <select
                        value={estado}
                        onChange={(event) => setEstado(event.target.value as 'BORRADOR' | 'ACTIVA' | 'INACTIVA')}
                        className="h-12 w-full appearance-none rounded-lg border border-[#d6c3b0] bg-white pl-10 pr-10 text-[15px] text-[#211527] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#ffb347]"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#524535]" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#d6c3b0]/50 bg-white p-3 sm:min-w-[156px]">
                    <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-[#524535]">
                      <CircleDollarSign className="h-4 w-4" />
                      Vista previa
                    </div>
                    <p className="mt-1 font-auth-display text-[22px] font-bold text-[#845400]">{pricePreview}</p>
                  </div>
                </div>

                {message ? (
                  <div className="flex items-start gap-2 rounded-xl bg-[#ffdad6] px-4 py-3 text-[14px] text-[#93000a]">
                    <X className="mt-0.5 h-4 w-4 flex-none" />
                    {message}
                  </div>
                ) : null}

                <div className="mt-auto flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ffb347] font-auth-display text-[20px] font-semibold text-[#704700] shadow-sm transition hover:bg-[#ffb95a] hover:shadow-md active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {uploadingSlot !== null ? 'Subiendo imagen...' : isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar Producto'}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[12px] text-[#524535]">
                    <CheckCircle2 className="h-4 w-4 text-[#006b5b]" />
                    Los cambios se reflejan en Gestión de Catálogo.
                  </div>
                </div>
              </>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
