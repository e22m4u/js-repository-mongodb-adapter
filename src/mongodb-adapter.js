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
import {DefinitionRegistry} from '@e22m4u/js-repository';
import {ModelDefinitionUtils} from '@e22m4u/js-repository';
import {InvalidArgumentError} from '@e22m4u/js-repository';
import {modelNameToCollectionName} from './utils/index.js';
import {InvalidOperatorValueError} from '@e22m4u/js-repository';

/**
 * Mongodb option names.
 * 6.20
 *
 * https://mongodb.github.io/node-mongodb-native/6.20/interfaces/MongoClientOptions.html
 *
 * @type {string[]}
 */
const MONGODB_OPTION_NAMES = [
  'ALPNProtocols',
  'allowPartialTrustChain',
  'appName',
  'auth',
  'authMechanism',
  'authMechanismProperties',
  'authSource',
  'autoEncryption',
  'autoSelectFamily',
  'autoSelectFamilyAttemptTimeout',
  'bsonRegExp',
  'ca',
  'cert',
  'checkKeys',
  'checkServerIdentity',
  'ciphers',
  'compressors',
  'connectTimeoutMS',
  'crl',
  'directConnection',
  'driverInfo',
  'ecdhCurve',
  'enableUtf8Validation',
  'family',
  'fieldsAsRaw',
  'forceServerObjectId',
  'heartbeatFrequencyMS',
  'hints',
  'ignoreUndefined',
  'journal',
  'keepAliveInitialDelay',
  'key',
  'loadBalanced',
  'localAddress',
  'localPort',
  'localThresholdMS',
  'lookup',
  'maxConnecting',
  'maxIdleTimeMS',
  'maxPoolSize',
  'maxStalenessSeconds',
  'minDHSize',
  'minHeartbeatFrequencyMS',
  'minPoolSize',
  'mongodbLogComponentSeverities',
  'mongodbLogMaxDocumentLength',
  'mongodbLogPath',
  'monitorCommands',
  'noDelay',
  'passphrase',
  'pfx',
  'pkFactory',
  'promoteBuffers',
  'promoteLongs',
  'promoteValues',
  'proxyHost',
  'proxyPassword',
  'proxyPort',
  'proxyUsername',
  'raw',
  'readConcern',
  'readConcernLevel',
  'readPreference',
  'readPreferenceTags',
  'rejectUnauthorized',
  'replicaSet',
  'retryReads',
  'retryWrites',
  'secureContext',
  'secureProtocol',
  'serializeFunctions',
  'serverApi',
  'serverMonitoringMode',
  'serverSelectionTimeoutMS',
  'servername',
  'session',
  'socketTimeoutMS',
  'srvMaxHosts',
  'srvServiceName',
  'ssl',
  'timeoutMS',
  'tls',
  'tlsAllowInvalidCertificates',
  'tlsAllowInvalidHostnames',
  'tlsCAFile',
  'tlsCRLFile',
  'tlsCertificateKeyFile',
  'tlsCertificateKeyFilePassword',
  'tlsInsecure',
  'useBigInt64',
  'w',
  'waitQueueTimeoutMS',
  'writeConcern',
  'wtimeoutMS',
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
   * @private
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
   * @private
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
   * @returns {ObjectId|*}
   * @private
   */
  _coerceId(value) {
    if (value == null) return value;
    if (isObjectId(value)) return new ObjectId(value);
    return value;
  }

  /**
   * Coerce date.
   *
   * @param value
   * @returns {Date|*}
   * @private
   */
  _coerceDate(value) {
    if (value == null) return value;
    if (value instanceof Date) return value;
    if (isIsoDate(value)) return new Date(value);
    return value;
  }

  /**
   * To database.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @returns {object}
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
   * @returns {object}
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
   * Get collection name by model name.
   *
   * @param {string} modelName
   */
  _getCollectionNameByModelName(modelName) {
    const modelDef = this.getService(DefinitionRegistry).getModel(modelName);
    if (modelDef.tableName != null) return modelDef.tableName;
    return modelNameToCollectionName(modelDef.name);
  }

  /**
   * Get collection.
   *
   * @param {string} modelName
   * @returns {*}
   * @private
   */
  _getCollection(modelName) {
    let collection = this._collections.get(modelName);
    if (collection) return collection;
    const collectionName = this._getCollectionNameByModelName(modelName);
    collection = this.client
      .db(this.settings.database)
      .collection(collectionName);
    this._collections.set(modelName, collection);
    return collection;
  }

  /**
   * Get id type.
   *
   * @param modelName
   * @returns {string|*}
   * @private
   */
  _getIdType(modelName) {
    const utils = this.getService(ModelDefinitionUtils);
    const pkPropName = utils.getPrimaryKeyAsPropertyName(modelName);
    return utils.getDataTypeByPropertyName(modelName, pkPropName);
  }

  /**
   * Get col name.
   *
   * @param {string} modelName
   * @param {string} propName
   * @returns {string}
   * @private
   */
  _getColName(modelName, propName) {
    if (!propName || typeof propName !== 'string')
      throw new InvalidArgumentError(
        'Property name must be a non-empty String, but %v given.',
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
   * Convert prop names chain to col names chain.
   *
   * @param {string} modelName
   * @param {string} propsChain
   * @returns {string}
   * @private
   */
  _convertPropNamesChainToColNamesChain(modelName, propsChain) {
    if (!modelName || typeof modelName !== 'string')
      throw new InvalidArgumentError(
        'Model name must be a non-empty String, but %v given.',
        modelName,
      );
    if (!propsChain || typeof propsChain !== 'string')
      throw new InvalidArgumentError(
        'Properties chain must be a non-empty String, but %v given.',
        propsChain,
      );
    // удаление повторяющихся точек,
    // где строка "foo..bar.baz...qux"
    // будет преобразована к "foo.bar.baz.qux"
    propsChain = propsChain.replace(/\.{2,}/g, '.');
    // разделение цепочки на массив свойств,
    // и формирование цепочки имен колонок
    const propNames = propsChain.split('.');
    const utils = this.getService(ModelDefinitionUtils);
    let currModelName = modelName;
    return propNames
      .map(currPropName => {
        if (!currModelName) return currPropName;
        const colName = this._getColName(currModelName, currPropName);
        currModelName = utils.getModelNameOfPropertyValueIfDefined(
          currModelName,
          currPropName,
        );
        return colName;
      })
      .join('.');
  }

  /**
   * Build projection.
   *
   * @param {string} modelName
   * @param {string|string[]} fields
   * @returns {Record<string, number>|undefined}
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
      let colName = this._convertPropNamesChainToColNamesChain(
        modelName,
        field,
      );
      acc[colName] = 1;
      return acc;
    }, {});
  }

  /**
   * Build sort.
   *
   * @param {string} modelName
   * @param {string|string[]} clause
   * @returns {object|undefined}
   * @private
   */
  _buildSort(modelName, clause) {
    if (clause == null) return;
    if (Array.isArray(clause) === false) clause = [clause];
    if (!clause.length) return;
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
          field = this._convertPropNamesChainToColNamesChain(modelName, field);
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
   * @returns {object}
   * @private
   */
  _buildQuery(modelName, clause) {
    if (clause == null) return;
    if (typeof clause !== 'object' || Array.isArray(clause))
      throw new InvalidArgumentError(
        'The provided option "where" should be an Object, but %v given.',
        clause,
      );
    const query = {};
    const idPropName = this._getIdPropName(modelName);
    Object.keys(clause).forEach(key => {
      if (String(key).indexOf('$') !== -1)
        throw new InvalidArgumentError(
          'The symbol "$" is not supported, but %v given.',
          key,
        );
      let cond = clause[key];
      // and/or/nor clause
      if (key === 'and' || key === 'or' || key === 'nor') {
        if (cond == null) return;
        if (!Array.isArray(cond))
          throw new InvalidOperatorValueError(key, 'an Array', cond);
        if (cond.length === 0) return;
        cond = cond.map(c => this._buildQuery(modelName, c));
        cond = cond.filter(c => c != null);
        const opKey = '$' + key;
        query[opKey] = query[opKey] ?? [];
        query[opKey] = [...query[opKey], ...cond];
        return;
      }
      // id
      if (key === idPropName) {
        key = '_id';
      } else {
        key = this._convertPropNamesChainToColNamesChain(modelName, key);
      }
      // string
      if (typeof cond === 'string') {
        query[key] = this._coerceId(cond);
        query[key] = this._coerceDate(query[key]);
        return;
      }
      // ObjectId
      if (cond instanceof ObjectId) {
        query[key] = cond;
        return;
      }
      // operator
      if (cond && cond.constructor && cond.constructor.name === 'Object') {
        const opConds = [];
        // eq
        if ('eq' in cond) {
          let eq = this._coerceId(cond.eq);
          eq = this._coerceDate(eq);
          opConds.push({$eq: eq});
        }
        // neq
        if ('neq' in cond) {
          let neq = this._coerceId(cond.neq);
          neq = this._coerceDate(neq);
          opConds.push({$ne: neq});
        }
        // gt
        if ('gt' in cond) {
          const gt = this._coerceDate(cond.gt);
          opConds.push({$gt: gt});
        }
        // lt
        if ('lt' in cond) {
          const lt = this._coerceDate(cond.lt);
          opConds.push({$lt: lt});
        }
        // gte
        if ('gte' in cond) {
          const gte = this._coerceDate(cond.gte);
          opConds.push({$gte: gte});
        }
        // lte
        if ('lte' in cond) {
          const lte = this._coerceDate(cond.lte);
          opConds.push({$lte: lte});
        }
        // inq
        if ('inq' in cond) {
          if (!cond.inq || !Array.isArray(cond.inq))
            throw new InvalidOperatorValueError(
              'inq',
              'an Array of possible values',
              cond.inq,
            );
          const inq = cond.inq.map(v => {
            v = this._coerceId(v);
            v = this._coerceDate(v);
            return v;
          });
          opConds.push({$in: inq});
        }
        // nin
        if ('nin' in cond) {
          if (!cond.nin || !Array.isArray(cond.nin))
            throw new InvalidOperatorValueError(
              'nin',
              'an Array of possible values',
              cond,
            );
          const nin = cond.nin.map(v => {
            v = this._coerceId(v);
            v = this._coerceDate(v);
            return v;
          });
          opConds.push({$nin: nin});
        }
        // between
        if ('between' in cond) {
          if (!Array.isArray(cond.between) || cond.between.length !== 2)
            throw new InvalidOperatorValueError(
              'between',
              'an Array of 2 elements',
              cond.between,
            );
          const gte = this._coerceDate(cond.between[0]);
          const lte = this._coerceDate(cond.between[1]);
          opConds.push({$gte: gte, $lte: lte});
        }
        // exists
        if ('exists' in cond) {
          if (typeof cond.exists !== 'boolean')
            throw new InvalidOperatorValueError(
              'exists',
              'a Boolean',
              cond.exists,
            );
          opConds.push({$exists: cond.exists});
        }
        // like
        if ('like' in cond) {
          if (typeof cond.like !== 'string' && !(cond.like instanceof RegExp))
            throw new InvalidOperatorValueError(
              'like',
              'a String or RegExp',
              cond.like,
            );
          opConds.push({$regex: stringToRegexp(cond.like)});
        }
        // nlike
        if ('nlike' in cond) {
          if (typeof cond.nlike !== 'string' && !(cond.nlike instanceof RegExp))
            throw new InvalidOperatorValueError(
              'nlike',
              'a String or RegExp',
              cond.nlike,
            );
          opConds.push({$not: stringToRegexp(cond.nlike)});
        }
        // ilike
        if ('ilike' in cond) {
          if (typeof cond.ilike !== 'string' && !(cond.ilike instanceof RegExp))
            throw new InvalidOperatorValueError(
              'ilike',
              'a String or RegExp',
              cond.ilike,
            );
          opConds.push({$regex: stringToRegexp(cond.ilike, 'i')});
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
          opConds.push({$not: stringToRegexp(cond.nilike, 'i')});
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
          opConds.push({$regex: stringToRegexp(cond.regexp, flags)});
        }
        // adds a single operator condition
        if (opConds.length === 1) {
          query[key] = opConds[0];
          // adds multiple operator conditions
        } else if (opConds.length > 1) {
          query['$and'] = query['$and'] ?? [];
          opConds.forEach(c => query['$and'].push({[key]: c}));
        }
        return;
      }
      // unknown
      query[key] = cond;
    });
    return Object.keys(query).length ? query : undefined;
  }

  /**
   * Create.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @param {object|undefined} filter
   * @returns {Promise<object>}
   */
  async create(modelName, modelData, filter = undefined) {
    const idPropName = this._getIdPropName(modelName);
    const idValue = modelData[idPropName];
    if (idValue == null || idValue === '' || idValue === 0) {
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
   * @returns {Promise<object>}
   */
  async replaceById(modelName, id, modelData, filter = undefined) {
    id = this._coerceId(id);
    const idPropName = this._getIdPropName(modelName);
    modelData[idPropName] = id;
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const {matchedCount} = await table.replaceOne({_id: id}, tableData);
    if (matchedCount < 1)
      throw new InvalidArgumentError('Identifier %v is not found.', String(id));
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields,
    );
    const replacedData = await table.findOne({_id: id}, {projection});
    return this._fromDatabase(modelName, replacedData);
  }

  /**
   * Replace or create.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @param {object|undefined} filter
   * @returns {Promise<object>}
   */
  async replaceOrCreate(modelName, modelData, filter = undefined) {
    const idPropName = this._getIdPropName(modelName);
    let idValue = modelData[idPropName];
    idValue = this._coerceId(idValue);
    if (idValue == null || idValue === '' || idValue === 0) {
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
      idValue = undefined;
    }
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    if (idValue == null) {
      const {insertedId} = await table.insertOne(tableData);
      idValue = insertedId;
    } else {
      const {upsertedId} = await table.replaceOne({_id: idValue}, tableData, {
        upsert: true,
      });
      if (upsertedId) idValue = upsertedId;
    }
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields,
    );
    const upsertedData = await table.findOne({_id: idValue}, {projection});
    return this._fromDatabase(modelName, upsertedData);
  }

  /**
   * Patch.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @param {object|undefined} where
   * @returns {Promise<number>}
   */
  async patch(modelName, modelData, where = undefined) {
    const idPropName = this._getIdPropName(modelName);
    delete modelData[idPropName];
    const query = this._buildQuery(modelName, where) || {};
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const {matchedCount} = await table.updateMany(query, {$set: tableData});
    return matchedCount;
  }

  /**
   * Patch by id.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @param {object} modelData
   * @param {object|undefined} filter
   * @returns {Promise<object>}
   */
  async patchById(modelName, id, modelData, filter = undefined) {
    id = this._coerceId(id);
    const idPropName = this._getIdPropName(modelName);
    delete modelData[idPropName];
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const {matchedCount} = await table.updateOne({_id: id}, {$set: tableData});
    if (matchedCount < 1)
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
   * @returns {Promise<object[]>}
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
   * @returns {Promise<object>}
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
   * @returns {Promise<number>}
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
   * @returns {Promise<boolean>}
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
   * @returns {Promise<boolean>}
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
   * @returns {Promise<number>}
   */
  async count(modelName, where = undefined) {
    const query = this._buildQuery(modelName, where);
    const table = this._getCollection(modelName);
    return await table.countDocuments(query);
  }
}
