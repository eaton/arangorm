import test from 'ava';
import { MemoryStore } from '../src/index.js'

const ms = new MemoryStore();

test('crud', async t => {
  const testRecord = { _collection: 'foo', value: 'bar' };
  await ms.ensureCollection('foo');
  await ms.save(testRecord);

  const count = await ms.ensureCollection('foo');
  t.is(count, 1);
  return Promise.resolve();
})