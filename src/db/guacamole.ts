import { Database } from "arangojs";
import { ObjectWithId, ObjectWithKey, DocumentSelector } from "arangojs/documents";

export class Guacamole extends Database {

  getId(input: DocumentSelector) {

  };

  /**
   * Set a document's data, inserting or updating as necessary.
   */
  async set(item: any, id?: string, update = true) {
    // Set the _collection and _key variables from the incoming ID if it exists,
    // and the item's own _id property if IT exists. If they're still not populated,
    // try the item's _collection and _key properties.
    let [_collection, _key] = (id ?? item._id)?.split('/') ?? [];
    _collection ??= item._collection;
    _key ??= item._key;
    const _id = [_collection, _key].join('/');

    if (_collection === undefined) {
      Promise.reject(
        new Error(
          'Item has no _collection property, and no collection was specified.'
        )
      );
    }
    if (_key === undefined) {
      Promise.reject(new Error('Item has no unique key, and none was given.'));
    }

    return this.collection(_collection) .save({ ...item, _id }, { overwriteMode: update ? 'update' : 'ignore' })
  }

  /**
   * A quick check to see if a given document exists.
   */
  async has(id: string): Promise<boolean> {
    const [collection, key] = id.split('/');
    return this.collection(collection).documentExists(key);
  }

  /**
   * Delete the document with the given ID from ArangoDB.
   */
  async delete(selector: DocumentSelector, collection?: string): Promise<boolean> {
    // This needs better logic; settle on "magic" key/id mapping or make it
    // explicit.
    const _id = [idOrKey, collection].filter(Boolean).join('/');
    const [_collection, _key] = _id.split('/');

    return this.collection(_collection)
      .remove({ _key })
      .then(() => true);
  }

  /**
   * Ensure a given collection exists; if it doesn't, create it.
   *
   * Returns a Promise that resolves to TRUE if the collection was created,
   * FALSE if it already existed. If an error is encountered, the promisse
   * is rejected.
   */
    async ensureCollection(name: string): Promise<boolean> {
      return this.collection(name)
        .exists()
        .then((exists) => {
          if (exists) return false;
          return this.createCollection(name).then(() => true);
        });
    }
  
    /**
     * Ensure a given edge collection exists; if it doesn't, create it.
     *
     * Returns a Promise that resolves to TRUE if the collection was created,
     * FALSE if it already existed. If an error is encountered, the promisse
     * is rejected
     */
    async ensureEdgeCollection(name: string) {
      return this.collection(name)
        .exists()
        .then((exists) => {
          if (exists) return this.collection(name);
          return this.createEdgeCollection(name);
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