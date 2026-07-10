import { Controller, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../l03-application/auth/guards/roles.guard';
import { Roles } from '../../l03-application/auth/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';
import { AdminService } from '../../l03-application/admin/admin.service';
import { UpdateUserStatusDto } from '../../l03-application/admin/dto/update-user-status.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Listar usuarios del sistema' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de cuenta de un usuario' })
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Obtener reportes del marketplace' })
  getReports() {
    return this.adminService.getReports();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Listar pedidos para gesti\u00f3n administrativa' })
  getOrders() {
    return this.adminService.getOrders();
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Actualizar el estado de un pedido' })
  updateOrderStatus(@Param('id') id: string, @Body('estado') estado: any) {
    return this.adminService.updateOrderStatus(id, estado);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar publicaciones para gesti\u00f3n administrativa' })
  getProducts() {
    return this.adminService.getProducts();
  }

  @Patch('products/:id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una publicaci\u00f3n' })
  updateProductStatus(@Param('id') id: string, @Body('estado') estado: any) {
    return this.adminService.updateProductStatus(id, estado);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Eliminar una publicación por incumplimiento' })
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Patch('orders/:id/resolve')
  @ApiOperation({ summary: 'Resolver una orden escalada' })
  resolveOrder(@Param('id') id: string, @Body('estado') estado: any) {
    return this.adminService.resolveOrder(id, estado);
  }
}
