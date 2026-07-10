import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { ReviewsService } from '../../l03-application/reviews/reviews.service';

@ApiTags('Reviews')
@Controller('products/:id/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reseñas de una publicación' })
  getReviews(@Param('id') publicacionId: string) {
    return this.reviewsService.getReviews(publicacionId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Agregar reseña a una publicación' })
  addReview(
    @Request() req,
    @Param('id') publicacionId: string,
    @Body('calificacion') calificacion: number,
    @Body('comentario') comentario?: string,
  ) {
    return this.reviewsService.addReview(req.user.userId, {
      publicacionId,
      calificacion,
      comentario,
    });
  }
}
