import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../../l03-application/categories/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../../l03-application/categories/dto/category.dto';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../l03-application/auth/guards/roles.guard';
import { Roles } from '../../l03-application/auth/decorators/roles.decorator';
import { Public } from '../../l03-application/auth/decorators/public.decorator';
import { RolUsuario } from '../../l04-domain/auth/usuario.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtener árbol de categorías activas' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @Post()
  @ApiOperation({ summary: 'Crear categoría (Solo Admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría (Solo Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }
}
