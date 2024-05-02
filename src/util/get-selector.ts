import { DocumentSelector, SaveableDocument } from "./meta-types.js";

/**
 * Given an input string or object, return an object with an _id, _collection, and _key.
 */
export function getSelector(input: SaveableDocument | DocumentSelector) {
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

  // Throw an error if _key and _collection aren't both present
  if (_collection === undefined) throw new Error('Invalid object _collection');

  const output: Record<string, string> = {};
  if (_key) output._key = _key;
  if (_collection) output._collection = _collection;
  if (_id) {
    output._id = _id;
  } else if (_collection && _key) {
    output._id ??= [_collection, _key].join('/');
  }
  
  return output;
};
