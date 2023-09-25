import {expect} from 'chai';
import {ObjectId} from 'mongodb';
import {MongoClient} from 'mongodb';
import {format} from '@e22m4u/js-format';
import {Schema} from '@e22m4u/js-repository';
import {DataType} from '@e22m4u/js-repository';
import {createMongodbUrl} from './utils/index.js';
import {MongodbAdapter} from './mongodb-adapter.js';
import {AdapterRegistry} from '@e22m4u/js-repository';
import {DEFAULT_PRIMARY_KEY_PROPERTY_NAME as DEF_PK} from '@e22m4u/js-repository';

const CONFIG = {
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  database: process.env.MONGODB_DATABASE,
};

const MDB_CLIENT = new MongoClient(createMongodbUrl(CONFIG));
const ADAPTERS_STACK = [];

function createSchema() {
  const schema = new Schema();
  const adapter = new MongodbAdapter(schema.container, CONFIG);
  ADAPTERS_STACK.push(adapter);
  schema.defineDatasource({name: 'mongodb', adapter: 'mongodb'});
  schema.getService(AdapterRegistry)._adapters['mongodb'] = adapter;
  return schema;
}

describe('MongodbAdapter', function () {
  this.timeout(15000);

  afterEach(async function () {
    await MDB_CLIENT.db(CONFIG.database).dropDatabase();
  });

  after(async function () {
    for await (const adapter of ADAPTERS_STACK) {
      await adapter.client.close(true);
    }
    await MDB_CLIENT.close(true);
  });

  describe('_buildProjection', function () {
    describe('single field', function () {
      it('returns undefined if the second argument is undefined', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', undefined);
        expect(res).to.be.undefined;
      });

      it('returns undefined if the second argument is null', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', null);
        expect(res).to.be.undefined;
      });

      it('requires the second argument to be a non-empty string', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const throwable = v => () => A._buildProjection('model', v);
        const error = v =>
          format(
            'The provided option "fields" should be a non-empty String ' +
              'or an Array of non-empty String, but %s given.',
            v,
          );
        expect(throwable('')).to.throw(error('""'));
        expect(throwable(10)).to.throw(error('10'));
        expect(throwable(0)).to.throw(error('0'));
        expect(throwable(true)).to.throw(error('true'));
        expect(throwable(false)).to.throw(error('false'));
        expect(throwable({})).to.throw(error('Object'));
        expect(throwable('bar')()).to.be.eql({_id: 1, bar: 1});
        expect(throwable(undefined)()).to.be.undefined;
        expect(throwable(null)()).to.be.undefined;
      });

      it('converts the given property name to the column name', async function () {
        const schema = createSchema();
        schema.defineModel({
          name: 'model',
          datasource: 'mongodb',
          properties: {
            foo: {
              type: DataType.STRING,
              columnName: 'bar',
            },
          },
        });
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', 'foo');
        expect(res).to.be.eql({_id: 1, bar: 1});
      });

      it('includes "_id" field to the projection', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', 'foo');
        expect(res).to.be.eql({_id: 1, foo: 1});
      });

      it('includes "_id" as a column name of the given property', async function () {
        const schema = createSchema();
        schema.defineModel({
          name: 'model',
          datasource: 'mongodb',
          properties: {
            foo: {
              type: DataType.STRING,
              primaryKey: true,
              columnName: '_id',
            },
          },
        });
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', 'foo');
        expect(res).to.be.eql({_id: 1});
      });
    });

    describe('multiple fields', function () {
      it('returns undefined if the second argument is an empty array', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', []);
        expect(res).to.be.undefined;
      });

      it('requires the second argument to be an array of non-empty strings', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const throwable = v => () => A._buildProjection('model', v);
        const error = v =>
          format(
            'The provided option "fields" should be a non-empty String ' +
              'or an Array of non-empty String, but %s given.',
            v,
          );
        expect(throwable([''])).to.throw(error('""'));
        expect(throwable([10])).to.throw(error('10'));
        expect(throwable([0])).to.throw(error('0'));
        expect(throwable([true])).to.throw(error('true'));
        expect(throwable([false])).to.throw(error('false'));
        expect(throwable([{}])).to.throw(error('Object'));
        expect(throwable([undefined])).to.throw(error('undefined'));
        expect(throwable([null])).to.throw(error('null'));
        expect(throwable([])()).to.be.undefined;
        expect(throwable(['bar'])()).to.be.eql({_id: 1, bar: 1});
      });

      it('converts the given property names to column names', async function () {
        const schema = createSchema();
        schema.defineModel({
          name: 'model',
          datasource: 'mongodb',
          properties: {
            foo: {
              type: DataType.STRING,
              columnName: 'bar',
            },
            baz: {
              type: DataType.STRING,
              columnName: 'qux',
            },
          },
        });
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', ['foo', 'baz']);
        expect(res).to.be.eql({_id: 1, bar: 1, qux: 1});
      });

      it('includes "_id" field to the projection', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', ['foo', 'bar']);
        expect(res).to.be.eql({_id: 1, foo: 1, bar: 1});
      });

      it('includes "_id" as a column name of the given property', async function () {
        const schema = createSchema();
        schema.defineModel({
          name: 'model',
          datasource: 'mongodb',
          properties: {
            foo: {
              type: DataType.STRING,
              primaryKey: true,
              columnName: '_id',
            },
          },
        });
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildProjection('model', ['foo', 'bar']);
        expect(res).to.be.eql({_id: 1, bar: 1});
      });
    });
  });

  describe('_buildSort', function () {
    describe('single field', function () {
      it('returns undefined if the second argument is undefined', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildSort('model', undefined);
        expect(res).to.be.undefined;
      });

      it('returns undefined if the second argument is null', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildSort('model', null);
        expect(res).to.be.undefined;
      });

      it('requires the second argument to be a non-empty string', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const throwable = v => () => A._buildSort('model', v);
        const error = v =>
          format(
            'The provided option "order" should be a non-empty String ' +
              'or an Array of non-empty String, but %s given.',
            v,
          );
        expect(throwable('')).to.throw(error('""'));
        expect(throwable(10)).to.throw(error('10'));
        expect(throwable(0)).to.throw(error('0'));
        expect(throwable(true)).to.throw(error('true'));
        expect(throwable(false)).to.throw(error('false'));
        expect(throwable({})).to.throw(error('Object'));
        expect(throwable('bar')()).to.be.eql({bar: 1});
        expect(throwable(undefined)()).to.be.undefined;
        expect(throwable(null)()).to.be.undefined;
      });

      it('recognizes direction by the given direction flag', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res1 = A._buildSort('model', 'foo');
        const res2 = A._buildSort('model', 'foo DESC');
        const res3 = A._buildSort('model', 'foo ASC');
        expect(res1).to.be.eql({foo: 1});
        expect(res2).to.be.eql({foo: -1});
        expect(res3).to.be.eql({foo: 1});
      });

      it('converts the given property name to the column name', async function () {
        const schema = createSchema();
        schema.defineModel({
          name: 'model',
          datasource: 'mongodb',
          properties: {
            foo: {
              type: DataType.STRING,
              columnName: 'bar',
            },
          },
        });
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res1 = A._buildSort('model', 'foo');
        const res2 = A._buildSort('model', 'foo DESC');
        const res3 = A._buildSort('model', 'foo ASC');
        expect(res1).to.be.eql({bar: 1});
        expect(res2).to.be.eql({bar: -1});
        expect(res3).to.be.eql({bar: 1});
      });
    });

    describe('multiple fields', function () {
      it('returns undefined if the second argument is an empty array', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res = A._buildSort('model', []);
        expect(res).to.be.undefined;
      });

      it('requires the second argument to be an array of non-empty strings', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const throwable = v => () => A._buildSort('model', v);
        const error = v =>
          format(
            'The provided option "order" should be a non-empty String ' +
              'or an Array of non-empty String, but %s given.',
            v,
          );
        expect(throwable([''])).to.throw(error('""'));
        expect(throwable([10])).to.throw(error('10'));
        expect(throwable([0])).to.throw(error('0'));
        expect(throwable([true])).to.throw(error('true'));
        expect(throwable([false])).to.throw(error('false'));
        expect(throwable([{}])).to.throw(error('Object'));
        expect(throwable([undefined])).to.throw(error('undefined'));
        expect(throwable([null])).to.throw(error('null'));
        expect(throwable([])()).to.be.undefined;
        expect(throwable(['bar', 'baz'])()).to.be.eql({bar: 1, baz: 1});
      });

      it('recognizes direction by the given direction flag', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res1 = A._buildSort('model', ['foo', 'bar']);
        const res2 = A._buildSort('model', ['foo DESC', 'bar ASC']);
        const res3 = A._buildSort('model', ['foo ASC', 'bar DESC']);
        expect(res1).to.be.eql({foo: 1, bar: 1});
        expect(res2).to.be.eql({foo: -1, bar: 1});
        expect(res3).to.be.eql({foo: 1, bar: -1});
      });

      it('converts the given property names to column names', async function () {
        const schema = createSchema();
        schema.defineModel({
          name: 'model',
          datasource: 'mongodb',
          properties: {
            foo: {
              type: DataType.STRING,
              columnName: 'bar',
            },
            baz: {
              type: DataType.STRING,
              columnName: 'qux',
            },
          },
        });
        const A = await schema
          .getService(AdapterRegistry)
          .getAdapter('mongodb');
        const res1 = A._buildSort('model', ['foo', 'baz']);
        const res2 = A._buildSort('model', ['foo DESC', 'baz ASC']);
        const res3 = A._buildSort('model', ['foo ASC', 'baz DESC']);
        expect(res1).to.be.eql({bar: 1, qux: 1});
        expect(res2).to.be.eql({bar: -1, qux: 1});
        expect(res3).to.be.eql({bar: 1, qux: -1});
      });
    });
  });

  describe('create', function () {
    it('generates a new identifier when a value of a primary key is not provided', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: 'bar'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 'bar'});
      expect(typeof result[DEF_PK]).to.be.eq('string');
      expect(result[DEF_PK]).to.have.lengthOf(24);
    });

    it('generates a new identifier when a value of a primary key is undefined', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({[DEF_PK]: undefined, foo: 'bar'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 'bar'});
      expect(typeof result[DEF_PK]).to.be.eq('string');
      expect(result[DEF_PK]).to.have.lengthOf(24);
    });

    it('generates a new identifier when a value of a primary key is null', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({[DEF_PK]: null, foo: 'bar'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 'bar'});
      expect(typeof result[DEF_PK]).to.be.eq('string');
      expect(result[DEF_PK]).to.have.lengthOf(24);
    });

    it('generates a new identifier for a primary key of a "string" type', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.STRING,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const result = await rep.create({[DEF_PK]: null, foo: 'bar'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 'bar'});
      expect(typeof result[DEF_PK]).to.be.eq('string');
      expect(result[DEF_PK]).to.have.lengthOf(24);
    });

    it('generates a new identifier for a primary key of a "any" type', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.ANY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const result = await rep.create({[DEF_PK]: null, foo: 'bar'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 'bar'});
      expect(typeof result[DEF_PK]).to.be.eq('string');
      expect(result[DEF_PK]).to.have.lengthOf(24);
    });

    it('throws an error when generating a new value for a primary key of a "number" type', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.NUMBER,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const promise = rep.create({});
      expect(promise).to.be.rejectedWith(
        'MongoDB unable to generate primary keys of Number. ' +
          'Do provide your own value for the "id" property ' +
          'or set the property type to String.',
      );
    });

    it('throws an error when generating a new value for a primary key of a "boolean" type', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.BOOLEAN,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const promise = rep.create({});
      expect(promise).to.be.rejectedWith(
        'MongoDB unable to generate primary keys of Boolean. ' +
          'Do provide your own value for the "id" property ' +
          'or set the property type to String.',
      );
    });

    it('throws an error when generating a new value for a primary key of a "array" type', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.ARRAY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const promise = rep.create({});
      expect(promise).to.be.rejectedWith(
        'MongoDB unable to generate primary keys of Array. ' +
          'Do provide your own value for the "id" property ' +
          'or set the property type to String.',
      );
    });

    it('throws an error when generating a new value for a primary key of a "object" type', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.OBJECT,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const promise = rep.create({});
      expect(promise).to.be.rejectedWith(
        'MongoDB unable to generate primary keys of Object. ' +
          'Do provide your own value for the "id" property ' +
          'or set the property type to String.',
      );
    });

    it('allows to specify an ObjectID instance for a default primary key', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const result = await rep.create({[DEF_PK]: oid});
      expect(result).to.be.eql({[DEF_PK]: String(oid)});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.not.null;
    });

    it('allows to specify an ObjectID string for a default primary key', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const id = String(oid);
      const result = await rep.create({[DEF_PK]: id});
      expect(result).to.be.eql({[DEF_PK]: id});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.not.null;
    });

    it('allows to specify an ObjectID instance for "id" primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.ANY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const result = await rep.create({id: oid});
      expect(result).to.be.eql({id: String(oid)});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.not.null;
    });

    it('allows to specify an ObjectID string for "id" primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          id: {
            type: DataType.STRING,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const id = String(oid);
      const result = await rep.create({id});
      expect(result).to.be.eql({id});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.not.null;
    });

    it('allows to specify an ObjectID instance for "_id" primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          _id: {
            type: DataType.ANY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const result = await rep.create({_id: oid});
      expect(result).to.be.eql({_id: String(oid)});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.not.null;
    });

    it('allows to specify an ObjectID string for "_id" primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          _id: {
            type: DataType.STRING,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const id = String(oid);
      const result = await rep.create({_id: id});
      expect(result).to.be.eql({_id: id});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.not.null;
    });

    it('throws an error for a custom primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          myId: {
            type: DataType.ANY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const promise = rep.create({myId: oid});
      await expect(promise).to.be.rejectedWith(
        'MongoDB is not supporting custom names of the primary key. ' +
          'Do use "id" as a primary key instead of "myId".',
      );
    });

    it('throws an error if a given "number" identifier already exists', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({[DEF_PK]: 10});
      const promise = rep.create({[DEF_PK]: 10});
      await expect(promise).to.be.rejectedWith(
        'E11000 duplicate key error collection: test.model index: ' +
          '_id_ dup key: { _id: 10 }',
      );
    });

    it('throws an error if a given "string" identifier already exists', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({[DEF_PK]: 'str'});
      const promise = rep.create({[DEF_PK]: 'str'});
      await expect(promise).to.be.rejectedWith(
        'E11000 duplicate key error collection: test.model index: ' +
          '_id_ dup key: { _id: "str" }',
      );
    });

    it('throws an error if a given ObjectId instance identifier already exists', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      await rep.create({[DEF_PK]: oid});
      const promise = rep.create({[DEF_PK]: oid});
      await expect(promise).to.be.rejectedWith(
        format(
          'E11000 duplicate key error collection: test.model index: ' +
            "_id_ dup key: { _id: ObjectId('%s') }",
          oid,
        ),
      );
    });

    it('throws an error if a given ObjectId string identifier already exists', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const id = String(oid);
      await rep.create({[DEF_PK]: id});
      const promise = rep.create({[DEF_PK]: id});
      await expect(promise).to.be.rejectedWith(
        format(
          'E11000 duplicate key error collection: test.model index: ' +
            "_id_ dup key: { _id: ObjectId('%s') }",
          id,
        ),
      );
    });

    it('uses a specified column name for a regular property', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'bar',
          },
        },
      });
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: 10});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 10});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, bar: 10});
    });

    it('uses a specified column name for a regular property with a default value', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'bar',
            default: 10,
          },
        },
      });
      const rep = schema.getRepository('model');
      const result = await rep.create({});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 10});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, bar: 10});
    });

    it('stores a Date instance as date and returns string type', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const date = new Date();
      const dateString = date.toISOString();
      const result = await rep.create({date});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], date: dateString});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, date});
    });

    it('stores a Date string as date and returns string type', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const date = new Date();
      const dateString = date.toISOString();
      const result = await rep.create({date: dateString});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], date: dateString});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, date});
    });

    it('stores a string as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: 'str'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 'str'});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 'str'});
    });

    it('stores a number as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: 10});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 10});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10});
    });

    it('stores a boolean as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: true, bar: false});
      expect(result).to.be.eql({
        [DEF_PK]: result[DEF_PK],
        foo: true,
        bar: false,
      });
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: true, bar: false});
    });

    it('stores an array as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: ['bar']});
      expect(result).to.be.eql({
        [DEF_PK]: result[DEF_PK],
        foo: ['bar'],
      });
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: ['bar']});
    });

    it('stores an object as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: {bar: 10}});
      expect(result).to.be.eql({
        [DEF_PK]: result[DEF_PK],
        foo: {bar: 10},
      });
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: {bar: 10}});
    });

    it('stores an undefined as null', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: undefined});
      expect(result).to.be.eql({
        [DEF_PK]: result[DEF_PK],
        foo: null,
      });
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: null});
    });

    it('stores an null as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: null});
      expect(result).to.be.eql({
        [DEF_PK]: result[DEF_PK],
        foo: null,
      });
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: null});
    });

    it('uses a short fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create({foo: 10, bar: 20}, {fields: 'foo'});
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 10});
    });

    it('uses a full fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.create(
        {foo: 10, bar: 20, baz: 30},
        {fields: ['foo', 'bar']},
      );
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK], foo: 10, bar: 20});
      const oid = new ObjectId(result[DEF_PK]);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10, bar: 20, baz: 30});
    });

    it('a fields clause uses property names instead of column names', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'fooCol',
          },
          bar: {
            type: DataType.NUMBER,
            columnName: 'barCol',
          },
          baz: {
            type: DataType.NUMBER,
            columnName: 'bazCol',
          },
        },
      });
      const rep = schema.getRepository('model');
      const result = await rep.create(
        {foo: 10, bar: 20, baz: 30},
        {fields: ['fooCol', 'barCol']},
      );
      expect(result).to.be.eql({[DEF_PK]: result[DEF_PK]});
    });
  });

  describe('replaceById', function () {
    it('removes properties when replacing an item by a given identifier', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {bar: 20});
      expect(replaced).to.be.eql({[DEF_PK]: id, bar: 20});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, bar: 20});
    });

    it('ignores identifier value in a given data in case of a default primary key', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({[DEF_PK]: 'foo', prop: 10});
      const replaced = await rep.replaceById('foo', {
        [DEF_PK]: 'bar',
        prop: 20,
      });
      expect(replaced).to.be.eql({[DEF_PK]: 'foo', prop: 20});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: 'foo'});
      expect(rawData).to.be.eql({_id: 'foo', prop: 20});
    });

    it('ignores identifier value in a given data in case of a custom primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          myId: {
            type: DataType.STRING,
            primaryKey: true,
            columnName: '_id',
          },
        },
      });
      const rep = schema.getRepository('model');
      await rep.create({myId: 'foo', prop: 10});
      const replaced = await rep.replaceById('foo', {myId: 'bar', prop: 20});
      expect(replaced).to.be.eql({myId: 'foo', prop: 20});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: 'foo'});
      expect(rawData).to.be.eql({_id: 'foo', prop: 20});
    });

    it('throws an error if a given identifier does not exist', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const promise = rep.replaceById(oid, {foo: 10});
      await expect(promise).to.be.rejectedWith(
        format('Identifier "%s" is not found.', oid),
      );
    });

    it('throws an error for a custom primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          myId: {
            type: DataType.ANY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const promise = rep.replaceById('id', {foo: 10});
      await expect(promise).to.be.rejectedWith(
        'MongoDB is not supporting custom names of the primary key. ' +
          'Do use "id" as a primary key instead of "myId".',
      );
    });

    it('uses a specified column name for a regular property', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'bar',
          },
        },
      });
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: 20});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: 20});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, bar: 20});
    });

    it('stores a Date instance as date and returns string type', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const date = new Date();
      const dateString = date.toISOString();
      const created = await rep.create({date: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {date});
      expect(replaced).to.be.eql({[DEF_PK]: id, date: dateString});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, date});
    });

    it('stores a Date string as date and returns string type', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const date = new Date();
      const dateString = date.toISOString();
      const created = await rep.create({date: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {date: dateString});
      expect(replaced).to.be.eql({[DEF_PK]: id, date: dateString});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, date});
    });

    it('stores a string as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: 'str'});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: 'str'});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 'str'});
    });

    it('stores a number as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: 10});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: 10});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10});
    });

    it('stores a boolean as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null, bar: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: true, bar: false});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: true, bar: false});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: true, bar: false});
    });

    it('stores an array as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: ['bar']});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: ['bar']});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: ['bar']});
    });

    it('stores an object as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: {bar: 10}});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: {bar: 10}});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: {bar: 10}});
    });

    it('stores an undefined as null', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: undefined});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: null});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: null});
    });

    it('stores an null as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: null});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: null});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: null});
    });

    it('uses a short fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10, bar: 20});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(
        id,
        {foo: 15, bar: 25},
        {fields: 'foo'},
      );
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: 15});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 15, bar: 25});
    });

    it('uses a full fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10, bar: 20, baz: 30});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(
        id,
        {foo: 15, bar: 25, baz: 35},
        {fields: ['foo', 'bar']},
      );
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: 15, bar: 25});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 15, bar: 25, baz: 35});
    });

    it('a fields clause uses property names instead of column names', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'fooCol',
          },
          bar: {
            type: DataType.NUMBER,
            columnName: 'barCol',
          },
          baz: {
            type: DataType.NUMBER,
            columnName: 'bazCol',
          },
        },
      });
      const rep = schema.getRepository('model');
      const created = await rep.create(
        {foo: 10, bar: 20, baz: 30},
        {fields: ['fooCol', 'barCol']},
      );
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(
        id,
        {foo: 15, bar: 25, baz: 35},
        {fields: ['fooCol', 'barCol']},
      );
      expect(replaced).to.be.eql({[DEF_PK]: replaced[DEF_PK]});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, fooCol: 15, barCol: 25, bazCol: 35});
    });

    it('does not throws an error if nothing changed', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const replaced = await rep.replaceById(id, {foo: 10});
      expect(replaced).to.be.eql({[DEF_PK]: id, foo: 10});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10});
    });
  });

  describe('patchById', function () {
    it('updates only provided properties by a given identifier', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {bar: 20});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 10, bar: 20});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10, bar: 20});
    });

    it('does not throw an error if a partial data does not have required property', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            required: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const {insertedId: oid} = await MDB_CLIENT.db()
        .collection('model')
        .insertOne({bar: 10});
      const patched = await rep.patchById(oid, {baz: 20});
      const id = String(oid);
      expect(patched).to.be.eql({[DEF_PK]: id, bar: 10, baz: 20});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, bar: 10, baz: 20});
    });

    it('ignores identifier value in a given data in case of a default primary key', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({[DEF_PK]: 'foo', prop: 10});
      const patched = await rep.patchById('foo', {
        [DEF_PK]: 'bar',
        prop: 20,
      });
      expect(patched).to.be.eql({[DEF_PK]: 'foo', prop: 20});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: 'foo'});
      expect(rawData).to.be.eql({_id: 'foo', prop: 20});
    });

    it('ignores identifier value in a given data in case of a custom primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          myId: {
            type: DataType.STRING,
            primaryKey: true,
            columnName: '_id',
          },
        },
      });
      const rep = schema.getRepository('model');
      await rep.create({myId: 'foo', prop: 10});
      const patched = await rep.patchById('foo', {myId: 'bar', prop: 20});
      expect(patched).to.be.eql({myId: 'foo', prop: 20});
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: 'foo'});
      expect(rawData).to.be.eql({_id: 'foo', prop: 20});
    });

    it('throws an error if a given identifier does not exist', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const promise = rep.patchById(oid, {foo: 10});
      await expect(promise).to.be.rejectedWith(
        format('Identifier "%s" is not found.', oid),
      );
    });

    it('throws an error for a custom primary key', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          myId: {
            type: DataType.ANY,
            primaryKey: true,
          },
        },
      });
      const rep = schema.getRepository('model');
      const promise = rep.patchById('id', {foo: 10});
      await expect(promise).to.be.rejectedWith(
        'MongoDB is not supporting custom names of the primary key. ' +
          'Do use "id" as a primary key instead of "myId".',
      );
    });

    it('uses a specified column name for a regular property', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'bar',
          },
        },
      });
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const patched = await rep.replaceById(id, {foo: 20});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 20});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, bar: 20});
    });

    it('stores a Date instance as date and returns string type', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const date = new Date();
      const dateString = date.toISOString();
      const created = await rep.create({date: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {date});
      expect(patched).to.be.eql({[DEF_PK]: id, date: dateString});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, date});
    });

    it('stores a Date string as date and returns string type', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const date = new Date();
      const dateString = date.toISOString();
      const created = await rep.create({date: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {date: dateString});
      expect(patched).to.be.eql({[DEF_PK]: id, date: dateString});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, date});
    });

    it('stores a string as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: 'str'});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 'str'});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 'str'});
    });

    it('stores a number as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: 10});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 10});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10});
    });

    it('stores a boolean as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null, bar: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: true, bar: false});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: true, bar: false});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: true, bar: false});
    });

    it('stores an array as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: ['bar']});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: ['bar']});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: ['bar']});
    });

    it('stores an object as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: null});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: {bar: 10}});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: {bar: 10}});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: {bar: 10}});
    });

    it('stores an undefined as null', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: undefined});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: null});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: null});
    });

    it('stores an null as is', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: null});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: null});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: null});
    });

    it('uses a short fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10, bar: 20});
      const id = created[DEF_PK];
      const patched = await rep.patchById(
        id,
        {foo: 15, bar: 25},
        {fields: 'foo'},
      );
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 15});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 15, bar: 25});
    });

    it('uses a full fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10, bar: 20, baz: 30});
      const id = created[DEF_PK];
      const patched = await rep.patchById(
        id,
        {foo: 15, bar: 25, baz: 35},
        {fields: ['foo', 'bar']},
      );
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 15, bar: 25});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 15, bar: 25, baz: 35});
    });

    it('a fields clause uses property names instead of column names', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'fooCol',
          },
          bar: {
            type: DataType.NUMBER,
            columnName: 'barCol',
          },
          baz: {
            type: DataType.NUMBER,
            columnName: 'bazCol',
          },
        },
      });
      const rep = schema.getRepository('model');
      const created = await rep.create(
        {foo: 10, bar: 20, baz: 30},
        {fields: ['fooCol', 'barCol']},
      );
      const id = created[DEF_PK];
      const patched = await rep.patchById(
        id,
        {foo: 15, bar: 25, baz: 35},
        {fields: ['fooCol', 'barCol']},
      );
      expect(patched).to.be.eql({[DEF_PK]: patched[DEF_PK]});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, fooCol: 15, barCol: 25, bazCol: 35});
    });

    it('does not throws an error if nothing changed', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10});
      const id = created[DEF_PK];
      const patched = await rep.patchById(id, {foo: 10});
      expect(patched).to.be.eql({[DEF_PK]: id, foo: 10});
      const oid = new ObjectId(id);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .findOne({_id: oid});
      expect(rawData).to.be.eql({_id: oid, foo: 10});
    });
  });

  describe('find', function () {
    it('returns an empty array', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.find();
      expect(result).to.be.empty;
      expect(result).to.be.instanceOf(Array);
    });

    it('returns all items', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const doc1 = await rep.create({foo: 1});
      const doc2 = await rep.create({bar: 2});
      const doc3 = await rep.create({baz: 3});
      const result = await rep.find();
      expect(result).to.be.eql([doc1, doc2, doc3]);
    });

    it('uses a short fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 10, bar: 20});
      const created2 = await rep.create({foo: 20, bar: 30});
      const id1 = created1[DEF_PK];
      const id2 = created2[DEF_PK];
      const result = await rep.find({fields: 'foo'});
      expect(result).to.be.eql([
        {[DEF_PK]: id1, foo: 10},
        {[DEF_PK]: id2, foo: 20},
      ]);
    });

    it('uses a full fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 10, bar: 20, baz: 30});
      const created2 = await rep.create({foo: 20, bar: 30, baz: 40});
      const id1 = created1[DEF_PK];
      const id2 = created2[DEF_PK];
      const result = await rep.find({fields: ['foo', 'bar']});
      expect(result).to.be.eql([
        {[DEF_PK]: id1, foo: 10, bar: 20},
        {[DEF_PK]: id2, foo: 20, bar: 30},
      ]);
    });

    it('a fields clause uses property names instead of column names', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'fooCol',
          },
          bar: {
            type: DataType.NUMBER,
            columnName: 'barCol',
          },
          baz: {
            type: DataType.NUMBER,
            columnName: 'bazCol',
          },
        },
      });
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 10, bar: 20, baz: 30});
      const created2 = await rep.create({foo: 20, bar: 30, baz: 40});
      const id1 = created1[DEF_PK];
      const id2 = created2[DEF_PK];
      const result = await rep.find({fields: ['fooCol', 'barCol']});
      expect(result).to.be.eql([{[DEF_PK]: id1}, {[DEF_PK]: id2}]);
    });

    it('uses a short order clause to sort results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 20});
      const created2 = await rep.create({foo: 5});
      const created3 = await rep.create({foo: 10});
      const result1 = await rep.find({order: 'foo'});
      const result2 = await rep.find({order: 'foo ASC'});
      const result3 = await rep.find({order: 'foo DESC'});
      expect(result1).to.be.eql([
        {[DEF_PK]: created2[DEF_PK], foo: 5},
        {[DEF_PK]: created3[DEF_PK], foo: 10},
        {[DEF_PK]: created1[DEF_PK], foo: 20},
      ]);
      expect(result2).to.be.eql([
        {[DEF_PK]: created2[DEF_PK], foo: 5},
        {[DEF_PK]: created3[DEF_PK], foo: 10},
        {[DEF_PK]: created1[DEF_PK], foo: 20},
      ]);
      expect(result3).to.be.eql([
        {[DEF_PK]: created1[DEF_PK], foo: 20},
        {[DEF_PK]: created3[DEF_PK], foo: 10},
        {[DEF_PK]: created2[DEF_PK], foo: 5},
      ]);
    });

    it('uses a full order clause to sort results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 20, bar: 'b'});
      const created2 = await rep.create({foo: 5, bar: 'b'});
      const created3 = await rep.create({foo: 10, bar: 'a'});
      const result1 = await rep.find({order: ['bar DESC', 'foo']});
      const result2 = await rep.find({order: ['bar', 'foo ASC']});
      expect(result1).to.be.eql([
        {[DEF_PK]: created2[DEF_PK], foo: 5, bar: 'b'},
        {[DEF_PK]: created1[DEF_PK], foo: 20, bar: 'b'},
        {[DEF_PK]: created3[DEF_PK], foo: 10, bar: 'a'},
      ]);
      expect(result2).to.be.eql([
        {[DEF_PK]: created3[DEF_PK], foo: 10, bar: 'a'},
        {[DEF_PK]: created2[DEF_PK], foo: 5, bar: 'b'},
        {[DEF_PK]: created1[DEF_PK], foo: 20, bar: 'b'},
      ]);
    });

    it('an order clause uses property names instead of column names', async function () {
      const schema = createSchema();
      schema.defineModel({
        name: 'model',
        datasource: 'mongodb',
        properties: {
          foo: {
            type: DataType.NUMBER,
            columnName: 'fooCol',
          },
          bar: {
            type: DataType.STRING,
            columnName: 'barCol',
          },
        },
      });
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 20, bar: 'b'});
      const created2 = await rep.create({foo: 5, bar: 'b'});
      const created3 = await rep.create({foo: 10, bar: 'a'});
      const result1 = await rep.find({order: ['bar DESC', 'foo']});
      const result2 = await rep.find({order: ['bar', 'foo ASC']});
      expect(result1).to.be.eql([
        {[DEF_PK]: created2[DEF_PK], foo: 5, bar: 'b'},
        {[DEF_PK]: created1[DEF_PK], foo: 20, bar: 'b'},
        {[DEF_PK]: created3[DEF_PK], foo: 10, bar: 'a'},
      ]);
      expect(result2).to.be.eql([
        {[DEF_PK]: created3[DEF_PK], foo: 10, bar: 'a'},
        {[DEF_PK]: created2[DEF_PK], foo: 5, bar: 'b'},
        {[DEF_PK]: created1[DEF_PK], foo: 20, bar: 'b'},
      ]);
    });

    it('uses a limit clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created1 = await rep.create({foo: 10});
      const created2 = await rep.create({foo: 20});
      await rep.create({foo: 30});
      const result = await rep.find({limit: 2});
      expect(result).to.be.eql([created1, created2]);
    });

    it('uses a skip clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({foo: 10});
      const created2 = await rep.create({foo: 20});
      const created3 = await rep.create({foo: 30});
      const result = await rep.find({skip: 1});
      expect(result).to.be.eql([created2, created3]);
    });

    describe('uses a where clause to filter results', function () {
      it('matches by a document subset', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5, bar: 'b'});
        const created2 = await rep.create({foo: 10, bar: 'a'});
        const result1 = await rep.find({where: {foo: 10}});
        const result2 = await rep.find({where: {foo: 5, bar: 'b'}});
        expect(result1).to.be.eql([
          {
            [DEF_PK]: created2[DEF_PK],
            foo: 10,
            bar: 'a',
          },
        ]);
        expect(result2).to.be.eql([
          {
            [DEF_PK]: created1[DEF_PK],
            foo: 5,
            bar: 'b',
          },
        ]);
      });

      it('matches by the "eq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        const created3 = await rep.create({foo: 10});
        const result = await rep.find({where: {foo: {eq: 10}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 10},
          {[DEF_PK]: created3[DEF_PK], foo: 10},
        ]);
      });

      it('matches by the "neq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 10});
        const result = await rep.find({where: {foo: {neq: 10}}});
        expect(result).to.be.eql([{[DEF_PK]: created1[DEF_PK], foo: 5}]);
      });

      it('matches by the "gt" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        const result = await rep.find({where: {foo: {gt: 10}}});
        expect(result).to.be.eql([{[DEF_PK]: created3[DEF_PK], foo: 15}]);
      });

      it('matches by the "lt" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.find({where: {foo: {lt: 10}}});
        expect(result).to.be.eql([{[DEF_PK]: created1[DEF_PK], foo: 5}]);
      });

      it('matches by the "gte" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        const result = await rep.find({where: {foo: {gte: 10}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 10},
          {[DEF_PK]: created3[DEF_PK], foo: 15},
        ]);
      });

      it('matches by the "lte" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.find({where: {foo: {lte: 10}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created1[DEF_PK], foo: 5},
          {[DEF_PK]: created2[DEF_PK], foo: 10},
        ]);
      });

      it('matches by the "inq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.find({where: {foo: {inq: [5, 10]}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created1[DEF_PK], foo: 5},
          {[DEF_PK]: created2[DEF_PK], foo: 10},
        ]);
      });

      it('matches by the "nin" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        const result = await rep.find({where: {foo: {nin: [5, 10]}}});
        expect(result).to.be.eql([{[DEF_PK]: created3[DEF_PK], foo: 15}]);
      });

      it('matches by the "between" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        await rep.create({foo: 20});
        const result = await rep.find({where: {foo: {between: [9, 16]}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 10},
          {[DEF_PK]: created3[DEF_PK], foo: 15},
        ]);
      });

      it('matches by the "exists" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({});
        const created2 = await rep.create({foo: undefined});
        const created3 = await rep.create({foo: null});
        const created4 = await rep.create({foo: 10});
        const result1 = await rep.find({where: {foo: {exists: true}}});
        const result2 = await rep.find({where: {foo: {exists: false}}});
        expect(result1).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: null},
          {[DEF_PK]: created3[DEF_PK], foo: null},
          {[DEF_PK]: created4[DEF_PK], foo: 10},
        ]);
        expect(result2).to.be.eql([{[DEF_PK]: created1[DEF_PK]}]);
      });

      it('matches by the "like" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        const created2 = await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        const created4 = await rep.create({foo: 'sit amet'});
        const result = await rep.find({where: {foo: {like: 'sit amet'}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 'dolor sit amet'},
          {[DEF_PK]: created4[DEF_PK], foo: 'sit amet'},
        ]);
      });

      it('matches by the "ilike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        const created2 = await rep.create({foo: 'dolor sit amet'});
        const created3 = await rep.create({foo: 'DOLOR SIT AMET'});
        const created4 = await rep.create({foo: 'sit amet'});
        const result = await rep.find({where: {foo: {ilike: 'sit amet'}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 'dolor sit amet'},
          {[DEF_PK]: created3[DEF_PK], foo: 'DOLOR SIT AMET'},
          {[DEF_PK]: created4[DEF_PK], foo: 'sit amet'},
        ]);
      });

      it('matches by the "nlike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        const created3 = await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.find({where: {foo: {nlike: 'sit amet'}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created1[DEF_PK], foo: 'lorem ipsum'},
          {[DEF_PK]: created3[DEF_PK], foo: 'DOLOR SIT AMET'},
        ]);
      });

      it('matches by the "nilike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.find({where: {foo: {nilike: 'sit amet'}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created1[DEF_PK], foo: 'lorem ipsum'},
        ]);
      });

      it('matches by the "regexp" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        const created2 = await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        const created4 = await rep.create({foo: 'sit amet'});
        const result = await rep.find({where: {foo: {regexp: 'sit am+'}}});
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 'dolor sit amet'},
          {[DEF_PK]: created4[DEF_PK], foo: 'sit amet'},
        ]);
      });

      it('matches by the "regexp" operator with flags', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        const created2 = await rep.create({foo: 'dolor sit amet'});
        const created3 = await rep.create({foo: 'DOLOR SIT AMET'});
        const created4 = await rep.create({foo: 'sit amet'});
        const result = await rep.find({
          where: {
            foo: {regexp: 'sit am+', flags: 'i'},
          },
        });
        expect(result).to.be.eql([
          {[DEF_PK]: created2[DEF_PK], foo: 'dolor sit amet'},
          {[DEF_PK]: created3[DEF_PK], foo: 'DOLOR SIT AMET'},
          {[DEF_PK]: created4[DEF_PK], foo: 'sit amet'},
        ]);
      });
    });
  });

  describe('findById', function () {
    it('throws an error if a given identifier does not exist', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const promise = rep.findById(oid);
      await expect(promise).to.be.rejectedWith(
        format('Identifier "%s" is not found.', oid),
      );
    });

    it('uses a short fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10, bar: 20});
      const id = created[DEF_PK];
      const result = await rep.findById(id, {fields: 'foo'});
      expect(result).to.be.eql({[DEF_PK]: id, foo: 10});
    });

    it('uses a full fields clause to filter results', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const created = await rep.create({foo: 10, bar: 20, baz: 30});
      const id = created[DEF_PK];
      const result = await rep.findById(id, {fields: ['foo', 'bar']});
      expect(result).to.be.eql({[DEF_PK]: id, foo: 10, bar: 20});
    });
  });

  describe('delete', function () {
    it('removes all table items and returns their number', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({foo: 1});
      await rep.create({foo: 2});
      await rep.create({foo: 3});
      const result = await rep.delete();
      expect(result).to.be.eql(3);
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .find()
        .toArray();
      expect(rawData).to.be.empty;
    });

    describe('removes by a where clause', function () {
      it('removes by a document subset', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        await rep.create({foo: 10});
        const result = await rep.delete({foo: 10});
        expect(result).to.be.eq(1);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 5},
        ]);
      });

      it('matches by the "eq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 10});
        const result = await rep.delete({foo: {eq: 10}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 5},
        ]);
      });

      it('matches by the "neq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 5});
        const created3 = await rep.create({foo: 10});
        const result = await rep.delete({foo: {neq: 10}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created3[DEF_PK]), foo: 10},
        ]);
      });

      it('matches by the "gt" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.delete({foo: {gt: 10}});
        expect(result).to.be.eq(1);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 5},
          {_id: new ObjectId(created2[DEF_PK]), foo: 10},
        ]);
      });

      it('matches by the "lt" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        const result = await rep.delete({foo: {lt: 10}});
        expect(result).to.be.eq(1);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created2[DEF_PK]), foo: 10},
          {_id: new ObjectId(created3[DEF_PK]), foo: 15},
        ]);
      });

      it('matches by the "gte" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.delete({foo: {gte: 10}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 5},
        ]);
      });

      it('matches by the "lte" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        const result = await rep.delete({foo: {lte: 10}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created3[DEF_PK]), foo: 15},
        ]);
      });

      it('matches by the "inq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        const created3 = await rep.create({foo: 15});
        const result = await rep.delete({foo: {inq: [5, 10]}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created3[DEF_PK]), foo: 15},
        ]);
      });

      it('matches by the "nin" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        const created2 = await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.delete({foo: {nin: [5, 10]}});
        expect(result).to.be.eq(1);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 5},
          {_id: new ObjectId(created2[DEF_PK]), foo: 10},
        ]);
      });

      it('matches by the "between" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const created4 = await rep.create({foo: 20});
        const result = await rep.delete({foo: {between: [9, 16]}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 5},
          {_id: new ObjectId(created4[DEF_PK]), foo: 20},
        ]);
      });

      it('matches by the "exists" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({});
        await rep.create({foo: undefined});
        await rep.create({foo: null});
        await rep.create({foo: 10});
        const result = await rep.delete({foo: {exists: true}});
        expect(result).to.be.eq(3);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([{_id: new ObjectId(created1[DEF_PK])}]);
      });

      it('matches by the "like" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        const created3 = await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.delete({foo: {like: 'sit amet'}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 'lorem ipsum'},
          {_id: new ObjectId(created3[DEF_PK]), foo: 'DOLOR SIT AMET'},
        ]);
      });

      it('matches by the "nlike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        const created2 = await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        const created4 = await rep.create({foo: 'sit amet'});
        const result = await rep.delete({foo: {nlike: 'sit amet'}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created2[DEF_PK]), foo: 'dolor sit amet'},
          {_id: new ObjectId(created4[DEF_PK]), foo: 'sit amet'},
        ]);
      });

      it('matches by the "ilike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.delete({foo: {ilike: 'sit amet'}});
        expect(result).to.be.eq(3);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 'lorem ipsum'},
        ]);
      });

      it('matches by the "nilike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        const created2 = await rep.create({foo: 'dolor sit amet'});
        const created3 = await rep.create({foo: 'DOLOR SIT AMET'});
        const created4 = await rep.create({foo: 'sit amet'});
        const result = await rep.delete({foo: {nilike: 'sit amet'}});
        expect(result).to.be.eq(1);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created2[DEF_PK]), foo: 'dolor sit amet'},
          {_id: new ObjectId(created3[DEF_PK]), foo: 'DOLOR SIT AMET'},
          {_id: new ObjectId(created4[DEF_PK]), foo: 'sit amet'},
        ]);
      });

      it('matches by the "regexp" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        const created3 = await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.delete({foo: {regexp: 'sit am+'}});
        expect(result).to.be.eq(2);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 'lorem ipsum'},
          {_id: new ObjectId(created3[DEF_PK]), foo: 'DOLOR SIT AMET'},
        ]);
      });

      it('matches by the "regexp" operator with flags', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        const created1 = await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.delete({foo: {regexp: 'sit am+', flags: 'i'}});
        expect(result).to.be.eq(3);
        const rawData = await MDB_CLIENT.db()
          .collection('model')
          .find()
          .toArray();
        expect(rawData).to.be.eql([
          {_id: new ObjectId(created1[DEF_PK]), foo: 'lorem ipsum'},
        ]);
      });
    });
  });

  describe('deleteById', function () {
    it('returns false if a given identifier is not exist', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const result = await rep.deleteById(oid);
      expect(result).to.be.false;
    });

    it('returns true if an item has removed by a given identifier', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      await rep.create({[DEF_PK]: oid});
      const result = await rep.deleteById(oid);
      expect(result).to.be.true;
      const rawData = await MDB_CLIENT.db()
        .collection('model')
        .find()
        .toArray();
      expect(rawData).to.be.empty;
    });
  });

  describe('exists', function () {
    it('returns false if a given identifier is not exist', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      const result = await rep.exists(oid);
      expect(result).to.be.false;
    });

    it('returns true if a given identifier is exist', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const oid = new ObjectId();
      await rep.create({[DEF_PK]: oid});
      const result = await rep.exists(oid);
      expect(result).to.be.true;
    });
  });

  describe('count', function () {
    it('returns zero if nothing to count', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      const result = await rep.count();
      expect(result).to.be.eq(0);
    });

    it('returns a number of table items', async function () {
      const schema = createSchema();
      schema.defineModel({name: 'model', datasource: 'mongodb'});
      const rep = schema.getRepository('model');
      await rep.create({});
      await rep.create({});
      await rep.create({});
      const result = await rep.count();
      expect(result).to.be.eq(3);
    });

    describe('uses a where clause to count items', function () {
      it('matches by a document subset', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'a'});
        await rep.create({foo: 'b'});
        await rep.create({foo: 'b'});
        const result = await rep.count({foo: 'b'});
        expect(result).to.be.eql(2);
      });

      it('matches by the "eq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 10});
        const result = await rep.count({foo: {eq: 10}});
        expect(result).to.be.eql(2);
      });

      it('matches by the "neq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 10});
        const result = await rep.count({foo: {neq: 10}});
        expect(result).to.be.eq(1);
      });

      it('matches by the "gt" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.count({foo: {gt: 10}});
        expect(result).to.be.eq(1);
      });

      it('matches by the "lt" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.count({foo: {lt: 10}});
        expect(result).to.be.eq(1);
      });

      it('matches by the "gte" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.count({foo: {gte: 10}});
        expect(result).to.be.eq(2);
      });

      it('matches by the "lte" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.count({foo: {lte: 10}});
        expect(result).to.be.eq(2);
      });

      it('matches by the "inq" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.count({foo: {inq: [5, 10]}});
        expect(result).to.be.eq(2);
      });

      it('matches by the "nin" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        const result = await rep.count({foo: {nin: [5, 10]}});
        expect(result).to.be.eq(1);
      });

      it('matches by the "between" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 5});
        await rep.create({foo: 10});
        await rep.create({foo: 15});
        await rep.create({foo: 20});
        const result = await rep.count({foo: {between: [9, 16]}});
        expect(result).to.be.eq(2);
      });

      it('matches by the "exists" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({});
        await rep.create({foo: undefined});
        await rep.create({foo: null});
        await rep.create({foo: 10});
        const result1 = await rep.count({foo: {exists: true}});
        expect(result1).to.be.eq(3);
      });

      it('matches by the "like" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.count({foo: {like: 'sit amet'}});
        expect(result).to.be.eql(2);
      });

      it('matches by the "nlike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.count({foo: {nlike: 'sit amet'}});
        expect(result).to.be.eql(2);
      });

      it('matches by the "ilike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.count({foo: {ilike: 'sit amet'}});
        expect(result).to.be.eql(3);
      });

      it('matches by the "nilike" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.count({foo: {nilike: 'sit amet'}});
        expect(result).to.be.eql(1);
      });

      it('matches by the "regexp" operator', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.count({foo: {regexp: 'sit am+'}});
        expect(result).to.be.eql(2);
      });

      it('matches by the "regexp" operator with flags', async function () {
        const schema = createSchema();
        schema.defineModel({name: 'model', datasource: 'mongodb'});
        const rep = schema.getRepository('model');
        await rep.create({foo: 'lorem ipsum'});
        await rep.create({foo: 'dolor sit amet'});
        await rep.create({foo: 'DOLOR SIT AMET'});
        await rep.create({foo: 'sit amet'});
        const result = await rep.count({foo: {regexp: 'sit am+', flags: 'i'}});
        expect(result).to.be.eql(3);
      });
    });
  });
});
