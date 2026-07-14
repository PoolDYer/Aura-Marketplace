import type { CopilotProduct, CopilotResponse, LanguageModelProvider, SpeechToTextProvider, TextToSpeechProvider } from './ai.interfaces';

describe('ai.interfaces', () => {
  it('keeps the AI provider contracts aligned', async () => {
    const product: CopilotProduct = { id: 'p1', nombre: 'Silla', descripcion: 'Comoda', precio: 10, stock: 2, categoria: 'Hogar' };
    const response: CopilotResponse = { message: 'ok', action: { type: 'search_products', searchFilters: { keyword: 'silla' } }, products: [product] };
    const languageModel: LanguageModelProvider = {
      generateResponse: jest.fn().mockResolvedValue('ok'),
      extractEntities: jest.fn().mockResolvedValue({ intent: 'buscar_producto', confidence: 1, entities: [] }),
      generateCopilotResponse: jest.fn().mockResolvedValue(response),
    };
    const stt: SpeechToTextProvider = { transcribe: jest.fn().mockResolvedValue('hola') };
    const tts: TextToSpeechProvider = { synthesize: jest.fn().mockResolvedValue(Buffer.from('audio')) };

    await expect(languageModel.generateCopilotResponse('busca', [product], [])).resolves.toEqual(response);
    await expect(stt.transcribe(Buffer.from('x'))).resolves.toBe('hola');
    await expect(tts.synthesize('hola')).resolves.toEqual(Buffer.from('audio'));
  });
});
