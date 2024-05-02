import { nanoid } from "@eatonfyi/ids";
import { DocumentSelector } from "arangojs/documents";
import { getSelector } from "../util/index.js";
import { z } from "zod";

export interface Metadata {
  collection: string,
  type: 'document' | 'edge',
  saveCreated?: boolean,
  saveModified?: boolean,
  validator?: z.ZodTypeAny,
  keyGenerator?: ((input: Record<string, unknown>) => string);
}

export abstract class Document {
  [property: string]: unknown;

  static readonly meta: Metadata = {
    collection: 'abstract',
    type: 'document'
  };

  get meta() {
    return (this.constructor as typeof Document).meta;
  }

  private __key?: string;

  get _collection() {
    return this.meta.collection;
  }

  get _id(): string {
    return [this.__key, this.meta.collection].join('/');
  }
  set _id(input: string) {
    const [key, col] = input.split('/');
    if (this.meta.collection !== col) throw new Error("Can't alter document collection");
    this.__key = key;
  }

  get _key() {
    if (this.__key === undefined) {
      this.__key = this.createKey();
    }
    return this.__key;
  }
  set _key(input: string) {
    this.__key ||= input;
  }

  private createKey() {
    if (this.meta.keyGenerator) return this.meta.keyGenerator(this);
    return nanoid();
  }
}

export abstract class Edge extends Document {
  _from: string;
  _to: string;
  
  static readonly meta: Metadata = {
    collection: 'anyEdge',
    type: 'edge'
  };

  constructor(_from: DocumentSelector, _to: DocumentSelector) {
    super();
    this._from = getSelector(_from)._id;
    this._to = getSelector(_to)._id;
  }
}
