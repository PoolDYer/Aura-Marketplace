export interface IReviewRepository {
  findManyByProduct(publicacionId: string): Promise<any[]>;
  create(data: {
    ordenId: string;
    compradorId: string;
    publicacionId: string;
    calificacion: number;
    comentario?: string;
  }): Promise<any>;
  findFirstReview(ordenId: string, publicacionId: string): Promise<any | null>;
}
