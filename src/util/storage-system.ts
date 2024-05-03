import {
  DocumentSelector,
  ObjectWithId
} from "./identifiers.js";

export type ObjectIdentifier = {
  _collection: string,
  _key: string,
  _id: string
}

export type SaveableDocument = Record<string, unknown> & Partial<ObjectIdentifier>;

export interface StorageSystem {
  save(input: SaveableDocument, options?: Record<string, unknown>): Promise<string>;

  saveAll(input: SaveableDocument[], options?: Record<string, unknown>): Promise<string[]>;

  has(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<ObjectWithId>;

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  ensureCollection(name: string): Promise<boolean>;

  emptyCollection(name: string): Promise<number>;

  destroyCollection(name: string): Promise<boolean>;
}