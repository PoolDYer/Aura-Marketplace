import { Injectable, Logger } from '@nestjs/common';
import {
  LanguageModelProvider,
  SpeechToTextProvider,
  TextToSpeechProvider,
  CopilotProduct,
  CopilotResponse,
  IntentionData,
} from '../../l04-domain/ai/ai.interfaces';

@Injectable()
export class MockLanguageModelProvider implements LanguageModelProvider {
  private readonly logger = new Logger(MockLanguageModelProvider.name);

  async generateResponse(prompt: string, context?: any): Promise<string> {
    this.logger.log(`Generating response for: ${prompt}`);
    return `[Mock AI] He recibido tu mensaje: "${prompt}". ¿En qué más puedo ayudarte?`;
  }

  async extractEntities(text: string): Promise<IntentionData> {
    this.logger.log(`Extracting entities from: ${text}`);
    return {
      intent: 'buscar_producto',
      confidence: 0.95,
      entities: [
        { type: 'keyword', value: 'zapatos' }
      ]
    };
  }

  async generateCopilotResponse(
    userMessage: string,
    products: CopilotProduct[],
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<CopilotResponse> {
    this.logger.log(`Generating copilot response for: ${userMessage}`);
    return {
      message: `[Mock] He recibido tu mensaje: "${userMessage}". ¿En qué más puedo ayudarte?`,
      action: { type: 'none' },
      products: [],
    };
  }
}

@Injectable()
export class MockSpeechToTextProvider implements SpeechToTextProvider {
  private readonly logger = new Logger(MockSpeechToTextProvider.name);

  async transcribe(audioBuffer: Buffer): Promise<string> {
    this.logger.log(`Transcribing audio buffer of size: ${audioBuffer.length}`);
    return 'Este es un texto transcrito simulado desde un audio.';
  }
}

@Injectable()
export class MockTextToSpeechProvider implements TextToSpeechProvider {
  private readonly logger = new Logger(MockTextToSpeechProvider.name);

  async synthesize(text: string): Promise<Buffer> {
    this.logger.log(`Synthesizing text: ${text}`);
    return Buffer.from('mock-audio-data');
  }
}
