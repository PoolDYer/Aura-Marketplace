import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeminiLanguageModelProvider } from '../src/l05-infrastructure/ai/gemini-ai.providers';

describe('Gemini AI Language Model Integration Test', () => {
  let languageProvider: GeminiLanguageModelProvider;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [GeminiLanguageModelProvider],
    }).compile();

    languageProvider = moduleRef.get(GeminiLanguageModelProvider);
    configService = moduleRef.get(ConfigService);
  });

  it('should generate text response and extract entities using Gemini API', async () => {
    const apiKey = configService.get('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'mock-gemini-key') {
      console.warn('Skipping Gemini integration test: GEMINI_API_KEY is not configured.');
      return;
    }

    // 1. Test generateResponse
    const response = await languageProvider.generateResponse('Hola, ¿quién eres?');
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);

    // 2. Test extractEntities
    const textToAnalyze = 'quiero comprar una silla de oficina de menos de 150 dólares';
    const extraction = await languageProvider.extractEntities(textToAnalyze);

    expect(extraction).toBeDefined();
    expect(extraction.intent).toBeDefined();
    expect(extraction.confidence).toBeDefined();
    expect(typeof extraction.confidence).toBe('number');
    expect(Array.isArray(extraction.entities)).toBe(true);

    // Verify extraction contains relevant entities (like silla or office/oficina)
    const categoryEntity = extraction.entities.find((e) => e.type === 'keyword' || e.type === 'categoria');
    expect(categoryEntity).toBeDefined();
  }, 20000);
});
