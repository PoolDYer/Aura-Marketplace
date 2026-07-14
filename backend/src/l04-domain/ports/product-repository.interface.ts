import { EstadoPublicacion } from '../products/product.enums';

export interface IProductRepository {
  create(vendedorId: string, data: any, imageUrls: string[]): Promise<any>;
  findManyByVendor(vendedorId: string): Promise<any[]>;
  findOneByVendorAndId(vendedorId: string, id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  upsertInventario(publicacionId: string, availableStock: number, reservedStock: number): Promise<any>;
  deleteManyImagenes(publicacionId: string): Promise<any>;
  createManyImagenes(data: any[]): Promise<any>;
  findActiveProducts(): Promise<any[]>;
  findActiveProductById(id: string): Promise<any | null>;
  findProductById(id: string): Promise<any | null>;
  updateStatus(id: string, estado: EstadoPublicacion): Promise<any>;
}
