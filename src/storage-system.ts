import {
  DocumentSelector,
  SaveableDocument,
  ObjectWithId
} from "./util/meta-types.js";

export interface StorageSystem {
  save(item: SaveableDocument, options?: Record<string, unknown>): Promise<ObjectWithId>;

  documentExists(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  document(input: DocumentSelector, options?: Record<string, unknown>): Promise<ObjectWithId>;

  remove(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean>;

  ensureCollection(name: string): Promise<boolean>;

  emptyCollection(name: string): Promise<number>;

  destroyCollection(name: string): Promise<boolean>;
}