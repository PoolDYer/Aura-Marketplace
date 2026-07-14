import { ConversationsService } from './conversations.service';

describe('ConversationsService Colocated Edge Cases', () => {
  const createService = () => {
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
    return { service: new ConversationsService(conversationRepo as any), conversationRepo };
  };

  it('saveIntentionAndEntities should return null if intentionData is missing', async () => {
    const { service } = createService();
    const result = await service.saveIntentionAndEntities('msg-123', null);
    expect(result).toBeNull();
  });

  it('saveIntentionAndEntities should map empty entities list correctly', async () => {
    const { service, conversationRepo } = createService();
    conversationRepo.saveIntentionAndEntities.mockResolvedValue({ id: 'intent-123' });

    await service.saveIntentionAndEntities('msg-123', {
      intent: 'test-intent',
      confidence: 0.9,
      entities: [],
    });

    expect(conversationRepo.saveIntentionAndEntities).toHaveBeenCalledWith(
      'msg-123',
      'test-intent',
      0.9,
      [],
    );
  });

  it('getConversationHistory should query up to 10 conversations sorted by updatedAt desc', async () => {
    const { service, conversationRepo } = createService();
    conversationRepo.findHistoryByUser.mockResolvedValue([]);

    await service.getConversationHistory('user-1');
    expect(conversationRepo.findHistoryByUser).toHaveBeenCalledWith('user-1', 10);
  });
});
