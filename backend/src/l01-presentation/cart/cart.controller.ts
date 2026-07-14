import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../l03-application/auth/guards/roles.guard';
import { Roles } from '../../l03-application/auth/decorators/roles.decorator';
import { CartService } from '../../l03-application/cart/cart.service';
import { AddItemDto, UpdateItemDto } from '../../l03-application/cart/dto/cart.dto';

import { RolUsuario } from '../../l04-domain/auth/usuario.entity';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.COMPRADOR)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener carrito del usuario' })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Agregar ítem al carrito' })
  addItem(@Request() req, @Body() dto: AddItemDto) {
    return this.cartService.addItem(req.user.id, dto.publicacionId, dto.cantidad);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Actualizar cantidad de ítem' })
  updateItemQuantity(@Request() req, @Param('itemId') itemId: string, @Body() dto: UpdateItemDto) {
    return this.cartService.updateItemQuantity(req.user.id, itemId, dto.cantidad);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Eliminar ítem del carrito' })
  removeItem(@Request() req, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Vaciar carrito' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
