/* eslint no-unused-vars: 0 */
import {ObjectId} from 'mongodb';
import {MongoClient} from 'mongodb';
import {isIsoDate} from './utils/index.js';
import {isObjectId} from './utils/index.js';
import {Adapter} from '@e22m4u/js-repository';
import {DataType} from '@e22m4u/js-repository';
import {capitalize} from '@e22m4u/js-repository';
import {createMongodbUrl} from './utils/index.js';
import {ServiceContainer} from '@e22m4u/js-service';
import {transformValuesDeep} from './utils/index.js';
import {stringToRegexp} from '@e22m4u/js-repository';
import {selectObjectKeys} from '@e22m4u/js-repository';
import {ModelDefinitionUtils} from '@e22m4u/js-repository';
import {InvalidArgumentError} from '@e22m4u/js-repository';
import {InvalidOperatorValueError} from '@e22m4u/js-repository';

/**
 * Mongodb option names.
 * 5.8.1
 *
 * @type {string[]}
 */
const MONGODB_OPTION_NAMES = [
  'appname',
  'authMechanism',
  'authMechanismProperties',
  'authSource',
  'compressors',
  'connectTimeoutMS',
  'directConnection',
  'heartbeatFrequencyMS',
  'journal',
  'loadBalanced',
  'localThresholdMS',
  'maxIdleTimeMS',
  'maxPoolSize',
  'maxConnecting',
  'maxStalenessSeconds',
  'minPoolSize',
  'proxyHost',
  'proxyPort',
  'proxyUsername',
  'proxyPassword',
  'readConcernLevel',
  'readPreference',
  'readPreferenceTags',
  'replicaSet',
  'retryReads',
  'retryWrites',
  'serverSelectionTimeoutMS',
  'serverSelectionTryOnce',
  'socketTimeoutMS',
  'srvMaxHosts',
  'srvServiceName',
  'ssl',
  'timeoutMS',
  'tls',
  'tlsAllowInvalidCertificates',
  'tlsAllowInvalidHostnames',
  'tlsCAFile',
  'tlsCertificateKeyFile',
  'tlsCertificateKeyFilePassword',
  'tlsInsecure',
  'w',
  'waitQueueTimeoutMS',
  'wTimeoutMS',
  'zlibCompressionLevel',
];

/**
 * Default settings.
 *
 * @type {object}
 */
const DEFAULT_SETTINGS = {
  //  connectTimeoutMS: 2500,
  //  serverSelectionTimeoutMS: 2500,
};

/**
 * Mongodb adapter.
 */
export class MongodbAdapter extends Adapter {
  /**
   * Mongodb instance.
   *
   * @type {MongoClient}
   * @private
   */
  _client;

  /**
   * Client.
   *
   * @returns {MongoClient}
   */
  get client() {
    return this._client;
  }

  /**
   * Collections.
   *
   * @type {Map<any, any>}
   * @private
   */
  _collections = new Map();

  /**
   * Constructor.
   *
   * @param {ServiceContainer} container
   * @param settings
   */
  constructor(container, settings) {
    settings = Object.assign({}, DEFAULT_SETTINGS, settings || {});
    settings.protocol = settings.protocol || 'mongodb';
    settings.hostname = settings.hostname || settings.host || '127.0.0.1';
    settings.port = settings.port || 27017;
    settings.database = settings.database || settings.db || 'database';
    super(container, settings);
    const options = selectObjectKeys(this.settings, MONGODB_OPTION_NAMES);
    const url = createMongodbUrl(this.settings);
    this._client = new MongoClient(url, options);
  }

  /**
   * Get id prop name.
   *
   * @param modelName
   */
  _getIdPropName(modelName) {
    return this.getService(ModelDefinitionUtils).getPrimaryKeyAsPropertyName(
      modelName,
    );
  }

  /**
   * Get id col name.
   *
   * @param modelName
   */
  _getIdColName(modelName) {
    return this.getService(ModelDefinitionUtils).getPrimaryKeyAsColumnName(
      modelName,
    );
  }

  /**
   * Coerce id.
   *
   * @param value
   * @return {ObjectId|*}
   * @private
   */
  _coerceId(value) {
    if (value == null) return value;
    if (isObjectId(value)) return new ObjectId(value);
    return value;
  }

  /**
   * To database.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @return {object}
   * @private
   */
  _toDatabase(modelName, modelData) {
    const tableData = this.getService(
      ModelDefinitionUtils,
    ).convertPropertyNamesToColumnNames(modelName, modelData);

    const idColName = this._getIdColName(modelName);
    if (idColName !== 'id' && idColName !== '_id')
      throw new InvalidArgumentError(
        'MongoDB is not supporting custom names of the primary key. ' +
          'Do use "id" as a primary key instead of %v.',
        idColName,
      );
    if (idColName in tableData && idColName !== '_id') {
      tableData._id = tableData[idColName];
      delete tableData[idColName];
    }

    return transformValuesDeep(tableData, value => {
      if (value instanceof ObjectId) return value;
      if (value instanceof Date) return value;
      if (isObjectId(value)) return new ObjectId(value);
      if (isIsoDate(value)) return new Date(value);
      return value;
    });
  }

