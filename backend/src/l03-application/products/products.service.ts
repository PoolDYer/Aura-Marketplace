import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { SimpleCacheService } from '../../l05-infrastructure/cache/simple-cache.service';
import { EstadoPublicacion } from '@prisma/client';
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
    private prisma: PrismaService,
    private cache: SimpleCacheService,
  ) {}

  async createProduct(vendedorId: string, data: CreateProductDto) {
    if (data.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    const category = await this.prisma.categoria.findUnique({
      where: { id: data.categoriaId },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const imageUrls = this.normalizeImageUrls(data);

    const product = await this.prisma.publicacion.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        vendedorId,
        categoriaId: data.categoriaId,
        estado: data.estado ?? EstadoPublicacion.BORRADOR,
        inventario: {
          create: {
            cantidad: Math.max(0, Number(data.stock ?? 0)),
            cantidadReservada: 0,
          },
        },
        imagenes: imageUrls.length
          ? {
              create: imageUrls.map((url, index) => ({
                url,
                orden: index,
                activa: true,
              })),
            }
          : undefined,
      },
      include: {
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
      },
    });

    this.clearProductCaches(vendedorId);

    return product;
  }

  async getVendorProducts(vendedorId: string) {
    return this.cache.getOrSet(`products:vendor:${vendedorId}`, this.vendorCacheTtlMs, () =>
      this.prisma.publicacion.findMany({
        where: {
          vendedorId,
          estado: { not: EstadoPublicacion.ELIMINADA },
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          categoria: true,
          inventario: true,
          imagenes: {
            where: { activa: true },
            orderBy: { orden: 'asc' },
          },
        },
      }),
    );
  }

  async getVendorProductById(vendedorId: string, id: string) {
    const product = await this.prisma.publicacion.findFirst({
      where: { id, vendedorId, estado: { not: EstadoPublicacion.ELIMINADA } },
      include: {
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');

    return product;
  }

  async updateVendorProduct(vendedorId: string, id: string, data: Partial<CreateProductDto>) {
    const product = await this.prisma.publicacion.findFirst({
      where: { id, vendedorId, estado: { not: EstadoPublicacion.ELIMINADA } },
      include: { inventario: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');
    if (data.precio !== undefined && data.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    const updated = await this.prisma.publicacion.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        categoriaId: data.categoriaId,
        estado: data.estado,
      },
    });

    if (data.stock !== undefined) {
      const availableStock = Math.max(0, Number(data.stock));
      const reservedStock = Math.max(0, Number(product.inventario?.cantidadReservada ?? 0));

      await this.prisma.inventario.upsert({
        where: { publicacionId: id },
        create: {
          publicacionId: id,
          cantidad: availableStock,
          cantidadReservada: 0,
        },
        update: {
          cantidad: reservedStock + availableStock,
        },
      });
    }

    if (data.imagenUrl !== undefined || data.imageUrls !== undefined) {
      const imageUrls = this.normalizeImageUrls(data);

      await this.prisma.imagenPublicacion.deleteMany({
        where: { publicacionId: id },
      });

      if (imageUrls.length) {
        await this.prisma.imagenPublicacion.createMany({
          data: imageUrls.map((url, index) => ({
            publicacionId: id,
            url,
            orden: index,
            activa: true,
          })),
        });
      }
    }

    this.clearProductCaches(vendedorId, id);

    return this.getVendorProductById(vendedorId, updated.id);
  }

  async updateVendorProductStatus(vendedorId: string, id: string, estado: EstadoPublicacion) {
    const product = await this.prisma.publicacion.findFirst({
      where: { id, vendedorId, estado: { not: EstadoPublicacion.ELIMINADA } },
    });

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');

    const updated = await this.prisma.publicacion.update({
      where: { id },
      data: { estado },
    });

    this.clearProductCaches(vendedorId, id);

    return updated;
  }

  async deleteVendorProduct(vendedorId: string, id: string) {
    const product = await this.prisma.publicacion.findFirst({
      where: { id, vendedorId, estado: { not: EstadoPublicacion.ELIMINADA } },
    });

    if (!product) throw new NotFoundException('Producto no encontrado o sin permiso');

    const deleted = await this.prisma.publicacion.update({
      where: { id },
      data: { estado: EstadoPublicacion.ELIMINADA },
    });

    this.clearProductCaches(vendedorId, id);

    return deleted;
  }

  async getProducts() {
    return this.cache.getOrSet('products:active', this.publicCacheTtlMs, () =>
      this.prisma.publicacion.findMany({
        where: { estado: EstadoPublicacion.ACTIVA },
        include: {
          categoria: true,
          inventario: true,
          imagenes: {
            where: { activa: true },
            orderBy: { orden: 'asc' },
          },
          promociones: {
            where: { activa: true },
          },
        },
      }),
    );
  }

  async getProductById(id: string) {
    const product = await this.cache.getOrSet(`products:detail:${id}`, this.publicCacheTtlMs, () =>
      this.prisma.publicacion.findFirst({
        where: { id, estado: EstadoPublicacion.ACTIVA },
        include: {
          vendedor: {
            select: { id: true, nombre: true },
          },
          categoria: true,
          inventario: true,
          imagenes: {
            where: { activa: true },
            orderBy: { orden: 'asc' },
          },
          promociones: {
            where: { activa: true },
          },
        },
      }),
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
          .filter(Boolean),
      ),
    );
  }
}
