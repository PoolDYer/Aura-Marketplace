import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoUsuario } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: EstadoUsuario, example: EstadoUsuario.SUSPENDIDO })
  @IsEnum(EstadoUsuario)
  @IsNotEmpty()
  estado: EstadoUsuario;
}
