export interface ITokenRevocadoRepository {
  findByToken(token: string): Promise<any | null>;
  create(token: string, expiresAt: Date): Promise<any>;
}
