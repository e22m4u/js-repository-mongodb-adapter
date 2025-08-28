var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  MongodbAdapter: () => MongodbAdapter
});
module.exports = __toCommonJS(index_exports);

// src/mongodb-adapter.js
var import_mongodb2 = require("mongodb");
var import_mongodb3 = require("mongodb");

// src/utils/is-iso-date.js
function isIsoDate(value) {
  if (!value) return false;
  if (value instanceof Date) return true;
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) return false;
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === value;
}
__name(isIsoDate, "isIsoDate");

// src/utils/is-object-id.js
var import_mongodb = require("mongodb");
function isObjectId(value) {
  if (!value) return false;
  if (value instanceof import_mongodb.ObjectId) return true;
  if (typeof value !== "string") return false;
  return value.match(/^[a-fA-F0-9]{24}$/) != null;
}
__name(isObjectId, "isObjectId");

// src/utils/create-mongodb-url.js
var import_js_repository = require("@e22m4u/js-repository");
function createMongodbUrl(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new import_js_repository.InvalidArgumentError(
      'The first argument of "createMongodbUrl" must be an Object, but %v given.',
      options
    );
  if (options.protocol && typeof options.protocol !== "string")
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "protocol" must be a String, but %v given.',
      options.protocol
    );
  if (options.hostname && typeof options.hostname !== "string")
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "hostname" must be a String, but %v given.',
      options.hostname
    );
  if (options.host && typeof options.host !== "string")
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "host" must be a String, but %v given.',
      options.host
    );
  if (options.port && typeof options.port !== "number" && typeof options.port !== "string") {
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "port" must be a Number or a String, but %v given.',
      options.port
    );
  }
  if (options.database && typeof options.database !== "string")
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "database" must be a String, but %v given.',
      options.database
    );
  if (options.db && typeof options.db !== "string")
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "db" must be a String, but %v given.',
      options.db
    );
  if (options.username && typeof options.username !== "string")
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "username" must be a String, but %v given.',
      options.username
    );
  if (options.password && typeof options.password !== "string" && typeof options.password !== "number") {
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "password" must be a String or a Number, but %v given.',
      options.password
    );
  }
  if (options.pass && typeof options.pass !== "string" && typeof options.pass !== "number") {
    throw new import_js_repository.InvalidArgumentError(
      'MongoDB option "pass" must be a String or a Number, but %v given.',
      options.pass
    );
  }
  const protocol = options.protocol || "mongodb";
  const hostname = options.hostname || options.host || "127.0.0.1";
  const port = options.port || 27017;
  const database = options.database || options.db || "database";
  const username = options.username || options.user;
  const password = options.password || options.pass || void 0;
  let portUrl = "";
  if (protocol !== "mongodb+srv") {
    portUrl = ":" + port;
  }
  if (username && password) {
    return `${protocol}://${username}:${password}@${hostname}${portUrl}/${database}`;
  } else {
    return `${protocol}://${hostname}${portUrl}/${database}`;
  }
}
__name(createMongodbUrl, "createMongodbUrl");

// src/utils/transform-values-deep.js
var import_js_repository2 = require("@e22m4u/js-repository");
function transformValuesDeep(value, transformer) {
  if (!transformer || typeof transformer !== "function")
    throw new import_js_repository2.InvalidArgumentError(
      'The second argument of "transformValuesDeep" must be a Function, but %v given.',
      transformer
    );
  if (Array.isArray(value)) {
    value.forEach((v, i) => value[i] = transformValuesDeep(v, transformer));
    return value;
  } else if (value && typeof value === "object") {
    if (!value.constructor || value.constructor && value.constructor.name === "Object") {
      Object.keys(value).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(value, key))
          value[key] = transformValuesDeep(value[key], transformer);
      });
      return value;
    } else {
      return transformer(value);
    }
  } else {
    return transformer(value);
  }
}
__name(transformValuesDeep, "transformValuesDeep");

// src/mongodb-adapter.js
var import_js_repository3 = require("@e22m4u/js-repository");
var import_js_repository4 = require("@e22m4u/js-repository");
var import_js_repository5 = require("@e22m4u/js-repository");

