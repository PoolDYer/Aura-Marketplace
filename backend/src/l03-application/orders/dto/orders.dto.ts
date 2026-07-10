import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  direccionId: string;

  @IsString()
  @IsOptional()
  cuponCodigo?: string;
}

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  EN_PREPARACION = 'EN_PREPARACION',
  DESPACHADA = 'DESPACHADA',
  ENTREGADA = 'ENTREGADA',
  CANCELADA = 'CANCELADA',
  ESCALADA = 'ESCALADA'
}

export class UpdateOrderStatusDto {
  @IsEnum(EstadoOrden)
  estado: EstadoOrden;
}
