import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async validateCoupon(codigo: string) {
    const cupon = await this.prisma.cupon.findUnique({
      where: { codigo }
    });

    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    if (cupon.vigenciaHasta < new Date()) {
      throw new BadRequestException('El cupón ha expirado');
    }

    if (cupon.usos >= cupon.usosMaximos) {
      throw new BadRequestException('El cupón ha superado su límite de usos');
    }

    return cupon;
  }

  async applyCouponToCart(compradorId: string, codigo: string) {
    const cupon = await this.validateCoupon(codigo);
    
    // Aquí el carrito no guarda el cupón como tal, pero podríamos 
    // retornar la información del cupón y el cálculo del total.
    // También podríamos requerir una entidad `CuponAplicado` en el Carrito.
    // Según las entidades de BD actuales, el Carrito no tiene un campo para `cuponId`.
    // Por simplicidad, este método devuelve el cupón validado para que el frontend pueda aplicarlo al vuelo,
    // y cuando se procese la orden, se envía el código de cupón para que `OrdersService` lo verifique y descuente.
    return { valid: true, cupon };
  }

  async getActivePromotions(publicacionIds: string[]) {
    const now = new Date();
    return this.prisma.promocion.findMany({
      where: {
        publicacionId: { in: publicacionIds },
        activa: true,
        inicio: { lte: now },
        fin: { gte: now }
      }
    });
  }
}
