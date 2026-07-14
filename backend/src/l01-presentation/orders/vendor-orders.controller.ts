import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../l03-application/auth/guards/roles.guard';
import { Roles } from '../../l03-application/auth/decorators/roles.decorator';
import { OrdersService } from '../../l03-application/orders/orders.service';
import { UpdateOrderStatusDto } from '../../l03-application/orders/dto/orders.dto';

import { RolUsuario } from '../../l04-domain/auth/usuario.entity';

@ApiTags('Vendor Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.VENDEDOR)
@Controller('vendors/me/orders')
export class VendorOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Órdenes recibidas del vendedor' })
  getVendorOrders(@Request() req) {
    return this.ordersService.getVendorOrders(req.user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de orden' })
  updateOrderStatus(@Request() req, @Param('id') orderId: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(req.user.sub, orderId, dto.estado);
  }
}
