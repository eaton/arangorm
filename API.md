# How It Works

At its heart, this is just a wrapper for key-indexed document stores. There are some variations between storage systems that use a single bucket and ones that support named sub-buckets; storage providers can also (optionally) support lightweight querying of items in a given bucket. But that's optional.

Every object stored in the system has to follow a couple of basic rules:

1. Must be serializable to JSON.
2. May have a collection/bucket/value-type stored in its `_collection` property.
3. May have a bucket-relative identifier stored in its `_key` property.
4. Must have an `_id` property that consists of a `_collection` and a `_key`, separated by a slash.

When storing an item for the first time, if a `_collection` is given but no `_key` or `_id` is given, the Storage System should populate the `_key` value with a random or hash-based identifier. If only the `_id` property is supplied, it should be expanded and both `_key` and `_collection` should be populated based on its split value.
