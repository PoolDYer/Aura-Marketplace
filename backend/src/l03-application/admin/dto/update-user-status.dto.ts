import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoUsuario } from '../../../l04-domain/auth/usuario.entity';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: EstadoUsuario, example: EstadoUsuario.SUSPENDIDO })
  @IsEnum(EstadoUsuario)
  @IsNotEmpty()
  estado: EstadoUsuario;
}
