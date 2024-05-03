import { DocumentSelector, ObjectWithId, SaveableDocument} from "./util/identifiers.js";
import { getIdentifiers } from "./util/get-identifiers.js";
import { StorageSystem } from "./util/storage-system.js";

export class MemoryStore<T = SaveableDocument> implements StorageSystem {
  protected data = new Map<string, Map<string, T>>();

  save(input: SaveableDocument): Promise<ObjectWithId> {
    const item = { ...input, ...getIdentifiers(input) };
    this.data.get(item._collection)?.set(item._key, item);
    return Promise.resolve(item);
  }

  saveAll(input: SaveableDocument[]): Promise<ObjectWithId[]> {
    return Promise.all(input.map(i => this.save(i)));
  }

  has(input: DocumentSelector): Promise<boolean> {
    const sel = getIdentifiers(input);
    return Promise.resolve(this.data.get(sel._collection)?.has(sel._key));
  }

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<ObjectWithId> {
    return Promise.resolve(this.data.get(sel._collection)?.get(sel._key));
  }

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean> {
    return Promise.resolve(this.data.get(sel._collection)?.delete(sel._key));
  }

  ensureCollection(name: string): Promise<boolean> {
    if (this.data.has(name)) {
      return Promise.resolve(false);
    } else {
      this.data.set(name, new Map<string, T>());
      return Promise.resolve(true);
    }
  }

  emptyCollection(name: string): Promise<number> {
    const collection = this.data.get(name);

    if (collection) {
      this.data.delete(name);
      return Promise.resolve(collection.size);
    } else {
      return Promise.resolve(-1);
    }
  }

  destroyCollection(name: string): Promise<boolean> {
    if (this.data.has(name)) {
      this.data.delete(name);
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

}