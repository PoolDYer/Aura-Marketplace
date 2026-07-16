import { PaymentsController } from './payments.controller';

describe('PaymentsController', () => {
  const createController = () => {
    const mercadoPagoService = {
      getPublicConfig: jest.fn(),
      createCheckoutPreference: jest.fn(),
      createBrickInitialization: jest.fn(),
      processBrickPayment: jest.fn(),
      handleWebhook: jest.fn(),
      verifyPayment: jest.fn(),
      getPaymentStatus: jest.fn(),
    };
    const controller = new PaymentsController(mercadoPagoService as any);
    return { controller, mercadoPagoService };
  };

  it('getPublicConfig should return public payment configuration', () => {
    const { controller, mercadoPagoService } = createController();
    mercadoPagoService.getPublicConfig.mockReturnValue({ mercadoPagoPublicKey: 'pk_test_123' });

    expect(controller.getPublicConfig()).toEqual({ mercadoPagoPublicKey: 'pk_test_123' });
    expect(mercadoPagoService.getPublicConfig).toHaveBeenCalled();
  });

  it('createCheckoutPreference should call mercadoPagoService.createCheckoutPreference', () => {
    const { controller, mercadoPagoService } = createController();
    mercadoPagoService.createCheckoutPreference.mockReturnValue({ id: 'pref-1' });

    const result = controller.createCheckoutPreference({ user: { sub: 'user-1' } }, 'order-1');
    expect(result).toEqual({ id: 'pref-1' });
    expect(mercadoPagoService.createCheckoutPreference).toHaveBeenCalledWith('user-1', 'order-1');
  });

  it('handleWebhook should read rawBody or body and call webhook handler', async () => {
    const { controller, mercadoPagoService } = createController();
    mercadoPagoService.handleWebhook.mockResolvedValue({ success: true });

    const reqMock = { rawBody: Buffer.from('raw') };
    const result = await controller.handleWebhook('sig', 'req-1', 'payment-1', reqMock as any);
    expect(result).toEqual({ success: true });
    expect(mercadoPagoService.handleWebhook).toHaveBeenCalledWith('sig', 'req-1', 'payment-1', reqMock.rawBody);
  });
});
