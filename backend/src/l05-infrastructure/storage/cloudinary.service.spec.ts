const uploadStream = jest.fn();

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload_stream: (...args: any[]) => uploadStream(...args) },
  },
}));

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-1'),
}));

import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  const config = (values: Record<string, string | undefined>) => ({
    get: jest.fn((key: string) => values[key]),
  });

  beforeEach(() => {
    delete process.env.PORT;
    jest.clearAllMocks();
  });

  it('rejects non-image uploads', async () => {
    const service = new CloudinaryService(config({}) as any);

    await expect(
      service.uploadProductImage({ buffer: Buffer.from('x'), mimetype: 'text/plain', vendorId: 'v1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores images locally when Cloudinary is not configured', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    process.env.PORT = '4000';
    const service = new CloudinaryService(config({ PUBLIC_API_URL: 'https://api.test' }) as any);

    await expect(
      service.uploadProductImage({
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
        vendorId: 'vendor-1',
        productId: 'prod-1',
        originalname: 'photo.png',
      }),
    ).resolves.toEqual({
      url: 'https://api.test/uploads/products/uuid-1.png',
      publicId: 'local-1700000000000-photo.png',
      folder: 'Aura/vendors/vendor-1/products/prod-1',
      format: 'png',
    });

    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('uploads\\products'), { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('uuid-1.png'), Buffer.from('image'));
    nowSpy.mockRestore();
  });

  it('uses local defaults when file names and public URL are missing', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000001);
    const service = new CloudinaryService(
      config({ CLOUDINARY_CLOUD_NAME: 'cloud', CLOUDINARY_API_KEY: undefined, CLOUDINARY_API_SECRET: 'secret' }) as any,
    );

    await expect(
      service.uploadProductImage({
        buffer: Buffer.from('image'),
        mimetype: 'image/webp',
        vendorId: 'vendor-1',
      }),
    ).resolves.toMatchObject({
      url: expect.stringContaining('http://localhost:3000/uploads/products/uuid-1.webp'),
      publicId: 'local-1700000000001-product-image',
      folder: 'Aura/vendors/vendor-1/products/pending',
      format: 'webp',
    });
    nowSpy.mockRestore();
  });

  it('falls back to a generic local image extension when the MIME subtype is empty', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000002);
    const service = new CloudinaryService(config({}) as any);

    await expect(
      service.uploadProductImage({ buffer: Buffer.from('image'), mimetype: 'image/', vendorId: 'vendor-1' }),
    ).resolves.toMatchObject({
      url: expect.stringContaining('uuid-1.image'),
      format: 'image',
    });
    nowSpy.mockRestore();
  });

  it('uploads to Cloudinary when credentials exist', async () => {
    uploadStream.mockImplementationOnce((options, callback) => {
      callback(null, { secure_url: 'https://cdn.test/img.png', public_id: 'pid', width: 10, height: 20, format: 'png' });
      return { end: jest.fn() };
    });
    const service = new CloudinaryService(
      config({
        CLOUDINARY_CLOUD_NAME: 'cloud',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
        CLOUDINARY_FOLDER: 'Root',
      }) as any,
    );

    await expect(
      service.uploadProductImage({
        buffer: Buffer.from('image'),
        mimetype: 'image/jpeg',
        vendorId: 'vendor-1',
        originalname: 'photo.jpg',
      }),
    ).resolves.toMatchObject({
      url: 'https://cdn.test/img.png',
      publicId: 'pid',
      folder: 'Root/vendors/vendor-1/products/pending',
      width: 10,
      height: 20,
      format: 'png',
    });
    expect(cloudinary.config).toHaveBeenCalledWith(
      expect.objectContaining({ cloud_name: 'cloud', api_key: 'key', api_secret: 'secret', secure: true }),
    );
  });

  it('translates Cloudinary upload failures to BadGatewayException', async () => {
    uploadStream.mockImplementationOnce((options, callback) => {
      callback(new Error('cdn down'));
      return { end: jest.fn() };
    });
    const service = new CloudinaryService(
      config({ CLOUDINARY_CLOUD_NAME: 'cloud', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' }) as any,
    );

    await expect(
      service.uploadProductImage({ buffer: Buffer.from('image'), mimetype: 'image/png', vendorId: 'vendor-1' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('rejects empty Cloudinary upload responses', async () => {
    uploadStream.mockImplementationOnce((options, callback) => {
      callback(null, undefined);
      return { end: jest.fn() };
    });
    const service = new CloudinaryService(
      config({ CLOUDINARY_CLOUD_NAME: 'cloud', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' }) as any,
    );

    await expect(
      service.uploadProductImage({ buffer: Buffer.from('image'), mimetype: 'image/png', vendorId: 'vendor-1' }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
