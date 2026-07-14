import { MockStorageProvider } from './mock-storage.provider';

describe('MockStorageProvider', () => {
  it('should generate pre-signed upload and public URLs containing filename', async () => {
    const provider = new MockStorageProvider();
    const result = await provider.generatePresignedUrl('photo.jpg');

    expect(result.uploadUrl).toContain('photo.jpg');
    expect(result.publicUrl).toContain('photo.jpg');
    expect(result.uploadUrl).toContain('https://mock-r2-upload.local/');
    expect(result.publicUrl).toContain('https://mock-cdn.local/');
  });
});
