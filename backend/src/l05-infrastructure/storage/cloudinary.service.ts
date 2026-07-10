import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

type UploadProductImageInput = {
  buffer: Buffer;
  mimetype: string;
  vendorId: string;
  productId?: string;
  originalname?: string;
};

@Injectable()
export class CloudinaryService {
  private readonly folderRoot: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.folderRoot = this.configService.get<string>('CLOUDINARY_FOLDER') || 'Aura';

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  async uploadProductImage(input: UploadProductImageInput) {
    if (!input.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen.');
    }

    const folder = [
      this.folderRoot,
      'vendors',
      input.vendorId,
      'products',
      input.productId || 'pending',
    ].join('/');

    if (!this.isConfigured()) {
      const format = input.mimetype.split('/')[1] || 'image';
      const extension = extname(input.originalname || '') || `.${format}`;
      const filename = `${randomUUID()}${extension}`;
      const uploadDir = join(process.cwd(), 'uploads', 'products');

      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), input.buffer);

      const publicBaseUrl = this.configService.get<string>('PUBLIC_API_URL') || `http://localhost:${process.env.PORT || 3000}`;

      return {
        url: `${publicBaseUrl}/uploads/products/${filename}`,
        publicId: `local-${Date.now()}-${input.originalname || 'product-image'}`,
        folder,
        format,
      };
    }

    let result: UploadApiResponse;
    try {
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            context: input.originalname ? { original_filename: input.originalname } : undefined,
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error || new Error('Cloudinary no devolvió respuesta de subida.'));
              return;
            }

            resolve(uploadResult);
          },
        );

        stream.end(input.buffer);
      });
    } catch (error) {
      throw new BadGatewayException('Cloudinary rechazó la subida de la imagen.');
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      folder,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  private isConfigured() {
    return Boolean(
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') &&
      this.configService.get<string>('CLOUDINARY_API_KEY') &&
      this.configService.get<string>('CLOUDINARY_API_SECRET'),
    );
  }
}
