import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
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

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updated = await this.prisma.usuario.update({
      where: { id: userId },
      data: { estado: dto.estado },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
      },
    });

    // Efecto cascada RN-10: suspender Vendedor -> deshabilitar publicaciones activas.
    if (dto.estado === 'SUSPENDIDO') {
      await this.prisma.publicacion.updateMany({
        where: {
          vendedorId: userId,
          estado: 'ACTIVA' // Assuming 'ACTIVA' is the value in EstadoPublicacion enum
        },
        data: {
          estado: 'INACTIVA'
        }
      });
    }

    return updated;
  }

  async getReports() {
    const totalUsers = await this.prisma.usuario.count();
    const activeProducts = await this.prisma.publicacion.count({ where: { estado: 'ACTIVA' } });
    const totalOrders = await this.prisma.orden.count();
    
    const sales = await this.prisma.orden.aggregate({
      _sum: { total: true },
      where: { estado: { notIn: ['CANCELADA', 'ESCALADA'] } }
    });

    return {
      totalUsers,
      activeProducts,
      totalOrders,
      totalSales: sales._sum.total || 0,
    };
  }

  async getOrders() {
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

  async updateOrderStatus(id: string, estado: any) {
    return this.prisma.orden.update({ where: { id }, data: { estado } });
  }

  async getProducts() {
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

  async updateProductStatus(id: string, estado: any) {
    return this.prisma.publicacion.update({ where: { id }, data: { estado } });
  }

  async deleteProduct(id: string) {
    return this.prisma.publicacion.update({
      where: { id },
      data: { estado: 'ELIMINADA' }
    });
  }

  async resolveOrder(id: string, nuevoEstado: any) {
    return this.prisma.orden.update({
      where: { id },
      data: { estado: nuevoEstado }
    });
  }
}
