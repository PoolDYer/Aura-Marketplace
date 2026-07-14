export interface ICacheProvider {
  getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T>;
  delete(key: string): void;
  deleteByPrefix(prefix: string): void;
}
