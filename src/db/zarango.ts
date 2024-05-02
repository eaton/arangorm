import { Database } from "arangojs";
import { getSelector, DocumentSelector, DocumentTarget } from "../util/get-selector.js";
import { AqlQuery } from "arangojs/aql";
import { Config } from "arangojs/connection";
import { CreateCollectionOptions } from "arangojs/collection";

export class Zarango extends Database {
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
  async push(item: any, update = true) {
    const sel = getSelector(item);
    return this.collection(sel._collection).save({ ...item, ...sel }, { overwriteMode: update ? 'update' : 'ignore' })
  }

  /**
   * A quick check to see if a given document exists.
   */
  async has(input: DocumentSelector): Promise<boolean> {
    const sel = getSelector(input);
    return this.collection(sel._collection).documentExists(sel._key);
  }

  /**
   * Get a single document.
   */
  async fetch(input: DocumentSelector) {
    const { _collection } = getSelector(input);
    return this.collection(_collection).document(input)
  }

  async *queryAll<T = unknown>(aql: AqlQuery, batchSize?: number) {
    const cursor = await this.query<T>(aql);
    while (cursor.hasNext) yield cursor.next();
  }
  
  /**
   * Delete the document with the given ID from ArangoDB.
   */
  async delete(input: DocumentSelector): Promise<boolean> {
    const { _collection } = getSelector(input);
    return this.collection(_collection).remove(input).then(() => true);
  }

  /**
   * Ensure a given collection exists; if it doesn't, create it.
   *
   * Returns a Promise that resolves to TRUE if the collection was created,
   * FALSE if it already existed. If an error is encountered, the promisse
   * is rejected.
   */
  async ensure(name: string, options?: CreateCollectionOptions & { edge?: boolean } ): Promise<boolean> {
    return this.collection(name)
      .exists()
      .then((exists) => {
        if (exists) return false;
        if (options?.edge) return this.createEdgeCollection(name, options).then(() => true);
        return this.createCollection(name, options).then(() => true);
      });
  }
  
  /**
   * Blindly empties all the documents in a given collection.
   *
   * Returns a Promise that resolves to the number of documents deleted; if the collection
   * didn't exist at all, the count will be -1.
   */
  async empty(name: string): Promise<number> {
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
  async destroy(name: string): Promise<boolean> {
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