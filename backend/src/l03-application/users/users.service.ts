import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
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
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.usuario.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.direccion.findMany({
      where: { usuarioId: userId, activa: true },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    return this.prisma.direccion.create({
      data: {
        ...dto,
        usuarioId: userId,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.direccion.findFirst({
      where: { id: addressId, usuarioId: userId, activa: true },
    });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    return this.prisma.direccion.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deactivateAddress(userId: string, addressId: string) {
    const address = await this.prisma.direccion.findFirst({
      where: { id: addressId, usuarioId: userId, activa: true },
    });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    await this.prisma.direccion.update({
      where: { id: addressId },
      data: { activa: false },
    });

    return { message: 'Dirección desactivada exitosamente' };
  }

  async getPreferences(userId: string) {
    let prefs = await this.prisma.preferenciasUsuario.findUnique({
      where: { usuarioId: userId },
    });

    if (!prefs) {
      prefs = await this.prisma.preferenciasUsuario.create({
        data: { usuarioId: userId },
      });
    }
    return prefs;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const prefs = await this.getPreferences(userId);

    return this.prisma.preferenciasUsuario.update({
      where: { id: prefs.id },
      data: dto,
    });
  }
}
