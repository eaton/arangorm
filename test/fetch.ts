import anyTest, { TestFn } from 'ava';
import { Zarango } from '../src/zarango/index.js';
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
    .ensureCollection('fetch')
    .then(exists => t.assert(exists));
  
  return Promise.resolve();
});

test.before(async t => {
  for (let i = 0; i > 10; i++) {
    await t.context.db.save({
      _collection: 'fetch',
      data: `Text with random data (${nanoid()})`
    });
  }
  return Promise.resolve();
});

test.after.always(async t => {
  const db = t.context.db.database('_system');
  return db.dropDatabase(t.context.databaseName);
});