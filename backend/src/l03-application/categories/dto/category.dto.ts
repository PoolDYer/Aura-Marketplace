import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electrónica' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Dispositivos electrónicos' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: 'uuid-del-padre' })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Nueva Electrónica' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Nuevos dispositivos' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: 'uuid-del-padre' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
