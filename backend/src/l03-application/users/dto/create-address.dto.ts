import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Calle Falsa 123' })
  @IsString()
  @IsNotEmpty()
  calle: string;

  @ApiProperty({ example: 'Ciudad' })
  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @ApiProperty({ example: 'Estado' })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsNotEmpty()
  codigoPostal: string;

  @ApiProperty({ example: 'País' })
  @IsString()
  @IsNotEmpty()
  pais: string;

  @ApiPropertyOptional({ example: 'Depto 4' })
  @IsString()
  @IsOptional()
  referencia?: string;
}
