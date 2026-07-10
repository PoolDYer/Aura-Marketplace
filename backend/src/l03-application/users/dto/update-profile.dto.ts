import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({ example: '+123456789' })
  @IsString()
  @IsOptional()
  telefono?: string;
}
