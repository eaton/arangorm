import {
  DocumentSelector,
  SaveableDocument,
  ObjectWithId
} from "./identifiers.js";

export interface StorageSystem {
  save(input: SaveableDocument, options?: Record<string, unknown>): Promise<ObjectWithId>;

  saveAll(input: SaveableDocument[], options?: Record<string, unknown>): Promise<ObjectWithId[]>;

  has(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<ObjectWithId>;

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  ensureCollection(name: string): Promise<boolean>;

  emptyCollection(name: string): Promise<number>;

  destroyCollection(name: string): Promise<boolean>;
}