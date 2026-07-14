import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[a-z])/, { message: 'La contrasena debe contener al menos una minuscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'La contrasena debe contener al menos una mayuscula' })
  @Matches(/(?=.*\d)/, { message: 'La contrasena debe contener al menos un numero' })
  password: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
