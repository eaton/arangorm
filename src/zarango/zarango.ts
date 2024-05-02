import { Database } from "arangojs";
import { DocumentSelector, ObjectWithId, SaveableDocument} from "../util/meta-types.js";
import { getMeta } from "../util/get-meta.js";
import { Config } from "arangojs/connection";
import { CollectionInsertOptions, CollectionReadOptions, CollectionRemoveOptions, CreateCollectionOptions, DocumentExistsOptions } from "arangojs/collection";
import { merge } from "ts-deepmerge";
import { StorageSystem } from "../storage-system.js";

/**
 * Four types of collections Zarango provides helpers for.
 * 
 * document: Standard ArangoDB document collections.
 * edge: Standard ArangoDB edge collections
 * kvs: A key/value store that can be exposed using JS Map semantics.
 * dataset: A set of similarly-structured items meant to be manipulated as a set.
 *  Useful for csv/tsv imports, logs, etc.
 */
export type ZarangoCollectionType = 'document' | 'edge' | 'kvs' | 'dataset';

export class Zarango extends Database implements StorageSystem {
  /**
   * Given ArangoDB connection information, returns a Zarango
   * instance representing that connection. If a nonexistent database
   * name is given, Zarango will attempt to create the new database
   * and return a connection to it; if the account used has insufficient
   * permissions, the Promise will be rejected.
   */
  static async getConnection(config?: Config) {
    const { databaseName, ...connection } = config ?? {};
    if (databaseName) {
      const db = new Database(connection);
      if (!(await db.listDatabases()).includes(databaseName)) {
        await db.createDatabase(databaseName);
      }
    } 
    return Promise.resolve(new Zarango(config));
  }

  /**
   * Set a document's data, inserting or updating as necessary.
   */
  async save(item: SaveableDocument, options?: CollectionInsertOptions): Promise<ObjectWithId> {
    const defaults: CollectionInsertOptions = { overwriteMode: 'update' };
    const opt: CollectionInsertOptions = merge(defaults, options ?? {});
    const sel = getMeta(item);
    return this.collection(sel._collection).save({ ...item, ...sel }, opt)
  }

  /**
   * Set a document's data, inserting or updating as necessary.
   */
  async saveAll(item: any, options: CollectionInsertOptions = {}) {
    const defaults: CollectionInsertOptions = { overwriteMode: 'update' };
    const opt: CollectionInsertOptions = merge(defaults, options);
    const sel = getMeta(item);
    return this.collection(sel._collection).save({ ...item, ...sel }, opt)
  }
  
  /**
   * A quick check to see if a given document exists.
   */
  async documentExists(input: DocumentSelector): Promise<boolean> {
    const sel = getMeta(input);
    return this.collection(sel._collection).documentExists(sel._key);
  }

  /**
   * Get a single document.
   */
  async document(input: DocumentSelector, options: CollectionReadOptions = {}) {
    const { _collection } = getMeta(input);
    return this.collection(_collection).document(input, options)
  }
  
  /**
   * Delete the document with the given ID from ArangoDB.
   */
  async remove(input: DocumentSelector, options: CollectionRemoveOptions = {}): Promise<boolean> {
    const { _collection } = getMeta(input);
    return this.collection(_collection).remove(input, options).then(() => true);
  }

  /**
   * Ensure a given collection exists; if it doesn't, create it.
   *
   * Returns a Promise that resolves to TRUE if the collection was created,
   * FALSE if it already existed. If an error is encountered, the promisse
   * is rejected.
   */
  async ensureCollection(name: string, options: CreateCollectionOptions & { type?: ZarangoCollectionType } = {} ): Promise<boolean> {
    const { type, ...opt } = options;

    return this.collection(name)
      .exists()
      .then((exists) => {
        if (exists) return false;
        if (type === 'edge') return this.createEdgeCollection(name, options).then(() => true);
        return this.createCollection(name, opt).then(() => true);
      });
  }
  
  /**
   * Blindly empties all the documents in a given collection.
   *
   * Returns a Promise that resolves to the number of documents deleted; if the collection
   * didn't exist at all, the count will be -1.
   */
  async emptyCollection(name: string): Promise<number> {
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

  /**
   * Blindly deletes a collection.
   *
   * Returns a Promise that resolves to TRUE if the collection was deleted deleted, and
   * FALSE if it didn't exist in the first place.
   */
  async destroyCollection(name: string): Promise<boolean> {
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