// node_modules/@e22m4u/js-service/src/errors/invalid-argument-error.js
var import_js_format = require("@e22m4u/js-format");

// src/mongodb-adapter.js
var import_js_repository6 = require("@e22m4u/js-repository");
var import_js_repository7 = require("@e22m4u/js-repository");
var import_js_repository8 = require("@e22m4u/js-repository");
var import_js_repository9 = require("@e22m4u/js-repository");
var import_js_repository10 = require("@e22m4u/js-repository");
var MONGODB_OPTION_NAMES = [
  "ALPNProtocols",
  "allowPartialTrustChain",
  "appName",
  "auth",
  "authMechanism",
  "authMechanismProperties",
  "authSource",
  "autoEncryption",
  "autoSelectFamily",
  "autoSelectFamilyAttemptTimeout",
  "bsonRegExp",
  "ca",
  "cert",
  "checkKeys",
  "checkServerIdentity",
  "ciphers",
  "compressors",
  "connectTimeoutMS",
  "crl",
  "directConnection",
  "driverInfo",
  "ecdhCurve",
  "enableUtf8Validation",
  "family",
  "fieldsAsRaw",
  "forceServerObjectId",
  "heartbeatFrequencyMS",
  "hints",
  "ignoreUndefined",
  "journal",
  "keepAliveInitialDelay",
  "key",
  "loadBalanced",
  "localAddress",
  "localPort",
  "localThresholdMS",
  "lookup",
  "maxConnecting",
  "maxIdleTimeMS",
  "maxPoolSize",
  "maxStalenessSeconds",
  "minDHSize",
  "minHeartbeatFrequencyMS",
  "minPoolSize",
  "mongodbLogComponentSeverities",
  "mongodbLogMaxDocumentLength",
  "mongodbLogPath",
  "monitorCommands",
  "noDelay",
  "passphrase",
  "pfx",
  "pkFactory",
  "promoteBuffers",
  "promoteLongs",
  "promoteValues",
  "proxyHost",
  "proxyPassword",
  "proxyPort",
  "proxyUsername",
  "raw",
  "readConcern",
  "readConcernLevel",
  "readPreference",
  "readPreferenceTags",
  "rejectUnauthorized",
  "replicaSet",
  "retryReads",
  "retryWrites",
  "secureContext",
  "secureProtocol",
  "serializeFunctions",
  "serverApi",
  "serverMonitoringMode",
  "serverSelectionTimeoutMS",
  "servername",
  "session",
  "socketTimeoutMS",
  "srvMaxHosts",
  "srvServiceName",
  "ssl",
  "timeoutMS",
  "tls",
  "tlsAllowInvalidCertificates",
  "tlsAllowInvalidHostnames",
  "tlsCAFile",
  "tlsCRLFile",
  "tlsCertificateKeyFile",
  "tlsCertificateKeyFilePassword",
  "tlsInsecure",
  "useBigInt64",
  "w",
  "waitQueueTimeoutMS",
  "writeConcern",
  "wtimeoutMS",
  "zlibCompressionLevel"
];
var DEFAULT_SETTINGS = {
  //  connectTimeoutMS: 2500,
  //  serverSelectionTimeoutMS: 2500,
};
var _MongodbAdapter = class _MongodbAdapter extends import_js_repository3.Adapter {
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
  _collections = /* @__PURE__ */ new Map();
  /**
   * Constructor.
   *
   * @param {ServiceContainer} container
   * @param settings
   */
  constructor(container, settings) {
    settings = Object.assign({}, DEFAULT_SETTINGS, settings || {});
    settings.protocol = settings.protocol || "mongodb";
    settings.hostname = settings.hostname || settings.host || "127.0.0.1";
    settings.port = settings.port || 27017;
    settings.database = settings.database || settings.db || "database";
    super(container, settings);
    const options = (0, import_js_repository7.selectObjectKeys)(this.settings, MONGODB_OPTION_NAMES);
    const url = createMongodbUrl(this.settings);
    this._client = new import_mongodb3.MongoClient(url, options);
  }
  /**
   * Get id prop name.
   *
   * @param modelName
   * @private
   */
  _getIdPropName(modelName) {
    return this.getService(import_js_repository8.ModelDefinitionUtils).getPrimaryKeyAsPropertyName(
      modelName
    );
  }
  /**
   * Get id col name.
   *
   * @param modelName
   * @private
   */
  _getIdColName(modelName) {
    return this.getService(import_js_repository8.ModelDefinitionUtils).getPrimaryKeyAsColumnName(
      modelName
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
    if (isObjectId(value)) return new import_mongodb2.ObjectId(value);
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
      import_js_repository8.ModelDefinitionUtils
    ).convertPropertyNamesToColumnNames(modelName, modelData);
    const idColName = this._getIdColName(modelName);
    if (idColName !== "id" && idColName !== "_id")
      throw new import_js_repository9.InvalidArgumentError(
        'MongoDB is not supporting custom names of the primary key. Do use "id" as a primary key instead of %v.',
        idColName
      );
    if (idColName in tableData && idColName !== "_id") {
      tableData._id = tableData[idColName];
      delete tableData[idColName];
    }
    return transformValuesDeep(tableData, (value) => {
      if (value instanceof import_mongodb2.ObjectId) return value;
      if (value instanceof Date) return value;
      if (isObjectId(value)) return new import_mongodb2.ObjectId(value);
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
    if ("_id" in tableData) {
      const idColName = this._getIdColName(modelName);
      if (idColName !== "id" && idColName !== "_id")
        throw new import_js_repository9.InvalidArgumentError(
          'MongoDB is not supporting custom names of the primary key. Do use "id" as a primary key instead of %v.',
          idColName
        );
      if (idColName !== "_id") {
        tableData[idColName] = tableData._id;
        delete tableData._id;
      }
    }
    const modelData = this.getService(
      import_js_repository8.ModelDefinitionUtils
    ).convertColumnNamesToPropertyNames(modelName, tableData);
    return transformValuesDeep(modelData, (value) => {
      if (value instanceof import_mongodb2.ObjectId) return String(value);
      if (value instanceof Date) return value.toISOString();
      return value;
    });
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
    const tableName = this.getService(import_js_repository8.ModelDefinitionUtils).getTableNameByModelName(modelName);
    collection = this.client.db(this.settings.database).collection(tableName);
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
    const utils = this.getService(import_js_repository8.ModelDefinitionUtils);
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
    if (!propName || typeof propName !== "string")
      throw new import_js_repository9.InvalidArgumentError(
        "Property name must be a non-empty String, but %v given.",
        propName
      );
    const utils = this.getService(import_js_repository8.ModelDefinitionUtils);
    let colName = propName;
    try {
      colName = utils.getColumnNameByPropertyName(modelName, propName);
    } catch (error) {
      if (!(error instanceof import_js_repository9.InvalidArgumentError) || error.message.indexOf("does not have the property") === -1) {
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
    if (!modelName || typeof modelName !== "string")
      throw new import_js_repository9.InvalidArgumentError(
        "Model name must be a non-empty String, but %v given.",
        modelName
      );
    if (!propsChain || typeof propsChain !== "string")
      throw new import_js_repository9.InvalidArgumentError(
        "Properties chain must be a non-empty String, but %v given.",
        propsChain
      );
    propsChain = propsChain.replace(/\.{2,}/g, ".");
    const propNames = propsChain.split(".");
    const utils = this.getService(import_js_repository8.ModelDefinitionUtils);
    let currModelName = modelName;
    return propNames.map((currPropName) => {
      if (!currModelName) return currPropName;
      const colName = this._getColName(currModelName, currPropName);
      currModelName = utils.getModelNameOfPropertyValueIfDefined(
        currModelName,
        currPropName
      );
      return colName;
    }).join(".");
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
    if (fields.indexOf("_id") === -1) fields.push("_id");
    return fields.reduce((acc, field) => {
      if (!field || typeof field !== "string")
        throw new import_js_repository9.InvalidArgumentError(
          'The provided option "fields" should be a non-empty String or an Array of non-empty String, but %v given.',
          field
        );
      let colName = this._convertPropNamesChainToColNamesChain(
        modelName,
        field
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
      if (!order || typeof order !== "string")
        throw new import_js_repository9.InvalidArgumentError(
          'The provided option "order" should be a non-empty String or an Array of non-empty String, but %v given.',
          order
        );
      const direction = order.match(/\s+(A|DE)SC$/);
      let field = order.replace(/\s+(A|DE)SC$/, "").trim();
      if (field === idPropName) {
        field = "_id";
      } else {
        try {
          field = this._convertPropNamesChainToColNamesChain(modelName, field);
        } catch (error) {
          if (!(error instanceof import_js_repository9.InvalidArgumentError) || error.message.indexOf("does not have the property") === -1) {
            throw error;
          }
        }
      }
      acc[field] = direction && direction[1] === "DE" ? -1 : 1;
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
    if (typeof clause !== "object" || Array.isArray(clause))
      throw new import_js_repository9.InvalidArgumentError(
        'The provided option "where" should be an Object, but %v given.',
        clause
      );
    const query = {};
    const idPropName = this._getIdPropName(modelName);
    Object.keys(clause).forEach((key) => {
      var _a, _b;
      if (String(key).indexOf("$") !== -1)
        throw new import_js_repository9.InvalidArgumentError(
          'The symbol "$" is not supported, but %v given.',
          key
        );
      let cond = clause[key];
      if (key === "and" || key === "or" || key === "nor") {
        if (cond == null) return;
        if (!Array.isArray(cond))
          throw new import_js_repository10.InvalidOperatorValueError(key, "an Array", cond);
        if (cond.length === 0) return;
        cond = cond.map((c) => this._buildQuery(modelName, c));
        cond = cond.filter((c) => c != null);
        const opKey = "$" + key;
        query[opKey] = (_a = query[opKey]) != null ? _a : [];
        query[opKey] = [...query[opKey], ...cond];
        return;
      }
      if (key === idPropName) {
        key = "_id";
      } else {
        key = this._convertPropNamesChainToColNamesChain(modelName, key);
      }
      if (typeof cond === "string") {
        query[key] = this._coerceId(cond);
        query[key] = this._coerceDate(query[key]);
        return;
      }
      if (cond instanceof import_mongodb2.ObjectId) {
        query[key] = cond;
        return;
      }
      if (cond && cond.constructor && cond.constructor.name === "Object") {
        const opConds = [];
        if ("eq" in cond) {
          let eq = this._coerceId(cond.eq);
          eq = this._coerceDate(eq);
          opConds.push({ $eq: eq });
        }
        if ("neq" in cond) {
          let neq = this._coerceId(cond.neq);
          neq = this._coerceDate(neq);
          opConds.push({ $ne: neq });
        }
        if ("gt" in cond) {
          const gt = this._coerceDate(cond.gt);
          opConds.push({ $gt: gt });
        }
        if ("lt" in cond) {
          const lt = this._coerceDate(cond.lt);
          opConds.push({ $lt: lt });
        }
        if ("gte" in cond) {
          const gte = this._coerceDate(cond.gte);
          opConds.push({ $gte: gte });
        }
        if ("lte" in cond) {
          const lte = this._coerceDate(cond.lte);
          opConds.push({ $lte: lte });
        }
        if ("inq" in cond) {
          if (!cond.inq || !Array.isArray(cond.inq))
            throw new import_js_repository10.InvalidOperatorValueError(
              "inq",
              "an Array of possible values",
              cond.inq
            );
          const inq = cond.inq.map((v) => {
            v = this._coerceId(v);
            v = this._coerceDate(v);
            return v;
          });
          opConds.push({ $in: inq });
        }
        if ("nin" in cond) {
          if (!cond.nin || !Array.isArray(cond.nin))
            throw new import_js_repository10.InvalidOperatorValueError(
              "nin",
              "an Array of possible values",
              cond
            );
          const nin = cond.nin.map((v) => {
            v = this._coerceId(v);
            v = this._coerceDate(v);
            return v;
          });
          opConds.push({ $nin: nin });
        }
        if ("between" in cond) {
          if (!Array.isArray(cond.between) || cond.between.length !== 2)
            throw new import_js_repository10.InvalidOperatorValueError(
              "between",
              "an Array of 2 elements",
              cond.between
            );
          const gte = this._coerceDate(cond.between[0]);
          const lte = this._coerceDate(cond.between[1]);
          opConds.push({ $gte: gte, $lte: lte });
        }
        if ("exists" in cond) {
          if (typeof cond.exists !== "boolean")
            throw new import_js_repository10.InvalidOperatorValueError(
              "exists",
              "a Boolean",
              cond.exists
            );
          opConds.push({ $exists: cond.exists });
        }
        if ("like" in cond) {
          if (typeof cond.like !== "string" && !(cond.like instanceof RegExp))
            throw new import_js_repository10.InvalidOperatorValueError(
              "like",
              "a String or RegExp",
              cond.like
            );
          opConds.push({ $regex: (0, import_js_repository6.stringToRegexp)(cond.like) });
        }
        if ("nlike" in cond) {
          if (typeof cond.nlike !== "string" && !(cond.nlike instanceof RegExp))
            throw new import_js_repository10.InvalidOperatorValueError(
              "nlike",
              "a String or RegExp",
              cond.nlike
            );
          opConds.push({ $not: (0, import_js_repository6.stringToRegexp)(cond.nlike) });
        }
        if ("ilike" in cond) {
          if (typeof cond.ilike !== "string" && !(cond.ilike instanceof RegExp))
            throw new import_js_repository10.InvalidOperatorValueError(
              "ilike",
              "a String or RegExp",
              cond.ilike
            );
          opConds.push({ $regex: (0, import_js_repository6.stringToRegexp)(cond.ilike, "i") });
        }
        if ("nilike" in cond) {
          if (typeof cond.nilike !== "string" && !(cond.nilike instanceof RegExp)) {
            throw new import_js_repository10.InvalidOperatorValueError(
              "nilike",
              "a String or RegExp",
              cond.nilike
            );
          }
          opConds.push({ $not: (0, import_js_repository6.stringToRegexp)(cond.nilike, "i") });
        }
        if ("regexp" in cond) {
          if (typeof cond.regexp !== "string" && !(cond.regexp instanceof RegExp)) {
            throw new import_js_repository10.InvalidOperatorValueError(
              "regexp",
              "a String or RegExp",
              cond.regexp
            );
          }
          const flags = cond.flags || void 0;
          if (flags && typeof flags !== "string")
            throw new import_js_repository9.InvalidArgumentError(
              "RegExp flags must be a String, but %v given.",
              cond.flags
            );
          opConds.push({ $regex: (0, import_js_repository6.stringToRegexp)(cond.regexp, flags) });
        }
        if (opConds.length === 1) {
          query[key] = opConds[0];
        } else if (opConds.length > 1) {
          query["$and"] = (_b = query["$and"]) != null ? _b : [];
          opConds.forEach((c) => query["$and"].push({ [key]: c }));
        }
        return;
      }
      query[key] = cond;
    });
    return Object.keys(query).length ? query : void 0;
  }
  /**
   * Create.
   *
   * @param {string} modelName
   * @param {object} modelData
   * @param {object|undefined} filter
   * @returns {Promise<object>}
   */
  async create(modelName, modelData, filter = void 0) {
    const idPropName = this._getIdPropName(modelName);
    const idValue = modelData[idPropName];
    if (idValue == null || idValue === "" || idValue === 0) {
      const pkType = this._getIdType(modelName);
      if (pkType !== import_js_repository4.DataType.STRING && pkType !== import_js_repository4.DataType.ANY)
        throw new import_js_repository9.InvalidArgumentError(
          "MongoDB unable to generate primary keys of %s. Do provide your own value for the %v property or set property type to String.",
          (0, import_js_repository5.capitalize)(pkType),
          idPropName
        );
      delete modelData[idPropName];
    }
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const { insertedId } = await table.insertOne(tableData);
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields
    );
    const insertedData = await table.findOne({ _id: insertedId }, { projection });
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
  async replaceById(modelName, id, modelData, filter = void 0) {
    id = this._coerceId(id);
    const idPropName = this._getIdPropName(modelName);
    modelData[idPropName] = id;
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const { matchedCount } = await table.replaceOne({ _id: id }, tableData);
    if (matchedCount < 1)
      throw new import_js_repository9.InvalidArgumentError("Identifier %v is not found.", String(id));
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields
    );
    const replacedData = await table.findOne({ _id: id }, { projection });
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
  async replaceOrCreate(modelName, modelData, filter = void 0) {
    const idPropName = this._getIdPropName(modelName);
    let idValue = modelData[idPropName];
    idValue = this._coerceId(idValue);
    if (idValue == null || idValue === "" || idValue === 0) {
      const pkType = this._getIdType(modelName);
      if (pkType !== import_js_repository4.DataType.STRING && pkType !== import_js_repository4.DataType.ANY)
        throw new import_js_repository9.InvalidArgumentError(
          "MongoDB unable to generate primary keys of %s. Do provide your own value for the %v property or set property type to String.",
          (0, import_js_repository5.capitalize)(pkType),
          idPropName
        );
      delete modelData[idPropName];
      idValue = void 0;
    }
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    if (idValue == null) {
      const { insertedId } = await table.insertOne(tableData);
      idValue = insertedId;
    } else {
      const { upsertedId } = await table.replaceOne({ _id: idValue }, tableData, {
        upsert: true
      });
      if (upsertedId) idValue = upsertedId;
    }
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields
    );
    const upsertedData = await table.findOne({ _id: idValue }, { projection });
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
  async patch(modelName, modelData, where = void 0) {
    const idPropName = this._getIdPropName(modelName);
    delete modelData[idPropName];
    const query = this._buildQuery(modelName, where) || {};
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const { matchedCount } = await table.updateMany(query, { $set: tableData });
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
  async patchById(modelName, id, modelData, filter = void 0) {
    id = this._coerceId(id);
    const idPropName = this._getIdPropName(modelName);
    delete modelData[idPropName];
    const tableData = this._toDatabase(modelName, modelData);
    const table = this._getCollection(modelName);
    const { matchedCount } = await table.updateOne({ _id: id }, { $set: tableData });
    if (matchedCount < 1)
      throw new import_js_repository9.InvalidArgumentError("Identifier %v is not found.", String(id));
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields
    );
    const patchedData = await table.findOne({ _id: id }, { projection });
    return this._fromDatabase(modelName, patchedData);
  }
  /**
   * Find.
   *
   * @param {string} modelName
   * @param {object|undefined} filter
   * @returns {Promise<object[]>}
   */
  async find(modelName, filter = void 0) {
    filter = filter || {};
    const query = this._buildQuery(modelName, filter.where);
    const sort = this._buildSort(modelName, filter.order);
    const limit = filter.limit || void 0;
    const skip = filter.skip || void 0;
    const projection = this._buildProjection(modelName, filter.fields);
    const collection = this._getCollection(modelName);
    const options = { sort, limit, skip, projection };
    const tableItems = await collection.find(query, options).toArray();
    return tableItems.map((v) => this._fromDatabase(modelName, v));
  }
  /**
   * Find by id.
   *
   * @param {string} modelName
   * @param {string|number} id
   * @param {object|undefined} filter
   * @returns {Promise<object>}
   */
  async findById(modelName, id, filter = void 0) {
    id = this._coerceId(id);
    const table = this._getCollection(modelName);
    const projection = this._buildProjection(
      modelName,
      filter && filter.fields
    );
    const patchedData = await table.findOne({ _id: id }, { projection });
    if (!patchedData)
      throw new import_js_repository9.InvalidArgumentError("Identifier %v is not found.", String(id));
    return this._fromDatabase(modelName, patchedData);
  }
  /**
   * Delete.
   *
   * @param {string} modelName
   * @param {object|undefined} where
   * @returns {Promise<number>}
   */
  async delete(modelName, where = void 0) {
    const table = this._getCollection(modelName);
    const query = this._buildQuery(modelName, where);
    const { deletedCount } = await table.deleteMany(query);
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
    const { deletedCount } = await table.deleteOne({ _id: id });
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
    const result = await table.findOne({ _id: id }, {});
    return result != null;
  }
  /**
   * Count.
   *
   * @param {string} modelName
   * @param {object|undefined} where
   * @returns {Promise<number>}
   */
  async count(modelName, where = void 0) {
    const query = this._buildQuery(modelName, where);
    const table = this._getCollection(modelName);
    return await table.count(query);
  }
};
__name(_MongodbAdapter, "MongodbAdapter");
var MongodbAdapter = _MongodbAdapter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MongodbAdapter
});
