import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { FavoritesService } from '../../l03-application/favorites/favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar favoritos del comprador' })
  getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar favorito' })
  addFavorite(@Request() req, @Body('publicacionId') publicacionId: string) {
    return this.favoritesService.addFavorite(req.user.id, publicacionId);
  }

  @Delete(':publicacionId')
  @ApiOperation({ summary: 'Eliminar favorito' })
  removeFavorite(@Request() req, @Param('publicacionId') publicacionId: string) {
    return this.favoritesService.removeFavorite(req.user.id, publicacionId);
  }
}
