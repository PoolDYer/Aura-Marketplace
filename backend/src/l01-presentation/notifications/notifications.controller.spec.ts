import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  const createController = () => {
    const notificationsService = {
      getMyNotifications: jest.fn(),
      markAsRead: jest.fn(),
    };
    const controller = new NotificationsController(notificationsService as any);
    return { controller, notificationsService };
  };

  it('getMyNotifications should call notificationsService.getMyNotifications', () => {
    const { controller, notificationsService } = createController();
    notificationsService.getMyNotifications.mockReturnValue(['notif-1']);

    const result = controller.getMyNotifications({ user: { userId: 'legacy-1' } });
    expect(result).toEqual(['notif-1']);
    expect(notificationsService.getMyNotifications).toHaveBeenCalledWith('legacy-1');
  });

  it('markAsRead should call notificationsService.markAsRead', () => {
    const { controller, notificationsService } = createController();
    notificationsService.markAsRead.mockReturnValue({ id: 'n1', estado: 'ENVIADA' });

    const result = controller.markAsRead({ user: { userId: 'legacy-1' } }, 'n1');
    expect(result).toEqual({ id: 'n1', estado: 'ENVIADA' });
    expect(notificationsService.markAsRead).toHaveBeenCalledWith('legacy-1', 'n1');
  });
});
