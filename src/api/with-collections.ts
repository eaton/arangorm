import { PropertyFilter } from "./property-filter";
import { RetrievedDocument } from "./get-ids";

/**
 * Collection management functions.
 * 
 * Storage Systems that support collections
 */
export interface WithCollections<T extends RetrievedDocument = RetrievedDocument> {
  getCollections(): Promise<string[]>

  ensureCollection(name: string): Promise<number>;

  emptyCollection(name: string): Promise<number>;

  destroyCollection(name: string): Promise<boolean>;

  fetchAll(collection: string, filters?: Record<string, PropertyFilter>): Promise<T[]>

}