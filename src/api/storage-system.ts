import { DocumentSelector, DocumentIdentifier, SaveableDocument, RetrievedDocument } from "./get-ids.js";
import { PropertyFilter } from "./property-filter.js";

/**
 * Basic interface for a Key/Value retrieval system.
 */
export interface StorageSystem<T extends RetrievedDocument = RetrievedDocument> {

  getIds(input: DocumentSelector | SaveableDocument): DocumentIdentifier;

  save(input: SaveableDocument, options?: Record<string, unknown>): Promise<DocumentIdentifier>;

  saveAll(input: SaveableDocument[], options?: Record<string, unknown>): Promise<DocumentIdentifier[]>;

  has(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<T | undefined>;

  fetchAll(collection: string, filters?: Record<string, PropertyFilter>): Promise<T[]>;

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  getCollections(): Promise<string[]>

  ensureCollection(name: string): Promise<number>;

  emptyCollection(name: string): Promise<number>;

  destroyCollection(name: string): Promise<boolean>;
}