import { AgentController } from './agent.controller';

describe('AgentController', () => {
  const createController = () => {
    const agentService = {
      processTextMessage: jest.fn(),
      processVoiceMessage: jest.fn(),
    };
    const conversationsService = {
      getConversationHistory: jest.fn(),
    };
    const controller = new AgentController(agentService as any, conversationsService as any);
    return { controller, agentService, conversationsService };
  };

  it('sendText should call agentService.processTextMessage', async () => {
    const { controller, agentService } = createController();
    agentService.processTextMessage.mockResolvedValue({
      message: 'hola',
      action: 'route',
      products: [],
      intention: 'none',
    });

    const result = await controller.sendText({ user: { sub: 'user-1' } }, 'hola');
    expect(result).toEqual({
      message: 'hola',
      action: 'route',
      products: [],
      intention: 'none',
    });
    expect(agentService.processTextMessage).toHaveBeenCalledWith('user-1', 'hola');
  });

  it('getHistory should call conversationsService.getConversationHistory', async () => {
    const { controller, conversationsService } = createController();
    conversationsService.getConversationHistory.mockResolvedValue(['msg-1']);

    const result = await controller.getHistory({ user: { sub: 'user-1' } });
    expect(result).toEqual(['msg-1']);
    expect(conversationsService.getConversationHistory).toHaveBeenCalledWith('user-1');
  });

  it('confirmAction should return success message', async () => {
    const { controller } = createController();
    const result = await controller.confirmAction({ user: { sub: 'user-1' } }, 'action-1');
    expect(result).toEqual({ success: true, message: 'Acción confirmada' });
  });
});
