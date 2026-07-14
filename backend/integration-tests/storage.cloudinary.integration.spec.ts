import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../src/l05-infrastructure/storage/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { join } from 'path';

describe('Cloudinary Storage Integration Test', () => {
  let cloudinaryService: CloudinaryService;
  let configService: ConfigService;

  // A tiny 1x1 transparent PNG buffer for testing uploads
  const dummyBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64',
  );

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [CloudinaryService],
    }).compile();

    cloudinaryService = moduleRef.get(CloudinaryService);
    configService = moduleRef.get(ConfigService);
  });

  it('should upload to Cloudinary if configured and delete after', async () => {
    const isConfigured =
      Boolean(configService.get('CLOUDINARY_CLOUD_NAME')) &&
      Boolean(configService.get('CLOUDINARY_API_KEY')) &&
      Boolean(configService.get('CLOUDINARY_API_SECRET'));

    if (!isConfigured) {
      console.warn('Skipping real Cloudinary upload test: credentials not configured in .env');
      return;
    }

    const uploadInput = {
      buffer: dummyBuffer,
      mimetype: 'image/png',
      vendorId: 'test-vendor-integration',
      productId: 'test-product-integration',
      originalname: 'test-1x1-image.png',
    };

    const result = await cloudinaryService.uploadProductImage(uploadInput);

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.url).toContain('res.cloudinary.com');
    expect(result.publicId).toBeDefined();

    // Clean up uploaded image from Cloudinary using SDK
    const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const destroyResult = await cloudinary.uploader.destroy(result.publicId);
    expect(destroyResult.result).toBe('ok');
  }, 15000);

  it('should fall back to local disk storage when Cloudinary credentials are empty', async () => {
    // Instantiate CloudinaryService with mock ConfigService returning undefined credentials
    const mockConfig = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'CLOUDINARY_FOLDER') return 'AuraTest';
        return undefined; // No cloud credentials!
      }),
    };
    const fallbackService = new CloudinaryService(mockConfig as any);

    const uploadInput = {
      buffer: dummyBuffer,
      mimetype: 'image/png',
      vendorId: 'fallback-vendor',
      productId: 'fallback-product',
      originalname: 'fallback-image.png',
    };

    const result = await fallbackService.uploadProductImage(uploadInput);

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.url).toContain('/uploads/products/');
    expect(result.publicId).toContain('local-');

    // Extract filename from URL to verify file actually exists on disk
    const filename = result.url.split('/').pop() || '';
    const filePath = join(process.cwd(), 'uploads', 'products', filename);

    expect(existsSync(filePath)).toBe(true);

    // Clean up local file created on disk
    await rm(filePath, { force: true });
    expect(existsSync(filePath)).toBe(false);
  });
});
