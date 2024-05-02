import { z } from "zod";
import { JsonAnySchema } from "./base-schema.js";
import { AqlQuery, AqlLiteral } from "arangojs/aql";
import { Database } from "arangojs";

this.query(aq, options).then(cursor => cursor.all());

const foo = function* () {
  yield 'a';
  yield 'b';
  yield 'c';
};

export function queryAll<T extends z.infer<typeof JsonAnySchema>>(aql: AqlQuery<z.infer<T>>) {
  const c = new Database();

}