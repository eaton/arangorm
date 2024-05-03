import { DocumentSelector, DocumentIdentifier, SaveableDocument, RetrievedDocument } from "./get-ids.js";

export interface StorageSystem {
  getIds(input: DocumentSelector | SaveableDocument): DocumentIdentifier;

  save(input: SaveableDocument, options?: Record<string, unknown>): Promise<DocumentIdentifier>;

  saveAll(input: SaveableDocument[], options?: Record<string, unknown>): Promise<DocumentIdentifier[]>;

  has(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<RetrievedDocument | undefined>;

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;
}