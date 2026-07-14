import { BadRequestException } from '@nestjs/common';
import { EstadoPublicacion } from '../l04-domain/products/product.enums';
import { AgentService } from './agent.service';
import { ConversationsService } from './conversations.service';

describe('ConversationsService', () => {
  it('reuses recent sessions and creates missing conversations', async () => {
    const conversationRepo = {
      findActiveSession: jest.fn(),
      createSession: jest.fn(),
      findConversationBySession: jest.fn(),
      createConversation: jest.fn(),
      saveMessage: jest.fn(),
      saveIntentionAndEntities: jest.fn(),
      findHistoryByUser: jest.fn(),
      findMessagesByConversation: jest.fn(),
    };
    const service = new ConversationsService(conversationRepo as any);
    conversationRepo.findActiveSession.mockResolvedValueOnce({ id: 'session-1' }).mockResolvedValueOnce(null);
    conversationRepo.createSession.mockResolvedValue({ id: 'session-2' });
    conversationRepo.findConversationBySession.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'conversation-2' });
    conversationRepo.createConversation.mockResolvedValue({ id: 'conversation-1' });
    conversationRepo.saveMessage.mockResolvedValue({ id: 'message-1' });
    conversationRepo.saveIntentionAndEntities.mockResolvedValue({ id: 'intent-1' });
    conversationRepo.findHistoryByUser.mockResolvedValue(['history']);

    await expect(service.getOrCreateActiveSession('user-1')).resolves.toEqual({
      session: { id: 'session-1' },
      conversation: { id: 'conversation-1' },
    });
    await expect(service.getOrCreateActiveSession('user-1')).resolves.toEqual({
      session: { id: 'session-2' },
      conversation: { id: 'conversation-2' },
    });
    await expect(service.saveMessage('conversation-1', 'USER', 'hola')).resolves.toEqual({ id: 'message-1' });
    await expect(service.saveIntentionAndEntities('message-1', null)).resolves.toBeNull();
    await expect(
      service.saveIntentionAndEntities('message-1', {
        intent: 'buscar_producto',
        confidence: 0.8,
        entities: [{ type: 'keyword', value: 'polo' }],
      }),
    ).resolves.toEqual({ id: 'intent-1' });
    await expect(service.saveIntentionAndEntities('message-1', {})).resolves.toEqual({ id: 'intent-1' });
    await expect(service.getConversationHistory('user-1')).resolves.toEqual(['history']);
  });
});

