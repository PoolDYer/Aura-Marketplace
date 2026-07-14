import { BadRequestException } from '@nestjs/common';
import { AgentService } from './agent.service';

describe('AgentService Colocated Edge Cases', () => {
  const createService = () => {
    const conversations = {
      getOrCreateActiveSession: jest.fn(),
      saveMessage: jest.fn(),
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
    const service = new AgentService(
      conversations as any,
      productRepo as any,
      conversationRepo as any,
      llm as any,
      stt as any,
      tts as any,
    );
    return { service, conversations, productRepo, conversationRepo, llm, stt };
  };

  it('processVoiceMessage should throw BadRequestException if STT transcription fails or is empty', async () => {
    const { service, stt } = createService();
    stt.transcribe.mockResolvedValue('No se pudo transcribir el audio.');

    await expect(
      service.processVoiceMessage('user-1', Buffer.from('fake-audio'))
    ).rejects.toThrow(BadRequestException);
  });

  it('mapResponseToIntention should default to consulta_general for unknown actions', async () => {
    const { service, conversations, productRepo, conversationRepo, llm } = createService();
    conversations.getOrCreateActiveSession.mockResolvedValue({ conversation: { id: 'conv-1' } });
    conversations.saveMessage.mockResolvedValue({ id: 'msg-1' });
    productRepo.findActiveProducts.mockResolvedValue([]);
    conversationRepo.findMessagesByConversation.mockResolvedValue([]);
    llm.generateCopilotResponse.mockResolvedValue({
      message: 'Hello',
      action: { type: 'unknown_action' },
    });

    const result = await service.processTextMessage('user-1', 'hello');
    expect(result.intention.intent).toBe('consulta_general');
  });

  it('getProductContext should fallback to 0 stock if inventory record is missing', async () => {
    const { service, productRepo } = createService();
    productRepo.findActiveProducts.mockResolvedValue([
      {
        id: 'p-1',
        nombre: 'Item',
        descripcion: 'Desc',
        precio: 100,
        categoria: null,
        inventario: null, // missing inventory
        imagenes: [],
      },
    ]);

    const products = await (service as any).getProductContext();
    expect(products[0].stock).toBe(0);
    expect(products[0].categoria).toBe('Sin categoría');
  });
});
