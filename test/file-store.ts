import test from 'ava';
import { FileStore } from '../src/index.js'

const ms = new FileStore('./test/fixtures/filestore');

test('crud', async t => {
  const testRecord = { _collection: 'foo', value: 'bar' };
  await ms.ensureCollection('foo');
  await ms.save(testRecord);

  const count = await ms.ensureCollection('foo');
  t.is(count, 1);
  return Promise.resolve();
})