  /**
   * From database.
   *
   * @param {string} modelName
   * @param {object} tableData
   * @return {object}
   * @private
   */
  _fromDatabase(modelName, tableData) {
    if ('_id' in tableData) {
      const idColName = this._getIdColName(modelName);
      if (idColName !== 'id' && idColName !== '_id')
        throw new InvalidArgumentError(
          'MongoDB is not supporting custom names of the primary key. ' +
            'Do use "id" as a primary key instead of %v.',
          idColName,
        );
      if (idColName !== '_id') {
        tableData[idColName] = tableData._id;
        delete tableData._id;
      }
    }

    const modelData = this.getService(
      ModelDefinitionUtils,
    ).convertColumnNamesToPropertyNames(modelName, tableData);

    return transformValuesDeep(modelData, value => {
      if (value instanceof ObjectId) return String(value);
      if (value instanceof Date) return value.toISOString();
      return value;
    });
  }

  /**
   * Get collection.
   *
   * @param {string} modelName
   * @return {*}
   * @private
   */
  _getCollection(modelName) {
    let collection = this._collections.get(modelName);
    if (collection) return collection;
    const tableName =
      this.getService(ModelDefinitionUtils).getTableNameByModelName(modelName);
    collection = this.client.db(this.settings.database).collection(tableName);
    this._collections.set(modelName, collection);
    return collection;
  }

  /**
   * Get id type.
   *
   * @param modelName
   * @return {string|*}
   * @private
   */
  _getIdType(modelName) {
    const utils = this.getService(ModelDefinitionUtils);
    const pkPropName = utils.getPrimaryKeyAsPropertyName(modelName);
    return utils.getDataTypeByPropertyName(modelName, pkPropName);
  }

  /**
   * Build projection.
   *
   * @param {string} modelName
   * @param {string|string[]} fields
   * @return {Record<string, number>|undefined}
   * @private
   */
  _buildProjection(modelName, fields) {
    if (fields == null) return;
    if (Array.isArray(fields) === false) fields = [fields];
    if (!fields.length) return;
    if (fields.indexOf('_id') === -1) fields.push('_id');
    return fields.reduce((acc, field) => {
      if (!field || typeof field !== 'string')
        throw new InvalidArgumentError(
          'The provided option "fields" should be a non-empty String ' +
            'or an Array of non-empty String, but %v given.',
          field,
        );
      let colName = this._getColName(modelName, field);
      acc[colName] = 1;
      return acc;
    }, {});
  }

  /**
   * Get col name.
   *
   * @param {string} modelName
   * @param {string} propName
   * @return {string}
   * @private
   */
  _getColName(modelName, propName) {
    if (!propName || typeof propName !== 'string')
      throw new InvalidArgumentError(
        'A property name must be a non-empty String, but %v given.',
        propName,
      );
    const utils = this.getService(ModelDefinitionUtils);
    let colName = propName;
    try {
      colName = utils.getColumnNameByPropertyName(modelName, propName);
    } catch (error) {
      if (
        !(error instanceof InvalidArgumentError) ||
        error.message.indexOf('does not have the property') === -1
      ) {
        throw error;
      }
    }
    return colName;
  }

  /**
   * Build sort.
   *
   * @param {string} modelName
   * @param {string|string[]} clause
   * @return {object|undefined}
   * @private
   */
  _buildSort(modelName, clause) {
    if (clause == null) return;
    if (Array.isArray(clause) === false) clause = [clause];
    if (!clause.length) return;
    const utils = this.getService(ModelDefinitionUtils);
    const idPropName = this._getIdPropName(modelName);
    return clause.reduce((acc, order) => {
      if (!order || typeof order !== 'string')
        throw new InvalidArgumentError(
          'The provided option "order" should be a non-empty String ' +
            'or an Array of non-empty String, but %v given.',
          order,
        );
      const direction = order.match(/\s+(A|DE)SC$/);
      let field = order.replace(/\s+(A|DE)SC$/, '').trim();
      if (field === idPropName) {
        field = '_id';
      } else {
        try {
          field = utils.getColumnNameByPropertyName(modelName, field);
        } catch (error) {
          if (
            !(error instanceof InvalidArgumentError) ||
            error.message.indexOf('does not have the property') === -1
          ) {
            throw error;
          }
        }
      }
      acc[field] = direction && direction[1] === 'DE' ? -1 : 1;
      return acc;
    }, {});
  }

