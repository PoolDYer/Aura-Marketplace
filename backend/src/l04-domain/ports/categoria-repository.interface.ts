export interface ICategoriaRepository {
  findById(id: string): Promise<any | null>;
  findActiveRootCategories(): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
}
