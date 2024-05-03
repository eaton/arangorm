import anyTest, { TestFn } from 'ava';
import { ArangoStore } from '../src/arango-store.js'
import { getSelector } from "../src/util/get-selector.js";
import { nanoid, alphabets } from '@eatonfyi/ids';

const test = anyTest as TestFn<{
  databaseName: string,
  db: Zarango,
}>;

test.before(async t => {
  t.context.databaseName = 'test-' + nanoid(6, alphabets.Lower);
  t.context.db = await Zarango.getConnection({
    databaseName: t.context.databaseName,
    auth: { username: 'root' }
  });
  return Promise.resolve();
});

test.serial('selectors', t => {
  const idOnly = { _id: 'crud/1' };
  const keyAndCollection = { _collection: 'crud', _key: '2' };
  const collectionOnly = { _collection: 'crud' };

  t.deepEqual(getSelector(idOnly), { _collection: 'crud', _key: '1' });
  t.deepEqual(getSelector(keyAndCollection), { _collection: 'crud', _key: '2' });
  t.deepEqual(getSelector(collectionOnly), { _collection: 'crud' });
});

test.serial('ensure', async t => {
  return t.notThrowsAsync(t.context.db
    .ensure('crud')
    .then(exists => t.assert(exists)))
});

test.serial('push with id', async t => {
  return t.context.db
    .push({ _id: 'crud/123', data: 'text' })
    .then(result => {
      t.is(result._id, 'crud/123');
      t.is(result._key, '123');
    })
});

test.serial('push with collection', async t => {
  return t.context.db
    .push({ _collection: 'crud', data: 'text' })
    .then(result => {
      t.assert(result._id.startsWith('crud/'));
    })
});

test.serial('push with key and collection', async t => {
  return t.context.db
    .push({ _collection: 'crud', _key: '12345', data: 'text' })
    .then(result => t.is(result._id, 'crud/12345'))
});

test.serial('has', async t => {
  return t.notThrowsAsync(t.context.db
    .has('crud/12345')
    .then(exists => t.assert(exists)))
});

test.serial('fetch', async t => {
  return t.notThrowsAsync(t.context.db
    .fetch('crud/12345')
    .then(result => t.is(result.data, 'text')))
});

test.serial('delete', async t => {
  return t.notThrowsAsync(t.context
    .db.delete('crud/12345')
    .then(deleted => t.assert(deleted)))
});

test.serial('count is 2', async t => {
  return t.notThrowsAsync(t.context
    .db.collection('crud').count()
    .then(count => t.is(count.count, 2)))
});

test.after.always(async t => {
  const db = t.context.db.database('_system');
  return db.dropDatabase(t.context.databaseName);
});