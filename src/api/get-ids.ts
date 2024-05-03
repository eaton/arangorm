import { nanoid, alphabets } from "@eatonfyi/ids";

export type DocumentIdentifier = {
  _id: string,
  _collection: string,
  _key: string,
}

export type CollectionAndKey = {
  _collection: string,
  _key: string,
}

export type CollectionOnly = {
  _collection: string,
}

export type IdOnly = {
  _id: string,
}

export type DocumentSelector = string | IdOnly | CollectionAndKey;

export interface SaveableDocument {
  _collection?: string,
  _key?: string,
  _id?: string
}

export interface RetrievedDocument {
  _collection: string,
  _key: string,
  _id: string
}
  
/**
 * Given an input string or object, return an object with an _id, _collection, and _key.
 */
export function getIds(input: DocumentSelector | SaveableDocument): DocumentIdentifier {
  let _key: string | undefined = undefined;
  let _collection: string | undefined = undefined;
  let _id: string | undefined = undefined;

  if (typeof input === 'string') {
    // If a string has been given, split out its collection and key components.
    [_collection, _key] = input.split('/');
  } else if ('_id' in input) {
    _id = input._id;
    [_collection, _key] = input._id?.split('/') ?? [];
  } else {
    [_collection, _key] = [input._collection, input._key];
  }

  // Throw an error if _collection isn't defined
  if (_collection === undefined) throw new Error('Invalid object _collection');
  _key ||= nanoid(16, alphabets.NoLookalikes);
  _id = [_collection, _key].join('/');

  return { _key, _collection, _id };
};