  /**
   * Build query.
   *
   * @param {string} modelName
   * @param {object} clause
   * @return {object}
   * @private
   */
  _buildQuery(modelName, clause) {
    const query = {};
    if (!clause || typeof clause !== 'object') return query;
    const idPropName = this._getIdPropName(modelName);
    Object.keys(clause).forEach(key => {
      let cond = clause[key];
      // and/or/nor clause
      if (key === 'and' || key === 'or' || key === 'nor') {
        if (Array.isArray(cond))
          cond = cond.map(c => this._buildQuery(modelName, c));
        query['$' + key] = cond;
        return;
      }
      // id
      if (key === idPropName) {
        key = '_id';
      } else {
        key = this._getColName(modelName, key);
      }
      // string
      if (typeof cond === 'string') {
        query[key] = this._coerceId(cond);
        return;
      }
      // ObjectId
      if (cond instanceof ObjectId) {
        query[key] = cond;
        return;
      }
      // operator
      if (cond && cond.constructor && cond.constructor.name === 'Object') {
        // eq
        if ('eq' in cond) {
          query[key] = this._coerceId(cond.eq);
        }
        // neq
        if ('neq' in cond) {
          query[key] = {$ne: this._coerceId(cond.neq)};
        }
        // gt
        if ('gt' in cond) {
          query[key] = {$gt: cond.gt};
        }
        // lt
        if ('lt' in cond) {
          query[key] = {$lt: cond.lt};
        }
        // gte
        if ('gte' in cond) {
          query[key] = {$gte: cond.gte};
        }
        // lte
        if ('lte' in cond) {
          query[key] = {$lte: cond.lte};
        }
        // inq
        if ('inq' in cond) {
          if (!cond.inq || !Array.isArray(cond.inq))
            throw new InvalidOperatorValueError(
              'inq',
              'an Array of possible values',
              cond.inq,
            );
          query[key] = {$in: cond.inq.map(v => this._coerceId(v))};
        }
        // nin
        if ('nin' in cond) {
          if (!cond.nin || !Array.isArray(cond.nin))
            throw new InvalidOperatorValueError(
              'nin',
              'an Array of possible values',
              cond,
            );
          query[key] = {$nin: cond.nin.map(v => this._coerceId(v))};
        }
        // between
        if ('between' in cond) {
          if (!Array.isArray(cond.between) || cond.between.length !== 2)
            throw new InvalidOperatorValueError(
              'between',
              'an Array of 2 elements',
              cond.between,
            );
          query[key] = {$gte: cond.between[0], $lte: cond.between[1]};
        }
        // exists
        if ('exists' in cond) {
          if (typeof cond.exists !== 'boolean')
            throw new InvalidOperatorValueError(
              'exists',
              'a Boolean',
              cond.exists,
            );
          query[key] = {$exists: cond.exists};
        }
        // like
        if ('like' in cond) {
          if (typeof cond.like !== 'string' && !(cond.like instanceof RegExp))
            throw new InvalidOperatorValueError(
              'like',
              'a String or RegExp',
              cond.like,
            );
          query[key] = {$regex: stringToRegexp(cond.like)};
        }
        // nlike
        if ('nlike' in cond) {
          if (typeof cond.nlike !== 'string' && !(cond.nlike instanceof RegExp))
            throw new InvalidOperatorValueError(
              'nlike',
              'a String or RegExp',
              cond.nlike,
            );
          query[key] = {$not: stringToRegexp(cond.nlike)};
        }
        // ilike
        if ('ilike' in cond) {
          if (typeof cond.ilike !== 'string' && !(cond.ilike instanceof RegExp))
            throw new InvalidOperatorValueError(
              'ilike',
              'a String or RegExp',
              cond.ilike,
            );
          query[key] = {$regex: stringToRegexp(cond.ilike, 'i')};
        }
        // nilike
        if ('nilike' in cond) {
          if (
            typeof cond.nilike !== 'string' &&
            !(cond.nilike instanceof RegExp)
          ) {
            throw new InvalidOperatorValueError(
              'nilike',
              'a String or RegExp',
              cond.nilike,
            );
          }
          query[key] = {$not: stringToRegexp(cond.nilike, 'i')};
        }
        // regexp and flags (optional)
        if ('regexp' in cond) {
          if (
            typeof cond.regexp !== 'string' &&
            !(cond.regexp instanceof RegExp)
          ) {
            throw new InvalidOperatorValueError(
              'regexp',
              'a String or RegExp',
              cond.regexp,
            );
          }
          const flags = cond.flags || undefined;
          if (flags && typeof flags !== 'string')
            throw new InvalidArgumentError(
              'RegExp flags must be a String, but %v given.',
              cond.flags,
            );
          query[key] = {$regex: stringToRegexp(cond.regexp, flags)};
        }
        return;
      }
      // unknown
      query[key] = cond;
    });
    return query;
  }

