import {
  StorageSystem,
  DocumentSelector,
  DocumentIdentifier,
  SaveableDocument,
  getIdsWithCollections,
  inefficientFilterFunction,
  PropertyFilter,
  RetrievedDocument
} from "../api/index.js";
import jetpack from "@eatonfyi/fs-jetpack";

export class FileStore implements StorageSystem {
  jetpack: typeof jetpack;

  constructor(path: string) {
    this.jetpack = jetpack.dir(path);
  }

  getIds = getIdsWithCollections;

  /**
   * Set a document's data, inserting or updating as necessary.
   */
  async save(item: SaveableDocument): Promise<DocumentIdentifier> {
    const sel = getIdsWithCollections(item);
    item._id = sel._id;
    item._key = sel._key;
    item._collection = sel._collection;

    this.jetpack.dir(sel._collection).write(item._key + '.json', item);
    return Promise.resolve(sel);
  }

  async saveAll(items: SaveableDocument[]): Promise<DocumentIdentifier[]> {
    return Promise.all(items.map(i => this.save(i)));
  }
  
  async has(input: DocumentSelector): Promise<boolean> {
    const sel = getIdsWithCollections(input);
    return Promise.resolve(this.jetpack.dir(sel._collection).exists(sel._key + '.json') == 'file');
  }

  async fetch(input: DocumentSelector): Promise<RetrievedDocument> {
    const { _collection, _key } = getIdsWithCollections(input);
    return Promise.resolve(this.jetpack.dir(_collection).read(_key + '.json', 'json'));
  }
  
  // Sweet mother of god this is terrible.
  async fetchAll(collection: string, filters: Record<string, PropertyFilter> = {}): Promise<RetrievedDocument[]> {
    throw new Error('Not yet implemented');
  }

  async delete(input: DocumentSelector) {
    const { _id } = getIdsWithCollections(input);
    if (this.jetpack.exists(_id + '.json') === 'file') {
      this.jetpack.remove(_id + '.json');
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }

  async getCollections(excludeSystem?: boolean): Promise<string[]> {
    return Promise.resolve(this.jetpack.list() ?? []);
  }

  async ensureCollection(name: string) {
    return Promise.resolve(this.jetpack.dir(name).list()?.length ?? 0);
  }
  
  async emptyCollection(name: string) {
    const size = this.jetpack.dir(name).list()?.length ?? 0;
    this.jetpack.remove(name);
    this.jetpack.dir(name)
    return Promise.resolve(size);
  }

  async destroyCollection(name: string) {
    this.jetpack.remove(name);
    return Promise.resolve(true);
  }
}
