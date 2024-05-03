/**
 * Collection management functions.
 * 
 * Storage Systems that support collections
 */
export interface WithCollections {
  getCollections(): Promise<string[]>

  ensureCollection(name: string): Promise<number>;

  emptyCollection(name: string): Promise<number>;

  destroyCollection(name: string): Promise<boolean>;
}