  /**
   * Create.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @param {object|undefined} filter
   * @return {Promise<object>}
   */
  async create(modelName, modelData, filter = undefined) {
    const idPropName = this._getIdPropName(modelName);
    const idValue = modelData[idPropName];
    if (idValue == null) {
      const pkType = this._getIdType(modelName);
      if (pkType !== DataType.STRING && pkType !== DataType.ANY)
        throw new InvalidArgumentError(
          'MongoDB unable to generate primary keys of %s. ' +
            'Do provide your own value for the %v property ' +
            'or set property type to String.',
          capitalize(pkType),
          idPropName,
        );
      delete modelData[idPropName];
    }
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const {insertedId} = await table.insertOne(tableData);
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields,
    );
    const insertedData = await table.findOne({_id: insertedId}, {projection});
    return this._fromDatabase(modelName, insertedData);
  }

  /**
   * Replace by id.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @param {object} modelData
   * @param {object|undefined} filter
   * @return {Promise<object>}
   */
  async replaceById(modelName, id, modelData, filter = undefined) {
    id = this._coerceId(id);
    const idPropName = this._getIdPropName(modelName);
    modelData[idPropName] = id;
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const {modifiedCount} = await table.replaceOne({_id: id}, tableData);
    if (modifiedCount < 1)
      throw new InvalidArgumentError('Identifier %v is not found.', String(id));
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields,
    );
    const replacedData = await table.findOne({_id: id}, {projection});
    return this._fromDatabase(modelName, replacedData);
  }

  /**
   * Patch by id.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @param {object} modelData
   * @param {object|undefined} filter
   * @return {Promise<object>}
   */
  async patchById(modelName, id, modelData, filter = undefined) {
    id = this._coerceId(id);
    const idPropName = this._getIdPropName(modelName);
    delete modelData[idPropName];
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const {modifiedCount} = await table.updateOne({_id: id}, {$set: tableData});
    if (modifiedCount < 1)
      throw new InvalidArgumentError('Identifier %v is not found.', String(id));
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields,
    );
    const patchedData = await table.findOne({_id: id}, {projection});
    return this._fromDatabase(modelName, patchedData);
  }

  /**
   * Find.
   *
   * @param {string} modelName
   * @param {object|undefined} filter
   * @return {Promise<object[]>}
   */
  async find(modelName, filter = undefined) {
    filter = filter || {};
    const query = this._buildQuery(modelName, filter.where);
    const sort = this._buildSort(modelName, filter.order);
    const limit = filter.limit || undefined;
    const skip = filter.skip || undefined;
    const projection = this._buildProjection(modelName, filter.fields);
    const collection = this._getCollection(modelName);
    const options = {sort, limit, skip, projection};
    const tableItems = await collection.find(query, options).toArray();
    return tableItems.map(v => this._fromDatabase(modelName, v));
  }

  /**
   * Find by id.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @param {object|undefined} filter
   * @return {Promise<object>}
   */
  async findById(modelName, id, filter = undefined) {
    id = this._coerceId(id);
    const table = this._getCollection(modelName);
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields,
    );
    const patchedData = await table.findOne({_id: id}, {projection});
    if (!patchedData)
      throw new InvalidArgumentError('Identifier %v is not found.', String(id));
    return this._fromDatabase(modelName, patchedData);
  }

  /**
   * Delete.
   *
   * @param {string} modelName
   * @param {object|undefined} where
   * @return {Promise<number>}
   */
  async delete(modelName, where = undefined) {
    const table = this._getCollection(modelName);
    const query = this._buildQuery(modelName, where);
    const {deletedCount} = await table.deleteMany(query);
    return deletedCount;
  }

  /**
   * Delete by id.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @return {Promise<boolean>}
   */
  async deleteById(modelName, id) {
    id = this._coerceId(id);
    const table = this._getCollection(modelName);
    const {deletedCount} = await table.deleteOne({_id: id});
    return deletedCount > 0;
  }

  /**
   * Exists.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @return {Promise<boolean>}
   */
  async exists(modelName, id) {
    id = this._coerceId(id);
    const table = this._getCollection(modelName);
    const result = await table.findOne({_id: id}, {});
    return result != null;
  }

  /**
   * Count.
   *
   * @param {string} modelName
   * @param {object|undefined} where
   * @return {Promise<number>}
   */
  async count(modelName, where = undefined) {
    const query = this._buildQuery(modelName, where);
    const table = this._getCollection(modelName);
    return await table.count(query);
  }
}
