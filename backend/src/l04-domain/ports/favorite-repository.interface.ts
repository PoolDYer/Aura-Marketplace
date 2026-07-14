export interface IFavoriteRepository {
  findManyByUser(compradorId: string): Promise<any[]>;
  create(compradorId: string, publicacionId: string): Promise<any>;
  delete(compradorId: string, publicacionId: string): Promise<any>;
}
