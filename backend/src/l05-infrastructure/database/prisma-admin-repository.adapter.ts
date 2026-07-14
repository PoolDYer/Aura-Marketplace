import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IAdminRepository } from '../../l04-domain/ports/admin-repository.interface';

@Injectable()
export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsers(): Promise<any[]> {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        fechaRegistro: true,
        fechaActualizacion: true,
      },
    });
  }

  async findUserById(id: string): Promise<any | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async updateUserStatus(userId: string, estado: string): Promise<any> {
    return this.prisma.usuario.update({
      where: { id: userId },
      data: { estado: estado as any },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
      },
    });
  }

  async deactivateSellerProducts(userId: string): Promise<void> {
    await this.prisma.publicacion.updateMany({
      where: {
        vendedorId: userId,
        estado: 'ACTIVA',
      },
      data: {
        estado: 'INACTIVA',
      },
    });
  }

  async getReports(): Promise<{
    totalUsers: number;
    activeProducts: number;
    totalOrders: number;
    totalSales: number;
  }> {
    const totalUsers = await this.prisma.usuario.count();
    const activeProducts = await this.prisma.publicacion.count({ where: { estado: 'ACTIVA' } });
    const totalOrders = await this.prisma.orden.count();

    const sales = await this.prisma.orden.aggregate({
      _sum: { total: true },
      where: { estado: { notIn: ['CANCELADA', 'ESCALADA'] } },
    });

    return {
      totalUsers,
      activeProducts,
      totalOrders,
      totalSales: Number(sales._sum.total || 0),
    };
  }

  async findOrders(): Promise<any[]> {
    return this.prisma.orden.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        comprador: { select: { nombre: true, email: true } },
        lineas: {
          include: {
            publicacion: {
              select: { nombre: true, vendedor: { select: { nombre: true } } },
            },
          },
        },
        pago: true,
      },
    });
  }

  async updateOrderStatus(id: string, estado: any): Promise<any> {
    return this.prisma.orden.update({
      where: { id },
      data: { estado },
    });
  }

  async findProducts(): Promise<any[]> {
    return this.prisma.publicacion.findMany({
      where: { estado: { not: 'ELIMINADA' } },
      orderBy: { updatedAt: 'desc' },
      include: {
        categoria: { select: { nombre: true } },
        vendedor: { select: { nombre: true, email: true } },
        inventario: true,
        imagenes: { where: { activa: true }, orderBy: { orden: 'asc' }, take: 1 },
      },
    });
  }

  async updateProductStatus(id: string, estado: any): Promise<any> {
    return this.prisma.publicacion.update({
      where: { id },
      data: { estado },
    });
  }

  async deleteProduct(id: string): Promise<any> {
    return this.prisma.publicacion.update({
      where: { id },
      data: { estado: 'ELIMINADA' },
    });
  }
}
