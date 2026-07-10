import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MockStorageProvider {
  /**
   * Simula la generación de una URL pre-firmada de Cloudflare R2
   */
  async generatePresignedUrl(filename: string): Promise<{ uploadUrl: string; publicUrl: string }> {
    const key = `${crypto.randomUUID()}-${filename}`;
    
    // Simular un delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      uploadUrl: `https://mock-r2-upload.local/${key}`,
      publicUrl: `https://mock-cdn.local/${key}`
    };
  }
}
