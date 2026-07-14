import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../../../l04-domain/auth/usuario.entity';

export class SyncNeonUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsIn(['COMPRADOR', 'VENDEDOR'])
  rol?: Extract<RolUsuario, 'COMPRADOR' | 'VENDEDOR'>;
}

export class CompleteGoogleRegistrationDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(['COMPRADOR', 'VENDEDOR'])
  rol?: Extract<RolUsuario, 'COMPRADOR' | 'VENDEDOR'>;
}
