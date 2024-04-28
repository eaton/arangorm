import { z } from 'zod';

export const databaseName = z.string().regex(/[a-zA-Z0-9-_]/, { message: 'Valid characters are a-z, A-Z, 0-9, _, and -.' });
export const collectionName = z.string().regex(/[a-zA-Z0-9-_]/, { message: 'Valid characters are a-z, A-Z, 0-9, _, and -.' });

export const documentKey = z.string(); // Todo - validate key rules
export const documentId = z.string(); // Todo - id rules

export const DocumentSchema = z.object({
  _id: documentId.optional(),
  _key: documentKey.optional(),
  _rev: z.string().optional()
});

export const EdgeSchema = DocumentSchema.extend({
  _to: documentId,
  _from: documentId,
});