describe('AgentService', () => {
  const createService = () => {
    const conversations = {
      getOrCreateActiveSession: jest.fn().mockResolvedValue({ conversation: { id: 'conversation-1' } }),
      saveMessage: jest.fn().mockResolvedValue({ id: 'message-1' }),
      saveIntentionAndEntities: jest.fn(),
    };
    const productRepo = {
      findActiveProducts: jest.fn().mockResolvedValue([]),
    };
    const conversationRepo = {
      findMessagesByConversation: jest.fn().mockResolvedValue([]),
    };
    const llm = { generateCopilotResponse: jest.fn() };
    const stt = { transcribe: jest.fn() };
    const tts = { synthesize: jest.fn() };
    return {
      service: new AgentService(
        conversations as any,
        productRepo as any,
        conversationRepo as any,
        llm as any,
        stt as any,
        tts as any,
      ),
      conversations,
      productRepo,
      conversationRepo,
      llm,
      stt,
    };
  };

  it('processes text messages with product context and maps navigation/search/cart actions', async () => {
    const { service, conversations, productRepo, conversationRepo, llm } = createService();
    productRepo.findActiveProducts.mockResolvedValue([
      {
        id: 'prod-1',
        nombre: 'Silla',
        descripcion: 'Comoda',
        precio: 120,
        categoria: { nombre: 'Hogar' },
        inventario: { cantidad: 5, cantidadReservada: 1 },
        imagenes: [{ url: 'img.png' }],
      },
    ]);
    conversationRepo.findMessagesByConversation.mockResolvedValue([{ rol: 'USER', contenido: 'hola' }]);
    llm.generateCopilotResponse
      .mockResolvedValueOnce({ message: 'Vamos', action: { type: 'navigate', route: '/cart' }, products: [] })
      .mockResolvedValueOnce({
        message: 'Resultados',
        action: { type: 'search_products', searchFilters: { minPrice: 10, maxPrice: 200, category: 'Hogar', keyword: 'silla' } },
        products: [],
      })
      .mockResolvedValueOnce({ message: 'Agregado', action: { type: 'add_to_cart', productId: 'prod-1' }, products: [] });

    await expect(service.processTextMessage('user-1', 'carrito')).resolves.toMatchObject({
      intention: { intent: 'navegar', entities: [{ type: 'ruta', value: '/cart' }] },
    });
    await expect(service.processTextMessage('user-1', 'busca silla')).resolves.toMatchObject({
      intention: {
        intent: 'buscar_producto',
        entities: expect.arrayContaining([
          { type: 'precio_min', value: '10' },
          { type: 'precio_max', value: '200' },
          { type: 'categoria', value: 'Hogar' },
          { type: 'keyword', value: 'silla' },
        ]),
      },
    });
    await expect(service.processTextMessage('user-1', 'agrega')).resolves.toMatchObject({
      intention: { intent: 'agregar_carrito', entities: [{ type: 'producto_id', value: 'prod-1' }] },
    });
    expect(productRepo.findActiveProducts).toHaveBeenCalled();
    expect(conversations.saveMessage).toHaveBeenCalledWith('conversation-1', 'AGENT', 'Agregado');
  });

  it('falls back to empty context when Prisma reads fail', async () => {
    const { service, productRepo, conversationRepo, llm } = createService();
    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
    productRepo.findActiveProducts.mockRejectedValue(new Error('db'));
    conversationRepo.findMessagesByConversation.mockRejectedValue(new Error('db'));
    llm.generateCopilotResponse.mockResolvedValue({ message: 'ok', action: { type: 'none' }, products: [] });

    await expect(service.processTextMessage('user-1', 'hola')).resolves.toMatchObject({
      intention: { intent: 'consulta_general', entities: [] },
    });
    expect(llm.generateCopilotResponse).toHaveBeenCalledWith('hola', [], []);
    errorSpy.mockRestore();
  });

  it('maps product context defaults and intention defaults', async () => {
    const { service, productRepo, conversationRepo, llm } = createService();
    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
    productRepo.findActiveProducts.mockResolvedValue([
      {
        id: 'prod-1',
        nombre: 'Mesa',
        descripcion: 'Madera',
        precio: '89.50',
        categoria: null,
        inventario: null,
        imagenes: [],
      },
      {
        id: 'prod-2',
        nombre: 'Lampara',
        descripcion: 'Luz',
        precio: 50,
        categoria: { nombre: '' },
        inventario: { cantidad: 1, cantidadReservada: 3 },
        imagenes: undefined,
      },
    ]);
    conversationRepo.findMessagesByConversation.mockResolvedValue([]);
    llm.generateCopilotResponse.mockResolvedValue({ message: 'ok', products: [] });

    await expect(service.processTextMessage('user-1', 'hola')).resolves.toMatchObject({
      action: undefined,
      intention: { intent: 'consulta_general', entities: [] },
    });
    expect(llm.generateCopilotResponse).toHaveBeenCalledWith(
      'hola',
      [
        { id: 'prod-1', nombre: 'Mesa', descripcion: 'Madera', precio: 89.5, imageUrl: undefined, stock: 0, categoria: 'Sin categoría' },
        { id: 'prod-2', nombre: 'Lampara', descripcion: 'Luz', precio: 50, imageUrl: undefined, stock: 0, categoria: 'Sin categoría' },
      ],
      [],
    );
    errorSpy.mockRestore();
  });

  it('rejects empty voice transcriptions with the default error message', async () => {
    const { service, stt } = createService();
    stt.transcribe.mockResolvedValue('');

    await expect(service.processVoiceMessage('user-1', Buffer.from('audio'))).rejects.toThrow('Error al transcribir el audio.');
  });

  it('transcribes voice messages and rejects failed transcriptions', async () => {
    const { service, stt, llm } = createService();
    llm.generateCopilotResponse.mockResolvedValue({ message: 'ok', action: { type: 'none' }, products: [] });
    stt.transcribe.mockResolvedValueOnce('hola desde audio').mockResolvedValueOnce('Error al transcribir el audio');

    await expect(service.processVoiceMessage('user-1', Buffer.from('audio'))).resolves.toMatchObject({
      transcribedText: 'hola desde audio',
      message: 'ok',
    });
    await expect(service.processVoiceMessage('user-1', Buffer.from('audio'))).rejects.toBeInstanceOf(BadRequestException);
  });
});
