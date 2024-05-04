import anyTest, { TestFn } from 'ava';
import { ArangoStore, SaveableDocument } from '../src/index.js'
import { nanoid, alphabets } from '@eatonfyi/ids';

const test = anyTest as TestFn<{
  databaseName: string,
  db: ArangoStore,
}>;

test.before(async t => {
  t.context.databaseName = 'test-' + nanoid(6, alphabets.Lower);
  t.context.db = await ArangoStore.getConnection({
    databaseName: t.context.databaseName,
    auth: { username: 'root' }
  });
  return Promise.resolve();
});

test.serial('ensure', async t => {
  return t.notThrowsAsync(t.context.db
    .ensureCollection('crud')
    .then(exists => t.assert(exists)))
});

test.serial('push with id', async t => {
  return t.context.db
    .save({ _id: 'crud/123', data: 'text' })
    .then(result => {
      t.is(result._id, 'crud/123');
      t.is(result._key, '123');
    })
});

test.serial('save with collection', async t => {
  return t.context.db
    .save({ _collection: 'crud', data: 'text' })
    .then(result => {
      t.assert(result._id.startsWith('crud/'));
    })
});

test.serial('save with key and collection', async t => {
  return t.context.db
    .save({ _collection: 'crud', _key: '12345', data: 'text' })
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

test.serial('fetch all', async t => {
  await t.context.db.ensureCollection('fetch');
  const records: SaveableDocument[] = [
    { _collection: 'fetch', text: 'First item', value: 1 },
    { _collection: 'fetch', text: 'Second item', value: 2 },
    { _collection: 'fetch', text: 'Fourth item', value: 3 },
    { _collection: 'fetch', text: 'Fifth item', value: 4 },
    { _collection: 'fetch', text: 'Sixth item', value: 5 },
    { _collection: 'fetch', text: 'Seventh item', value: 6 },
    { _collection: 'fetch', text: 'Eight item', value: 7 },
    { _collection: 'fetch', text: 'Ninth item', value: 8 },
  ];

  const saved = await t.context.db.saveAll(records);
  t.is(saved.length, records.length);

  const fetched = await t.context.db.fetchAll('fetch');
  t.is(fetched.length, saved.length);
})

test.serial('fetch filtered', async t => {
  const fetched = await t.context.db.fetchAll('fetch', { value: { lt: 5 }});
  t.is(fetched.length, 4);
})

test.after.always(async t => {
  const db = t.context.db.database('_system');
  return db.dropDatabase(t.context.databaseName);
});