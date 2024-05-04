import { aql, Database } from "arangojs";
import { Config } from "arangojs/connection";
import {
  CollectionInsertOptions,
  CollectionReadOptions,
  CollectionRemoveOptions,
  CreateCollectionOptions
} from "arangojs/collection";
import { merge } from "ts-deepmerge";

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

export class ArangoStore<T extends RetrievedDocument = RetrievedDocument> extends Database implements StorageSystem<T> {
  /**
   * Given ArangoDB connection information, returns a Zarango
   * instance representing that connection. If a nonexistent database
   * name is given, Zarango will attempt to create the new database
   * and return a connection to it; if the account used has insufficient
   * permissions, the Promise will be rejected.
   */
  static async getConnection(config?: Config) {
    const { databaseName, ...connection } = config ?? {};
    if (databaseName && databaseName !== '_system') {
      const db = new Database(connection);
      if (!(await db.listDatabases()).includes(databaseName)) {
        await db.createDatabase(databaseName);
      }
    } 
    return Promise.resolve(new ArangoStore(config));
  }

  getIds = getIdsWithCollections;

  /**
   * Set a document's data, inserting or updating as necessary.
   */
  async save(item: SaveableDocument, options?: CollectionInsertOptions): Promise<DocumentIdentifier> {
    const defaults: CollectionInsertOptions = { overwriteMode: 'update' };
    const opt: CollectionInsertOptions = merge(defaults, options ?? {});

    const sel = getIdsWithCollections(item);
    item._id = sel._id;
    item._key = sel._key;
    item._collection = sel._collection;

    return this.collection(sel._collection)
      .save(item, options)
      .then(result => sel);
  }

  async saveAll(items: SaveableDocument[], options?: CollectionInsertOptions): Promise<DocumentIdentifier[]> {
    return Promise.all(items.map(i => this.save(i, options)));
  }
  
  async has(input: DocumentSelector): Promise<boolean> {
    const sel = getIdsWithCollections(input);
    return this.collection(sel._collection).documentExists(sel._key);
  }

  async fetch(input: DocumentSelector, options: CollectionReadOptions = {}): Promise<T> {
    const { _collection } = getIdsWithCollections(input);
    return this.collection(_collection).document(input, options)
  }
  
  // Sweet mother of god this is terrible.
  async fetchAll(collection: string, filters: Record<string, PropertyFilter> = {}): Promise<T[]> {
    return this.query<T>(aql`for document in ${this.collection(collection)} return document`)
      .then(cursor => cursor.all())
      .then(documents => documents.filter(i => inefficientFilterFunction(i, filters)))
  }

  async delete(input: DocumentSelector, options: CollectionRemoveOptions = {}) {
    const { _collection } = getIdsWithCollections(input);
    return this.collection(_collection).remove(input, options).then(() => true);
  }

  async getCollections(excludeSystem?: boolean): Promise<string[]> {
    return this.listCollections(true).then(cols => cols.map(col => col.name))
  }

  async ensureCollection(name: string, options: CreateCollectionOptions & { type?: string } = {} ) {
    const { type, ...opt } = options;

    return this.collection(name)
      .exists()
      .then((exists) => {
        if (exists) return this.collection(name).count().then(count => count.count);
        if (type === 'edge') return this.createEdgeCollection(name, options).then(() => -1);
        return this.createCollection(name, opt).then(() => -1);
      });
  }
  
  async emptyCollection(name: string) {
    return this.collection(name)
      .exists()
      .then((exists) => {
        if (exists) {
          return this.collection(name)
            .count()
            .then((count) =>
              this.collection(name)
                .truncate()
                .then(() => count.count)
            );
        } else {
          return -1;
        }
      });
  }

  async destroyCollection(name: string) {
    return this.collection(name)
      .exists()
      .then((exists) => {
        if (exists) {
          return this.collection(name)
            .drop()
            .then(() => true);
        } else {
          return false;
        }
      });
  }
}
