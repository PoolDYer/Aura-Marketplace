import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: ['COMPRADOR', 'VENDEDOR'], example: 'COMPRADOR' })
  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[a-z])/, { message: 'La contraseña debe contener al menos una minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'La contraseña debe contener al menos una mayúscula' })
  @Matches(/(?=.*\d)/, { message: 'La contraseña debe contener al menos un número' })
  password: string;
}
