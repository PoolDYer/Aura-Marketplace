import { UsuarioEntity } from '../auth/usuario.entity';

export interface IUserRepository {
  findById(id: string): Promise<any>;
  findAuthById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  updateProfile(id: string, data: any): Promise<any>;
  findAddressesByUserId(userId: string): Promise<any[]>;
  findAddressByIdAndUserId(id: string, userId: string): Promise<any | null>;
  createAddress(userId: string, data: any): Promise<any>;
  updateAddress(id: string, data: any): Promise<any>;
  findPreferencesByUserId(userId: string): Promise<any | null>;
  createPreferences(userId: string): Promise<any>;
  updatePreferences(id: string, data: any): Promise<any>;
}
