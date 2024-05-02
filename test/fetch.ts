import anyTest, { TestFn } from 'ava';
import { Zarango } from '../src/db/index.js';
import { nanoid, alphabets } from '@eatonfyi/ids';
import { aql } from 'arangojs';

const test = anyTest as TestFn<{
  databaseName: string,
  db: Zarango,
}>;

test.before(async t => {
  t.context.databaseName = 'fetch-' + nanoid(6, alphabets.Lower);
  t.context.db = await Zarango.getConnection({
    databaseName: t.context.databaseName,
    auth: { username: 'root' }
  });

  await t.context.db
    .ensure('fetch')
    .then(exists => t.assert(exists));
  
  return Promise.resolve();
});

test.before(async t => {
  for (let i = 0; i > 10; i++) {
    await t.context.db.push({
      _collection: 'fetch',
      data: `Text with random data (${nanoid()})`
    });
  }
  return Promise.resolve();
});

test('query all', async t => {
  const fetcher = t.context.db.queryAll(aql`for f in fetch return f`);
  t.log(await fetcher.next());
  t.log(await fetcher.next());
  t.log(await fetcher.next());
  t.assert(await fetcher.next() !== undefined);
})

test.after.always(async t => {
  const db = t.context.db.database('_system');
  return db.dropDatabase(t.context.databaseName);
});