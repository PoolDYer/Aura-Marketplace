import { AdminService } from './admin.service';

describe('AdminService Colocated Edge Cases', () => {
  const createService = () => {
    const adminRepo = {
      findUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUserStatus: jest.fn(),
      deactivateSellerProducts: jest.fn(),
      getReports: jest.fn(),
      findOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      findProducts: jest.fn(),
      updateProductStatus: jest.fn(),
      deleteProduct: jest.fn(),
    };
    return { service: new AdminService(adminRepo as any), adminRepo };
  };

  it('suspending a user without active products should run successfully', async () => {
    const { service, adminRepo } = createService();
    adminRepo.findUserById.mockResolvedValue({ id: 'vendor-1' });
    adminRepo.updateUserStatus.mockResolvedValue({ id: 'vendor-1', estado: 'SUSPENDIDO' });
    adminRepo.deactivateSellerProducts.mockResolvedValue(undefined);

    const result = await service.updateUserStatus('vendor-1', { estado: 'SUSPENDIDO' as any });
    expect(result.estado).toBe('SUSPENDIDO');
    expect(adminRepo.deactivateSellerProducts).toHaveBeenCalledWith('vendor-1');
  });

  it('updateUserStatus should not deactivate vendor products if status is changed to ACTIVO', async () => {
    const { service, adminRepo } = createService();
    adminRepo.findUserById.mockResolvedValue({ id: 'vendor-1' });
    adminRepo.updateUserStatus.mockResolvedValue({ id: 'vendor-1', estado: 'ACTIVO' });

    const result = await service.updateUserStatus('vendor-1', { estado: 'ACTIVO' as any });
    expect(result.estado).toBe('ACTIVO');
    expect(adminRepo.deactivateSellerProducts).not.toHaveBeenCalled();
  });

  it('getReports should fallback sales total to 0 if prisma returns null', async () => {
    const { service, adminRepo } = createService();
    adminRepo.getReports.mockResolvedValue({
      totalUsers: 10,
      activeProducts: 20,
      totalOrders: 5,
      totalSales: 0,
    });

    const result = await service.getReports();
    expect(result.totalSales).toBe(0);
  });
});
