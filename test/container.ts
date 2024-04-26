import anyTest, { TestFn } from 'ava';
import { container, DbContext } from '../src/util/get-container.js'
import { Database } from 'arangojs/database';

const test = anyTest as TestFn<DbContext>;

test.before(async t => {
  await container.setup(t.context, { rootPassword: false });
  // This really is terrible but Arango needs time to spin up.
  return new Promise(resolve => setTimeout(resolve, 3000));
});

test('has volumes', async t => {
  return t.context.dbContainer.inspect()
    .then(containerData => {
      t.log(containerData);

      t.truthy(containerData.Image, 'has image');
      t.is(containerData.State.Status, 'running', 'is running');
      t.is(Object.keys(containerData.HostConfig.PortBindings).length, 1, 'has exposed port');
      
      // Need to get bind mounts working before this will do anything.
      // t.is(containerData.HostConfig.Mounts?.length, 1, 'has mounted directories');
  });
})

test.serial('db exists', async t => {
  let db = new Database(t.context.dbConfig);
  await db.createDatabase('test');

  db = db.database('test');
  await db.collection('test').create();
  await db.collection('test').save({ _key: 'foo', data: 'hello!' });
  await db.collection('test').count().then(c => t.is(c.count, 1));
  return Promise.resolve();
});

test.serial('record exists', async t => {
  let db = new Database(t.context.dbConfig).database('test');
  return db.collection('test').document({ _key: 'foo' })
    .then(document => {
      t.is(document._key, 'foo');
      t.is(document.data, 'hello!');    
    });
});

test.after.always(async t => {
  await container.teardown(t.context);
});