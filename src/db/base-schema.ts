import { z } from 'zod';

const dbNamePattern = /[a-zA-Z0-9-_]{1,64}/;
const collectionNamePattern = /[a-zA-Z0-9-_]{1,128}/
const keyPattern = /[a-zA-Z0-9_@()+,=;$!'%*.-]{1,254}/;
const idPattern = /[a-zA-Z0-9-_]{1,128}\/[a-zA-Z0-9_@()+,=;$!'%*.-]{1,254}/;

// DB and collection names
export const databaseName = z.string().regex(dbNamePattern, { message: 'Valid DB name characters: a-zA-Z0-9_-' });
export const collectionName = z.string().regex(collectionNamePattern, { message: 'Valid collection name characters: a-zA-Z0-9_-' });

// Keys and IDs. (IDs are just a key and a collection name joined with a slash)
export const documentKey = z.string().regex(keyPattern, { message: `Valid document key characters: a-zA-Z0-9_@()+,=;$!'%*.-`});
export const documentId = z.string().regex(idPattern);

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const JsonAnySchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(JsonAnySchema), z.record(JsonAnySchema)])
);
export const JsonObjectSchema = z.record(JsonAnySchema);
export const ZDocumentSchema = JsonObjectSchema
  .and(z.object({
    _id: documentId,
    _key: documentKey,
    _rev: z.string(),
  }));
export const ZEdgeSchema = ZDocumentSchema
  .and(z.object({
    _from: documentId,
    _to: documentId,
  }));
export const ZDocOrEdgeSchema = z.union([ZDocumentSchema, ZEdgeSchema]);
