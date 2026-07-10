import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpeechToTextProvider } from '../../l04-domain/ai/ai.interfaces';

@Injectable()
export class GeminiSpeechToTextProvider implements SpeechToTextProvider {
  private readonly logger = new Logger(GeminiSpeechToTextProvider.name);
  private readonly model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found for STT provider');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    try {
      this.logger.log(`Transcribing audio buffer of size: ${audioBuffer.length}`);

      // Convert buffer to base64 for Gemini multimodal input
      const audioBase64 = audioBuffer.toString('base64');

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64,
          },
        },
        {
          text: 'Transcribe el audio anterior a texto en español. Solo devuelve el texto transcrito, sin explicaciones ni formato adicional.',
        },
      ]);

      const transcribedText = result.response.text().trim();
      this.logger.log(`Transcribed text: ${transcribedText}`);

      return transcribedText || 'No se pudo transcribir el audio.';
    } catch (error) {
      this.logger.error('Error transcribing audio with Gemini', error);
      return 'Error al transcribir el audio. Por favor intenta de nuevo.';
    }
  }
}
