export interface IAdminRepository {
  findUsers(): Promise<any[]>;
  findUserById(id: string): Promise<any | null>;
  updateUserStatus(userId: string, estado: string): Promise<any>;
  deactivateSellerProducts(userId: string): Promise<void>;
  getReports(): Promise<{
    totalUsers: number;
    activeProducts: number;
    totalOrders: number;
    totalSales: number;
  }>;
  findOrders(): Promise<any[]>;
  updateOrderStatus(id: string, estado: any): Promise<any>;
  findProducts(): Promise<any[]>;
  updateProductStatus(id: string, estado: any): Promise<any>;
  deleteProduct(id: string): Promise<any>;
}
