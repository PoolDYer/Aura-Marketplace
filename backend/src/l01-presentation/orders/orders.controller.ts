import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../l03-application/auth/guards/roles.guard';
import { Roles } from '../../l03-application/auth/decorators/roles.decorator';
import { OrdersService } from '../../l03-application/orders/orders.service';
import { CreateOrderDto } from '../../l03-application/orders/dto/orders.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COMPRADOR')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden a partir del carrito' })
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.sub, dto.direccionId, dto.cuponCodigo);
  }

  @Get()
  @ApiOperation({ summary: 'Historial de mis órdenes' })
  getMyOrders(@Request() req) {
    return this.ordersService.getMyOrders(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de orden' })
  getOrderById(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(req.user.sub, orderId);
  }
}
