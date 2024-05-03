import { DocumentSelector, SaveableDocument, RetrievedDocument, getIdsWithCollections } from "../api/get-ids.js";
import { StorageSystem } from "../api/storage-system.js";
import { WithCollections } from "../api/with-collections.js";
import { PropertyFilter, WithQueries, buildFilterFunction } from "../api/with-queries.js";

export class MemoryStore<T extends RetrievedDocument> implements StorageSystem<T>, WithCollections, WithQueries<T> {
  protected data: Record<string, Map<string, T>> = {};

  getIds = getIdsWithCollections;

  save(input: SaveableDocument) {
    const ids = getIdsWithCollections(input);

    input._id = ids._id;
    input._key = ids._key;
    input._collection = ids._collection;

    this.data[ids._collection]?.set(ids._key, input as T);
    return Promise.resolve(ids);
  }

  saveAll(input: SaveableDocument[]) {
    return Promise.all(input.map(i => this.save(i)));
  }

  has(input: DocumentSelector): Promise<boolean> {
    const sel = getIdsWithCollections(input);
    return Promise.resolve(this.data[sel._collection]?.has(sel._key));
  }

  fetch(input: DocumentSelector, options?: Record<string, unknown>): Promise<T | undefined> {
    const ids = getIdsWithCollections(input);
    return Promise.resolve(this.data[ids._collection]?.get(ids._key) as T);
  }

  fetchAll(collection: string, filters?: Record<string, PropertyFilter>): Promise<T[]> {
    return Promise.resolve(
      [...this.data[collection]?.values() ?? []]
        .filter(buildFilterFunction(filters))
    );
  }

  delete(input: DocumentSelector, options?: Record<string, unknown>): Promise<boolean> {
    const ids = getIdsWithCollections(input);
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