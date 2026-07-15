import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { EstadoPublicacion } from '../../l04-domain/products/product.enums';
import { isPersistableProductImageUrl } from '../../l04-domain/products/image-url-policy';
import { IProductRepository } from '../../l04-domain/ports/product-repository.interface';
import { ICategoriaRepository } from '../../l04-domain/ports/categoria-repository.interface';
import { ICacheProvider } from '../../l04-domain/ports/cache-provider.interface';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  precio: number;

  @IsString()
  categoriaId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(EstadoPublicacion)
  estado?: EstadoPublicacion;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  imageUrls?: string[];
}

@Injectable()
export class ProductsService {
  private readonly publicCacheTtlMs = 60_000;
  private readonly vendorCacheTtlMs = 30_000;

  constructor(
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
    @Inject('ICategoriaRepository') private readonly categoryRepo: ICategoriaRepository,
    @Inject('ICacheProvider') private readonly cache: ICacheProvider,
  ) {}

  async createProduct(vendedorId: string, data: CreateProductDto) {
    if (data.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    const category = await this.categoryRepo.findById(data.categoriaId);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const imageUrls = this.normalizeImageUrls(data);
    const product = await this.productRepo.create(vendedorId, data, imageUrls);

    this.clearProductCaches(vendedorId);

    return product;
  }

  async getVendorProducts(vendedorId: string) {
    return this.cache.getOrSet(`products:vendor:${vendedorId}`, this.vendorCacheTtlMs, () =>
      this.productRepo.findManyByVendor(vendedorId),
    );
  }

  async getVendorProductById(vendedorId: string, id: string) {
    const product = await this.productRepo.findOneByVendorAndId(vendedorId, id);

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');

    return product;
  }

  async updateVendorProduct(vendedorId: string, id: string, data: Partial<CreateProductDto>) {
    const product = await this.productRepo.findOneByVendorAndId(vendedorId, id);

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');
    if (data.precio !== undefined && data.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    const updated = await this.productRepo.update(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      categoriaId: data.categoriaId,
      estado: data.estado,
    });

    if (data.stock !== undefined) {
      const availableStock = Math.max(0, Number(data.stock));
      const reservedStock = Math.max(0, Number(product.inventario?.cantidadReservada ?? 0));

      await this.productRepo.upsertInventario(id, availableStock, reservedStock);
    }

    if (data.imagenUrl !== undefined || data.imageUrls !== undefined) {
      const imageUrls = this.normalizeImageUrls(data);

      await this.productRepo.deleteManyImagenes(id);

      if (imageUrls.length) {
        await this.productRepo.createManyImagenes(
          imageUrls.map((url, index) => ({
            publicacionId: id,
            url,
            orden: index,
            activa: true,
          })),
        );
      }
    }

    this.clearProductCaches(vendedorId, id);

    return this.getVendorProductById(vendedorId, updated.id);
  }

  async updateVendorProductStatus(vendedorId: string, id: string, estado: EstadoPublicacion) {
    const product = await this.productRepo.findOneByVendorAndId(vendedorId, id);

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');

    const updated = await this.productRepo.updateStatus(id, estado);

    this.clearProductCaches(vendedorId, id);

    return updated;
  }

  async deleteVendorProduct(vendedorId: string, id: string) {
    const product = await this.productRepo.findOneByVendorAndId(vendedorId, id);

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');

    const deleted = await this.productRepo.updateStatus(id, EstadoPublicacion.ELIMINADA);

    this.clearProductCaches(vendedorId, id);

    return deleted;
  }

  async getProducts() {
    return this.cache.getOrSet('products:active', this.publicCacheTtlMs, () =>
      this.productRepo.findActiveProducts(),
    );
  }

  async getProductById(id: string) {
    const product = await this.cache.getOrSet(`products:detail:${id}`, this.publicCacheTtlMs, () =>
      this.productRepo.findActiveProductById(id),
    );

    if (!product) throw new NotFoundException('Producto no encontrado');

    return product;
  }

  private clearProductCaches(vendedorId?: string, productId?: string) {
    this.cache.delete('products:active');
    this.cache.deleteByPrefix('products:detail:');

    if (productId) {
      this.cache.delete(`products:detail:${productId}`);
    }

    if (vendedorId) {
      this.cache.delete(`products:vendor:${vendedorId}`);
    } else {
      this.cache.deleteByPrefix('products:vendor:');
    }
  }

  private normalizeImageUrls(data: Pick<CreateProductDto, 'imagenUrl' | 'imageUrls'>) {
    return Array.from(
      new Set(
        [
          ...(Array.isArray(data.imageUrls) ? data.imageUrls : []),
          data.imagenUrl,
        ]
          .filter((url): url is string => typeof url === 'string')
          .map((url) => url.trim())
          .filter(isPersistableProductImageUrl),
      ),
    );
  }
}
