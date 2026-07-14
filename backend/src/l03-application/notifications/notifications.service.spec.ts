import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService Colocated Edge Cases', () => {
  const createService = () => {
    const notificationRepo = {
      findManyByUser: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const provider = { sendNotification: jest.fn() };
    const userRepo = {
      findPreferencesByUserId: jest.fn(),
    };
    return {
      service: new NotificationsService(notificationRepo as any, provider as any, userRepo as any),
      notificationRepo,
      provider,
      userRepo,
    };
  };

  it('SEGURIDAD notifications must bypass user preferences and always send (RN-12)', async () => {
    const { service, notificationRepo, provider, userRepo } = createService();
    // Preferences disable all notifications
    userRepo.findPreferencesByUserId.mockResolvedValue({
      notifNuevaOrden: false,
      notifEstadoOrden: false,
      notifMarketing: false,
    });
    notificationRepo.create.mockResolvedValue({ id: 'notif-1', estado: 'PENDIENTE' });
    provider.sendNotification.mockResolvedValue(true);
    notificationRepo.update.mockResolvedValue({ id: 'notif-1', estado: 'ENVIADA' });

    const result = await service.sendNotification('user-1', 'SEGURIDAD', 'Alerta de login');
    expect(result).toEqual({ id: 'notif-1', estado: 'ENVIADA' });
    expect(notificationRepo.create).toHaveBeenCalled();
  });

  it('markAsRead should throw NotFoundException if notification does not belong to the requesting user', async () => {
    const { service, notificationRepo } = createService();
    // Notification belongs to user-2, but requested by user-1
    notificationRepo.findById.mockResolvedValue({ id: 'notif-1', usuarioId: 'user-2' });

    await expect(service.markAsRead('user-1', 'notif-1')).rejects.toThrow(NotFoundException);
  });
  
  it('should create notification with PENDIENTE status if provider fails to deliver', async () => {
    const { service, notificationRepo, provider, userRepo } = createService();
    userRepo.findPreferencesByUserId.mockResolvedValue({ notifNuevaOrden: true }); // Preferences allow
    notificationRepo.create.mockResolvedValue({ id: 'notif-1', estado: 'PENDIENTE' });
    provider.sendNotification.mockResolvedValue(false); // Provider fail
    notificationRepo.update.mockResolvedValue({ id: 'notif-1', estado: 'FALLIDA' });

    const result = await service.sendNotification('user-1', 'ORDEN_NUEVA', 'Nueva orden');
    expect(result.estado).toBe('FALLIDA');
    expect(notificationRepo.update).toHaveBeenCalled();
  });
});
