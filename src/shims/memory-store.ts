import { DocumentSelector, SaveableDocument, RetrievedDocument, getIds } from "../api/get-ids.js";
import { StorageSystem } from "../api/storage-system.js";
import { WithCollections } from "../api/with-collections.js";

export class MemoryStore<T extends RetrievedDocument> implements StorageSystem, WithCollections {
  protected data: Record<string, Map<string, RetrievedDocument>> = {};

  getIds = getIds;

  save(input: SaveableDocument) {
    const ids = getIds(input);

    input._id = ids._id;
    input._key = ids._key;
    input._collection = ids._collection;

    this.data[ids._collection]?.set(ids._key, input as RetrievedDocument);
    return Promise.resolve(ids);
  }

  saveAll(input: SaveableDocument[]) {
    return Promise.all(input.map(i => this.save(i)));
  }

  has(input: DocumentSelector): Promise<boolean> {
    const sel = getIds(input);
    return Promise.resolve(this.data[sel._collection]?.has(sel._key));
  }

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<RetrievedDocument | undefined> {
    const ids = getIds(input);
    return Promise.resolve(this.data[ids._collection]?.get(ids._key));
  }

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean> {
    const ids = getIds(input);
    return Promise.resolve(this.data[ids._collection]?.delete(ids._key));
  }

  /**
   * WithCollections implementation
   */
  getCollections(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.data));
  }

  ensureCollection(name: string): Promise<number> {
    const size = this.data[name]?.size ?? -1;
    this.data[name] ??= new Map<string, T>();
    return Promise.resolve(size);  
  }

  emptyCollection(name: string): Promise<number> {
    const size = this.data[name]?.size ?? -1;
    this.data[name]?.clear();
    return Promise.resolve(size);
  }

  destroyCollection(name: string) {
    const exists = !!this.data[name];
    delete this.data[name];
    return Promise.resolve(exists);
  }
}