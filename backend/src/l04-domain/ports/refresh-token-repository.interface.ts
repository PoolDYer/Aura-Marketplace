export interface IRefreshTokenRepository {
  findByToken(token: string): Promise<any | null>;
  create(token: string, userId: string, expiresAt: Date): Promise<any>;
  revokeManyByToken(token: string): Promise<void>;
}
