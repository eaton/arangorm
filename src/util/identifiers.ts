import { SetRequired } from "type-fest";

export type ObjectMetadata = {
  _collection?: string;
  _key?: string;
  _id?: string;
}

export type ObjectWithId = SetRequired<ObjectMetadata, '_id'> ;
export type ObjectWithCollection = SetRequired<ObjectMetadata, '_collection'> ;
export type ObjectWithCollectionAndKey = SetRequired<ObjectMetadata, '_collection' | '_key'> ;

export type SaveableDocument = Record<string, unknown> & (ObjectWithId | ObjectWithCollection);

/**
 * A 'selector' is any combination of properties, or a single string, that
 * contains enough information to identify a specific item in a specific collection.
 * 
 * That could be:
 * 
 * - A string in the form of `collection-name/key`
 * - An object with an `_id` property
 * - An object with `_key` and `_collection` properties
 * 
 * It will return an object with _key, _collection, and _id explicitly set.
 */
export type DocumentSelector = string | ObjectWithId | ObjectWithCollectionAndKey
