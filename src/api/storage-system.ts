import { DocumentSelector, DocumentIdentifier, SaveableDocument, RetrievedDocument } from "./get-ids.js";

/**
 * Basic interface for a Key/Value retrieval system.
 */
export interface StorageSystem<T extends RetrievedDocument = RetrievedDocument> {
  
  getIds(input: DocumentSelector | SaveableDocument): DocumentIdentifier;

  save(input: SaveableDocument, options?: Record<string, unknown>): Promise<DocumentIdentifier>;

  saveAll(input: SaveableDocument[], options?: Record<string, unknown>): Promise<DocumentIdentifier[]>;

  has(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<T | undefined>;

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;
}