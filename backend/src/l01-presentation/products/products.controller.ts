import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService, CreateProductDto } from '../../l03-application/products/products.service';
import { RolesGuard } from '../../l03-application/auth/guards/roles.guard';
import { Roles } from '../../l03-application/auth/decorators/roles.decorator';
import { Public } from '../../l03-application/auth/decorators/public.decorator';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { EstadoPublicacion } from '../../l04-domain/products/product.enums';
import { CloudinaryService } from '../../l05-infrastructure/storage/cloudinary.service';
import { RolUsuario } from '../../l04-domain/auth/usuario.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Get()
  async getAll() {
    return this.productsService.getProducts();
  }

  @Roles(RolUsuario.VENDEDOR)
  @Post()
  async createProduct(@Request() req, @Body() data: CreateProductDto) {
    return this.productsService.createProduct(req.user.sub, data);
  }

  @Roles(RolUsuario.VENDEDOR)
  @Get('/vendor/me')
  async getVendorProducts(@Request() req) {
    return this.productsService.getVendorProducts(req.user.sub);
  }

  @Roles(RolUsuario.VENDEDOR)
  @Post('/vendor/me/images')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadVendorProductImage(@Request() req, @UploadedFile() file: any, @Body() data: { productId?: string }) {
    if (!file?.buffer) {
      throw new BadRequestException('No se recibió ninguna imagen.');
    }

    return this.cloudinaryService.uploadProductImage({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      vendorId: req.user.sub,
      productId: data.productId,
    });
  }

  @Roles(RolUsuario.VENDEDOR)
  @Get('/vendor/me/:id')
  async getVendorProductById(@Request() req, @Param('id') id: string) {
    return this.productsService.getVendorProductById(req.user.sub, id);
  }

  @Roles(RolUsuario.VENDEDOR)
  @Patch(':id')
  async updateProduct(@Request() req, @Param('id') id: string, @Body() data: Partial<CreateProductDto>) {
    return this.productsService.updateVendorProduct(req.user.sub, id, data);
  }

  @Roles(RolUsuario.VENDEDOR)
  @Patch(':id/status')
  async updateProductStatus(@Request() req, @Param('id') id: string, @Body() data: { estado: EstadoPublicacion }) {
    return this.productsService.updateVendorProductStatus(req.user.sub, id, data.estado);
  }

  @Roles(RolUsuario.VENDEDOR)
  @Delete(':id')
  async deleteProduct(@Request() req, @Param('id') id: string) {
    return this.productsService.deleteVendorProduct(req.user.sub, id);
  }

  @Public()
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }
}
