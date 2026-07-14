export interface ICartRepository {
  findUnique(compradorId: string): Promise<any | null>;
  create(compradorId: string): Promise<any>;
  findItemInCart(carritoId: string, publicacionId: string): Promise<any | null>;
  updateItem(id: string, cantidad: number): Promise<any>;
  createItem(carritoId: string, publicacionId: string, cantidad: number): Promise<any>;
  findItemById(id: string, carritoId: string): Promise<any | null>;
  deleteItem(id: string): Promise<any>;
  deleteManyItems(carritoId: string): Promise<any>;
}
