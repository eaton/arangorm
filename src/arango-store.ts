import { Database } from "arangojs";
import { DocumentSelector, ObjectWithId, SaveableDocument} from "./util/identifiers.js";
import { getIdentifiers } from "./util/get-identifiers.js";
import { Config } from "arangojs/connection";
import { CollectionInsertOptions, CollectionReadOptions, CollectionRemoveOptions, CreateCollectionOptions, DocumentExistsOptions } from "arangojs/collection";
import { merge } from "ts-deepmerge";
import { StorageSystem } from "./util/storage-system.js";

export class ArangoStore extends Database implements StorageSystem {
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

  /**
   * Set a document's data, inserting or updating as necessary.
   */
  async save(item: SaveableDocument, options?: CollectionInsertOptions): Promise<ObjectWithId> {
    const defaults: CollectionInsertOptions = { overwriteMode: 'update' };
    const opt: CollectionInsertOptions = merge(defaults, options ?? {});
    const sel = getIdentifiers(item);
    return this.collection(sel._collection).save({ ...item, ...sel }, opt)
  }

  async saveAll(item: any, options: CollectionInsertOptions = {}) {
    const defaults: CollectionInsertOptions = { overwriteMode: 'update' };
    const opt: CollectionInsertOptions = merge(defaults, options);
    const sel = getIdentifiers(item);
    return this.collection(sel._collection).save({ ...item, ...sel }, opt)
  }
  
  async has(input: DocumentSelector): Promise<boolean> {
    const sel = getIdentifiers(input);
    return this.collection(sel._collection).documentExists(sel._key);
  }

  async fetch(input: DocumentSelector, options: CollectionReadOptions = {}) {
    const { _collection } = getIdentifiers(input);
    return this.collection(_collection).document(input, options)
  }
  
  async delete(input: DocumentSelector, options: CollectionRemoveOptions = {}) {
    const { _collection } = getIdentifiers(input);
    return this.collection(_collection).remove(input, options).then(() => true);
  }

  async ensureCollection(name: string, options: CreateCollectionOptions & { type?: string } = {} ) {
    const { type, ...opt } = options;

    return this.collection(name)
      .exists()
      .then((exists) => {
        if (exists) return false;
        if (type === 'edge') return this.createEdgeCollection(name, options).then(() => true);
        return this.createCollection(name, opt).then(() => true);
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