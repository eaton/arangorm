# Minimum Viable Datastore

A light cluster of interfaces that can be used to expose something resembling a document/kv store on top of wildly divergent backends or no backend at all.

The shared interface defines basic CRUD operations and collection creation/management; the intent is to add a simple shim for any storage system that I end up using on a project. Slowly, I'll accumulate a larger and larger pile of shims until I am declared king of the shitty shims and can get a paper novelty crown.

## Usage

Load stuff, save stuff, screw around. The assumption is that anything *persistable* should have a unique key and a bucket that it lives in. It should also have a full identifier, consisting of the bucket and the key. If only a bucket is provided, the key is populated with a random identifier and the ID is created by concatenating the two. If only an ID is provided, the key and bucket are identified by splitting splitting the two parts of the ID. Good? Good. I might tweak that later to make it easier to use in single-bucket scenarios, and to avoid situations where the bucket identifier unecessarily bleeds into the persisted metadata. For the moment, though, it's good enough and it works in ArangoDB, my initial test case.

While this is a somewhat silly, contrived example, it's the kind of mixing and matching that makes "don't sweat the details until later, when the demo is woring" possible.

```typescript
import {
  StorageSystem,
  ArangoStore,
  MemoryStore
} from '@eatonfyi/store';

const adb = new ArangoStore({ // connection details });
const mdb = new MemoryStore({ // config details });

await move('myCollection/1234', adb, mdb);

async function move(id: string, source: StorageSystem, dest: StorageSystem) {
  if (await source.has(id)) {
    return source.fetch(id)
      .then(document => dest.save(document))
      .then(() => true)
  } else {
    return Promise.resolve(false);
  }
}
```

## But why?

I do a lot of noodling around on small projects that grow bigger if the POC is successful. Using this set of interfaces for basic CRUD, lets me achieve maximum interoperability between my own assorted tools without the yak shaving. When I need to stretch beyond simple CRUD, I can use the native query/manipulation tools for a particular storage backend. When things get serious enough that I need to actually optimize, the shims are meant to be lightweight enough that tearing them out and using "real" storage mechanisms isn't too punishing.

## Potential TODOs

- [ ] Query-light system for retrieving all records from a single collection that match a particular criteria. Obviously this way lies madness.
- [ ] Iterator style access for said retrieval functions. This would be useful for low-memory manipulation of large datasets, and might make streaming/piping to other formats simple to bolt on.
- [ ] Serialization helpers to render an incoming object saveable, or reconstitute a just-retrieved object. Right now that's up to each shim's `save()` and `fetch()` methods.
- [ ] Schema definition for collections. This would probably dovetail with the serialization stuff; right now it's assumed schema-ful storage backends are responsible for doing whatever hijinks are necessary to make things work, and it's up to the code retrieving the data to handle validation/etc.
