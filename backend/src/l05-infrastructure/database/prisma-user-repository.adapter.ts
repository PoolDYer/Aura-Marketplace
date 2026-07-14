import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IUserRepository } from '../../l04-domain/ports/user-repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        estado: true,
        fechaRegistro: true,
      },
    });
  }

  async findAuthById(id: string): Promise<any | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        passwordHash: true,
        estado: true,
        rol: true,
        intentosFallidos: true,
        bloqueadoHasta: true,
        fechaActualizacion: true,
      },
    });
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async create(data: any): Promise<any> {
    return this.prisma.usuario.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  async updateProfile(id: string, data: any): Promise<any> {
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
      },
    });
  }

  async findAddressesByUserId(userId: string): Promise<any[]> {
    return this.prisma.direccion.findMany({
      where: { usuarioId: userId, activa: true },
    });
  }

  async findAddressByIdAndUserId(id: string, userId: string): Promise<any | null> {
    return this.prisma.direccion.findFirst({
      where: { id, usuarioId: userId, activa: true },
    });
  }

  async createAddress(userId: string, data: any): Promise<any> {
    return this.prisma.direccion.create({
      data: {
        ...data,
        usuarioId: userId,
      },
    });
  }

  async updateAddress(id: string, data: any): Promise<any> {
    return this.prisma.direccion.update({
      where: { id },
      data,
    });
  }

  async findPreferencesByUserId(userId: string): Promise<any | null> {
    return this.prisma.preferenciasUsuario.findUnique({
      where: { usuarioId: userId },
    });
  }

  async createPreferences(userId: string): Promise<any> {
    return this.prisma.preferenciasUsuario.create({
      data: { usuarioId: userId },
    });
  }

  async updatePreferences(id: string, data: any): Promise<any> {
    return this.prisma.preferenciasUsuario.update({
      where: { id },
      data,
    });
  }
}
