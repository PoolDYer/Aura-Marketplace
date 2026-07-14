import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IAdminRepository } from '../../l04-domain/ports/admin-repository.interface';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject('IAdminRepository') private readonly adminRepo: IAdminRepository,
  ) {}

  async getUsers() {
    return this.adminRepo.findUsers();
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updated = await this.adminRepo.updateUserStatus(userId, dto.estado);

    // Efecto cascada RN-10: suspender Vendedor -> deshabilitar publicaciones activas.
    if (dto.estado === 'SUSPENDIDO') {
      await this.adminRepo.deactivateSellerProducts(userId);
    }

    return updated;
  }

  async getReports() {
    return this.adminRepo.getReports();
  }

  async getOrders() {
    return this.adminRepo.findOrders();
  }

  async updateOrderStatus(id: string, estado: any) {
    return this.adminRepo.updateOrderStatus(id, estado);
  }

  async getProducts() {
    return this.adminRepo.findProducts();
  }

  async updateProductStatus(id: string, estado: any) {
    return this.adminRepo.updateProductStatus(id, estado);
  }

  async deleteProduct(id: string) {
    return this.adminRepo.deleteProduct(id);
  }

  async resolveOrder(id: string, nuevoEstado: any) {
    return this.adminRepo.updateOrderStatus(id, nuevoEstado);
  }
}
