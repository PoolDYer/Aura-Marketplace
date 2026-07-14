const generateContent = jest.fn();
const getGenerativeModel = jest.fn(() => ({ generateContent }));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({ getGenerativeModel })),
}));

import { GeminiLanguageModelProvider } from './gemini-ai.providers';

describe('GeminiLanguageModelProvider', () => {
  const config = (apiKey?: string) => ({ get: jest.fn((key: string) => (key === 'GEMINI_API_KEY' ? apiKey : undefined)) });
  const product = {
    id: 'p1',
    nombre: 'Silla Moderna',
    descripcion: 'Una silla comoda para comedor',
    precio: 120,
    imageUrl: 'img.png',
    stock: 4,
    categoria: 'Hogar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('warns when no API key is configured', () => {
    const provider = new GeminiLanguageModelProvider(config() as any);
    const warnSpy = jest.spyOn((provider as any).logger, 'warn').mockImplementation();

    new GeminiLanguageModelProvider(config() as any);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(getGenerativeModel).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('generates text and extracts JSON entities from Gemini responses', async () => {
    const provider = new GeminiLanguageModelProvider(config('key') as any);
    generateContent
      .mockResolvedValueOnce({ response: { text: () => 'respuesta' } })
      .mockResolvedValueOnce({
        response: {
          text: () => '```json\n{"intent":"buscar_producto","confidence":0.9,"entities":[{"type":"keyword","value":"silla"}]}\n```',
        },
      });

    await expect(provider.generateResponse('hola')).resolves.toBe('respuesta');
    await expect(provider.extractEntities('busca silla')).resolves.toEqual({
      intent: 'buscar_producto',
      confidence: 0.9,
      entities: [{ type: 'keyword', value: 'silla' }],
    });
    expect(getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.5-flash' });
  });

  it('returns safe fallbacks when Gemini text or entity extraction fails', async () => {
    const provider = new GeminiLanguageModelProvider(config('key') as any);
    const errorSpy = jest.spyOn((provider as any).logger, 'error').mockImplementation();
    generateContent.mockRejectedValue(new Error('quota'));

    await expect(provider.generateResponse('hola')).resolves.toContain('hubo un error');
    await expect(provider.extractEntities('???')).resolves.toEqual({ intent: 'unknown', confidence: 0, entities: [] });

    errorSpy.mockRestore();
  });

  it('normalizes successful copilot JSON responses', async () => {
    const provider = new GeminiLanguageModelProvider(config('key') as any);
    generateContent
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({ products: [product] }),
        },
      })
      .mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({ message: 'Listo', action: { type: 'none' }, products: { bad: true } }),
      },
    });

    await expect(
      provider.generateCopilotResponse('hola', [{ ...product, imageUrl: undefined }], [{ role: 'USER', content: 'hola' }]),
    ).resolves.toEqual({
      message: 'No pude procesar tu solicitud.',
      action: { type: 'none' },
      products: [product],
    });
    await expect(provider.generateCopilotResponse('hola', [product], [{ role: 'USER', content: 'hola' }])).resolves.toEqual({
      message: 'Listo',
      action: { type: 'none' },
      products: [],
    });
  });

  it('falls back offline for navigation intents', async () => {
    const provider = new GeminiLanguageModelProvider(config('key') as any);
    const errorSpy = jest.spyOn((provider as any).logger, 'error').mockImplementation();
    generateContent.mockRejectedValue(new Error('quota'));

    await expect(provider.generateCopilotResponse('ir al carrito', [product], [])).resolves.toMatchObject({
      action: { type: 'navigate', route: '/cart' },
    });
    await expect(provider.generateCopilotResponse('ver historial de pedidos', [product], [])).resolves.toMatchObject({
      action: { type: 'navigate', route: '/profile/orders' },
    });
    await expect(provider.generateCopilotResponse('mi perfil de usuario', [product], [])).resolves.toMatchObject({
      action: { type: 'navigate', route: '/profile' },
    });
    await expect(provider.generateCopilotResponse('mis favoritos', [product], [])).resolves.toMatchObject({
      action: { type: 'navigate', route: '/profile/favorites' },
    });
    await expect(provider.generateCopilotResponse('explorar catalogo', [product], [])).resolves.toMatchObject({
      action: { type: 'navigate', route: '/catalog' },
    });

    errorSpy.mockRestore();
  });

  it('falls back offline for cart and search intents', async () => {
    const provider = new GeminiLanguageModelProvider(config('key') as any);
    const errorSpy = jest.spyOn((provider as any).logger, 'error').mockImplementation();
    generateContent.mockRejectedValue(new Error('quota'));

    await expect(provider.generateCopilotResponse('agrega silla', [product], [])).resolves.toMatchObject({
      action: { type: 'add_to_cart', productId: 'p1' },
      products: [product],
    });
    await expect(provider.generateCopilotResponse('agrega silla moderna', [product], [])).resolves.toMatchObject({
      action: { type: 'add_to_cart', productId: 'p1' },
    });
    await expect(provider.generateCopilotResponse('agrega', [product], [])).resolves.toMatchObject({
      action: { type: 'add_to_cart', productId: 'p1' },
    });
    await expect(provider.generateCopilotResponse('agrega', [], [])).resolves.toMatchObject({
      action: { type: 'none' },
      products: [],
    });
    await expect(provider.generateCopilotResponse('busca silla de 100 a 150', [product], [])).resolves.toMatchObject({
      action: { type: 'search_products', searchFilters: { minPrice: 100, maxPrice: 150 } },
      products: [product],
    });
    await expect(provider.generateCopilotResponse('precio menor 200', [product], [])).resolves.toMatchObject({
      action: { type: 'search_products', searchFilters: { maxPrice: 200 } },
    });
    await expect(provider.generateCopilotResponse('precio 50', [product], [])).resolves.toMatchObject({
      action: { type: 'search_products', searchFilters: { minPrice: 50 } },
    });
    await expect(
      provider.generateCopilotResponse('oferta sillon dolar', [{ ...product, nombre: 'Mesa' }], []),
    ).resolves.toMatchObject({
      action: { type: 'none' },
      products: [],
    });
    await expect(provider.generateCopilotResponse('filtrame por dÃ³lar', [product], [])).resolves.toMatchObject({
      action: { type: 'search_products' },
    });
    await expect(provider.generateCopilotResponse('hola', [], [])).resolves.toMatchObject({
      action: { type: 'none' },
      products: [],
    });

    errorSpy.mockRestore();
  });
});
