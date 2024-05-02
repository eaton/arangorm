import { ObjectWithId } from "arangojs/documents";

export type ObjectWithCollection = {
  [key: string]: any;
  _collection: string;
};

export type ObjectWithCollectionAndKey = {
  [key: string]: any;
  _collection: string;
  _key: string;
};

export type DocumentTarget = string | ObjectWithId | ObjectWithCollection
export type DocumentSelector = string | ObjectWithId | ObjectWithCollectionAndKey

  export function getSelector(input: DocumentTarget | DocumentSelector, key?: string) {
    let _key: string | undefined = undefined;
    let _collection: string | undefined = undefined;

    // Tease out the individual pieces
    if (typeof input === 'string') {
      [_collection, _key] = [...input.split('/'), key];
    } else if ('_id' in input) {
      [_collection, _key] = input._id.split('/');
    } else {
      [_collection, _key] = [input._collection, input._key];
    }

    // Throw an error if _key and _collection aren't both present
    if (_collection === undefined) throw new Error('Invalid object _collection');

    const output: Record<string, string> = {};
    if (_key) output._key = _key;
    if (_collection) output._collection = _collection;
    return output;
  };
