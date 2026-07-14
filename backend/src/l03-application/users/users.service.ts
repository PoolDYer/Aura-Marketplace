import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../l04-domain/ports/user-repository.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.userRepo.updateProfile(userId, dto);
  }

  async getAddresses(userId: string) {
    return this.userRepo.findAddressesByUserId(userId);
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    return this.userRepo.createAddress(userId, dto);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.userRepo.findAddressByIdAndUserId(addressId, userId);
    if (!address) throw new NotFoundException('Dirección no encontrada');

    return this.userRepo.updateAddress(addressId, dto);
  }

  async deactivateAddress(userId: string, addressId: string) {
    const address = await this.userRepo.findAddressByIdAndUserId(addressId, userId);
    if (!address) throw new NotFoundException('Dirección no encontrada');

    await this.userRepo.updateAddress(addressId, { activa: false });

    return { message: 'Dirección desactivada exitosamente' };
  }

  async getPreferences(userId: string) {
    let prefs = await this.userRepo.findPreferencesByUserId(userId);

    if (!prefs) {
      prefs = await this.userRepo.createPreferences(userId);
    }
    return prefs;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const prefs = await this.getPreferences(userId);

    return this.userRepo.updatePreferences(prefs.id, dto);
  }
}
