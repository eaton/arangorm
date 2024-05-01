import { z } from 'zod';

const dbNamePattern = /[a-zA-Z0-9-_]{1,64}/;
const collectionNamePattern = /[a-zA-Z0-9-_]{1,128}/
const keyPattern = /[a-zA-Z0-9_@()+,=;$!'%*.-]{1,254}/;
const idPattern = /[a-zA-Z0-9-_]{1,128}\[a-zA-Z0-9_@()+,=;$!'%*.-]{1,254}/;

// DB and collection names
export const databaseName = z.string().regex(dbNamePattern, { message: 'Valid DB name characters: a-zA-Z0-9_-' });
export const collectionName = z.string().regex(collectionNamePattern, { message: 'Valid collection name characters: a-zA-Z0-9_-' });

// Keys and IDs. (IDs are just a key and a collection name joined with a slash)
export const documentKey = z.string().regex(keyPattern, { message: `Valid document key characters: a-zA-Z0-9_@()+,=;$!'%*.-`});
export const documentId = z.string().regex(idPattern);

export const DocumentSchema = z.object({
  _id: documentId.optional(),
  _key: documentKey.optional(),
  _rev: z.string().optional()
}).passthrough();

export const EdgeSchema = DocumentSchema.extend({
  _to: documentId,
  _from: documentId,
});

export const CollectionSchema = z.object({
  name: collectionName,
  edge: z.boolean().optional().default(false),
  schema: z.instanceof(z.ZodAny).optional(),
});

export const DbSchema = z.object({
  name: collectionName,
  collections: z.array(CollectionSchema).optional()
});

