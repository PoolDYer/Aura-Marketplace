import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { PromotionsService } from '../../l03-application/promotions/promotions.service';

@ApiTags('Coupons')
@Controller('coupons')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validar un código de cupón' })
  validateCoupon(@Body('codigo') codigo: string) {
    return this.promotionsService.validateCoupon(codigo);
  }

  @Post('apply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Aplicar cupón al carrito en memoria' })
  applyCoupon(@Request() req, @Body('codigo') codigo: string) {
    return this.promotionsService.applyCouponToCart(req.user.userId, codigo);
  }
}
