import { AdminController } from './admin.controller';

describe('AdminController', () => {
  const createController = () => {
    const adminService = {
      getUsers: jest.fn(),
      updateUserStatus: jest.fn(),
      getReports: jest.fn(),
      getOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      getProducts: jest.fn(),
      updateProductStatus: jest.fn(),
      deleteProduct: jest.fn(),
      resolveOrder: jest.fn(),
    };
    const controller = new AdminController(adminService as any);
    return { controller, adminService };
  };

  it('getUsers should call adminService.getUsers', () => {
    const { controller, adminService } = createController();
    adminService.getUsers.mockReturnValue(['u1', 'u2']);

    const result = controller.getUsers();
    expect(result).toEqual(['u1', 'u2']);
    expect(adminService.getUsers).toHaveBeenCalled();
  });

  it('updateUserStatus should call adminService.updateUserStatus', () => {
    const { controller, adminService } = createController();
    adminService.updateUserStatus.mockReturnValue({ id: 'u1', estado: 'SUSPENDIDO' });

    const result = controller.updateUserStatus('u1', { estado: 'SUSPENDIDO' as any });
    expect(result).toEqual({ id: 'u1', estado: 'SUSPENDIDO' });
    expect(adminService.updateUserStatus).toHaveBeenCalledWith('u1', { estado: 'SUSPENDIDO' });
  });

  it('getReports should call adminService.getReports', () => {
    const { controller, adminService } = createController();
    adminService.getReports.mockReturnValue({ totalSales: 100 });

    const result = controller.getReports();
    expect(result).toEqual({ totalSales: 100 });
    expect(adminService.getReports).toHaveBeenCalled();
  });
});
