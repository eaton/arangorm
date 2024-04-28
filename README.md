# Eaton IDs

Not really an ORM, just a convenience wrapper around ArangoDB that eliminates the boilerplate from common tasks. These shouldn't be treated as an abstraction layer; understanding the actual AQL and ArangoDB concepts happening under the hood is still important. Note that this library is being built against ArangoJS 9.

## Database wrapper

`getConnection` takes a standard connection object and returns a Database instance; behind the scenes it maintains a distinct db object for each connection, and can (optionally) handle the creation of a new atabase instance if the account in use has create permissions.

A custom Database wrapper class also handles stuff like has/get/check/clear for any document with an `_id`, or any document with a `_key` when a collection name is supplied.

## Schema builder

Use zod to define schemas, then use them for validation when reading in documents. Optionally generate a JSONSchema that Arango can use to enforce schema validity, as well.

## Query builder

In progress. The `aqBuilder` project was a first pass at this, but had a lot of kludgy weirdness and verbosity when working with complex queries.

## Batch processor

Pass in a query and get back an iterator that spits out results one by one. It handles cursors and windows under the hood to avoid thrashing Arango unecessarily. Optionally pass in a task function, and make modifications or optionally re-insert the changed data.

## Reporting tool

Run a query, get back the results as an Array, Object, or DataFrame. Spit those out in a variety of formats, including MS Excel.
