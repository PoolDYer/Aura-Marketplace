export interface IPromotionRepository {
  findCuponByCodigo(codigo: string): Promise<any | null>;
  findActivePromotionsForProducts(publicacionIds: string[], now: Date): Promise<any[]>;
}
