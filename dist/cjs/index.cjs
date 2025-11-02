var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.js
var index_exports = {};
__export(index_exports, {
  MongodbAdapter: () => MongodbAdapter
});
module.exports = __toCommonJS(index_exports);

// src/mongodb-adapter.js
var import_mongodb2 = require("mongodb");
var import_mongodb3 = require("mongodb");

// node_modules/@e22m4u/js-service/src/errors/invalid-argument-error.js
var import_js_format = require("@e22m4u/js-format");
var _InvalidArgumentError = class _InvalidArgumentError extends import_js_format.Errorf {
};
__name(_InvalidArgumentError, "InvalidArgumentError");
var InvalidArgumentError = _InvalidArgumentError;

// node_modules/@e22m4u/js-service/src/service-container.js
var SERVICE_CONTAINER_CLASS_NAME = "ServiceContainer";
var _ServiceContainer = class _ServiceContainer {
  /**
   * Services map.
   *
   * @type {Map<any, any>}
   * @private
   */
  _services = /* @__PURE__ */ new Map();
  /**
   * Parent container.
   *
   * @type {ServiceContainer}
   * @private
   */
  _parent;
  /**
   * Constructor.
   *
   * @param {ServiceContainer|undefined} parent
   */
  constructor(parent = void 0) {
    if (parent != null) {
      if (!(parent instanceof _ServiceContainer))
        throw new InvalidArgumentError(
          'The provided parameter "parent" of ServicesContainer.constructor must be an instance ServiceContainer, but %v given.',
          parent
        );
      this._parent = parent;
    }
  }
  /**
   * Получить родительский сервис-контейнер или выбросить ошибку.
   *
   * @returns {ServiceContainer}
   */
  getParent() {
    if (!this._parent)
      throw new InvalidArgumentError("The service container has no parent.");
    return this._parent;
  }
  /**
   * Проверить наличие родительского сервис-контейнера.
   *
   * @returns {boolean}
   */
  hasParent() {
    return Boolean(this._parent);
  }
  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  get(ctor, ...args) {
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.get must be a class constructor, but %v given.",
        ctor
      );
    const isCtorRegistered = this._services.has(ctor);
    let service = this._services.get(ctor);
    let inheritedCtor = void 0;
    if (!service) {
      const ctors = Array.from(this._services.keys());
      inheritedCtor = ctors.find((v) => v.prototype instanceof ctor);
      if (inheritedCtor) service = this._services.get(inheritedCtor);
    }
    if (!service && !isCtorRegistered && !inheritedCtor && this._parent && this._parent.has(ctor)) {
      return this._parent.get(ctor, ...args);
    }
    if (!isCtorRegistered && inheritedCtor) {
      ctor = inheritedCtor;
    }
    if (!service || args.length) {
      service = Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME) ? new ctor(this, ...args) : new ctor(...args);
      this._services.set(ctor, service);
    } else if (typeof service === "function") {
      service = service();
      this._services.set(ctor, service);
    }
    return service;
  }
  /**
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getRegistered(ctor, ...args) {
    if (!this.has(ctor))
      throw new InvalidArgumentError(
        "The constructor %v is not registered.",
        ctor
      );
    return this.get(ctor, ...args);
  }
  /**
   * Проверить существование конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  has(ctor) {
    if (this._services.has(ctor)) return true;
    const ctors = Array.from(this._services.keys());
    const inheritedCtor = ctors.find((v) => v.prototype instanceof ctor);
    if (inheritedCtor) return true;
    if (this._parent) return this._parent.has(ctor);
    return false;
  }
  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  add(ctor, ...args) {
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.add must be a class constructor, but %v given.",
        ctor
      );
    const factory = /* @__PURE__ */ __name(() => Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME) ? new ctor(this, ...args) : new ctor(...args), "factory");
    this._services.set(ctor, factory);
    return this;
  }
  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  use(ctor, ...args) {
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.use must be a class constructor, but %v given.",
        ctor
      );
    const service = Array.isArray(ctor.kinds) && ctor.kinds.includes(SERVICE_CLASS_NAME) ? new ctor(this, ...args) : new ctor(...args);
    this._services.set(ctor, service);
    return this;
  }
  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @param {*} ctor
   * @param {*} service
   * @returns {this}
   */
  set(ctor, service) {
    if (!ctor || typeof ctor !== "function")
      throw new InvalidArgumentError(
        "The first argument of ServicesContainer.set must be a class constructor, but %v given.",
        ctor
      );
    if (!service || typeof service !== "object" || Array.isArray(service))
      throw new InvalidArgumentError(
        "The second argument of ServicesContainer.set must be an Object, but %v given.",
        service
      );
    this._services.set(ctor, service);
    return this;
  }
  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @param {function(Function, ServiceContainer): boolean} predicate
   * @param {boolean} noParent
   * @returns {*}
   */
  find(predicate, noParent = false) {
    if (typeof predicate !== "function") {
      throw new InvalidArgumentError(
        "The first argument of ServiceContainer.find must be a function, but %v given.",
        predicate
      );
    }
    const isRecursive = !noParent;
    let currentContainer = this;
    do {
      for (const ctor of currentContainer._services.keys()) {
        if (predicate(ctor, currentContainer) === true) {
          return this.get(ctor);
        }
      }
      if (isRecursive && currentContainer.hasParent()) {
        currentContainer = currentContainer.getParent();
      } else {
        currentContainer = null;
      }
    } while (currentContainer);
    return void 0;
  }
};
__name(_ServiceContainer, "ServiceContainer");
/**
 * Kinds.
 *
 * @type {string[]}
 */
__publicField(_ServiceContainer, "kinds", [SERVICE_CONTAINER_CLASS_NAME]);
var ServiceContainer = _ServiceContainer;

// node_modules/@e22m4u/js-service/src/utils/is-service-container.js
function isServiceContainer(container) {
  return Boolean(
    container && typeof container === "object" && typeof container.constructor === "function" && Array.isArray(container.constructor.kinds) && container.constructor.kinds.includes(SERVICE_CONTAINER_CLASS_NAME)
  );
}
__name(isServiceContainer, "isServiceContainer");

// node_modules/@e22m4u/js-service/src/service.js
var SERVICE_CLASS_NAME = "Service";
var _Service = class _Service {
  /**
   * Container.
   *
   * @type {ServiceContainer}
   */
  container;
  /**
   * Constructor.
   *
   * @param {ServiceContainer|undefined} container
   */
  constructor(container = void 0) {
    this.container = isServiceContainer(container) ? container : new ServiceContainer();
  }
  /**
   * Получить существующий или новый экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getService(ctor, ...args) {
    return this.container.get(ctor, ...args);
  }
  /**
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {*}
   */
  getRegisteredService(ctor, ...args) {
    return this.container.getRegistered(ctor, ...args);
  }
  /**
   * Проверка существования конструктора в контейнере.
   *
   * @param {*} ctor
   * @returns {boolean}
   */
  hasService(ctor) {
    return this.container.has(ctor);
  }
  /**
   * Добавить конструктор в контейнер.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  addService(ctor, ...args) {
    this.container.add(ctor, ...args);
    return this;
  }
  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @param {*} ctor
   * @param {*} args
   * @returns {this}
   */
  useService(ctor, ...args) {
    this.container.use(ctor, ...args);
    return this;
  }
  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @param {*} ctor
   * @param {*} service
   * @returns {this}
   */
  setService(ctor, service) {
    this.container.set(ctor, service);
    return this;
  }
  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @param {function(Function, ServiceContainer): boolean} predicate
   * @param {boolean} noParent
   * @returns {*}
   */
  findService(predicate, noParent = false) {
    return this.container.find(predicate, noParent);
  }
};
__name(_Service, "Service");
/**
 * Kinds.
 *
 * @type {string[]}
 */
__publicField(_Service, "kinds", [SERVICE_CLASS_NAME]);
var Service = _Service;

// node_modules/@e22m4u/js-debug/src/utils/to-camel-case.js
function toCamelCase(input) {
  return input.replace(/(^\w|[A-Z]|\b\w)/g, (c) => c.toUpperCase()).replace(/\W+/g, "").replace(/(^\w)/g, (c) => c.toLowerCase());
}
__name(toCamelCase, "toCamelCase");

// node_modules/@e22m4u/js-debug/src/utils/is-non-array-object.js
function isNonArrayObject(input) {
  return Boolean(input && typeof input === "object" && !Array.isArray(input));
}
__name(isNonArrayObject, "isNonArrayObject");

// node_modules/@e22m4u/js-debug/src/utils/generate-random-hex.js
function generateRandomHex(length = 4) {
  if (length <= 0) {
    return "";
  }
  const firstCharCandidates = "abcdef";
  const restCharCandidates = "0123456789abcdef";
  let result = "";
  const firstCharIndex = Math.floor(Math.random() * firstCharCandidates.length);
  result += firstCharCandidates[firstCharIndex];
  for (let i = 1; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * restCharCandidates.length);
    result += restCharCandidates[randomIndex];
  }
  return result;
}
__name(generateRandomHex, "generateRandomHex");

// node_modules/@e22m4u/js-debug/src/debuggable.js
var _Debuggable = class _Debuggable {
  /**
   * Debug.
   *
   * @type {Function}
   */
  debug;
  /**
   * Ctor Debug.
   *
   * @type {Function}
   */
  ctorDebug;
  /**
   * Возвращает функцию-отладчик с сегментом пространства имен
   * указанного в параметре метода.
   *
   * @param {Function} method
   * @returns {Function}
   */
  getDebuggerFor(method) {
    const name = method.name || "anonymous";
    return this.debug.withHash().withNs(name);
  }
  /**
   * Constructor.
   *
   * @param {DebuggableOptions|undefined} options
   */
  constructor(options = void 0) {
    const className = toCamelCase(this.constructor.name);
    options = typeof options === "object" && options || {};
    const namespace = options.namespace && String(options.namespace) || void 0;
    if (namespace) {
      this.debug = createDebugger(namespace, className);
    } else {
      this.debug = createDebugger(className);
    }
    const noEnvironmentNamespace = Boolean(options.noEnvironmentNamespace);
    if (noEnvironmentNamespace) this.debug = this.debug.withoutEnvNs();
    this.ctorDebug = this.debug.withNs("constructor").withHash();
    const noInstantiationMessage = Boolean(options.noInstantiationMessage);
    if (!noInstantiationMessage)
      this.ctorDebug(_Debuggable.INSTANTIATION_MESSAGE);
  }
};
__name(_Debuggable, "Debuggable");
/**
 * Instantiation message;
 *
 * @type {string}
 */
__publicField(_Debuggable, "INSTANTIATION_MESSAGE", "Instantiated.");
var Debuggable = _Debuggable;

// node_modules/@e22m4u/js-debug/src/create-debugger.js
var import_js_format2 = require("@e22m4u/js-format");
var import_js_format3 = require("@e22m4u/js-format");

// node_modules/@e22m4u/js-debug/src/create-colorized-dump.js
var import_util = require("util");
var INSPECT_OPTIONS = {
  showHidden: false,
  depth: null,
  colors: true,
  compact: false
};
function createColorizedDump(value) {
  return (0, import_util.inspect)(value, INSPECT_OPTIONS);
}
__name(createColorizedDump, "createColorizedDump");

// node_modules/@e22m4u/js-debug/src/create-debugger.js
var AVAILABLE_COLORS = [
  20,
  21,
  26,
  27,
  32,
  33,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  56,
  57,
  62,
  63,
  68,
  69,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  92,
  93,
  98,
  99,
  112,
  113,
  128,
  129,
  134,
  135,
  148,
  149,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  178,
  179,
  184,
  185,
  196,
  197,
  198,
  199,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  209,
  214,
  215,
  220,
  221
];
var DEFAULT_OFFSET_STEP_SPACES = 2;
function pickColorCode(input) {
  if (typeof input !== "string")
    throw new import_js_format2.Errorf(
      'The parameter "input" of the function pickColorCode must be a String, but %v given.',
      input
    );
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return AVAILABLE_COLORS[Math.abs(hash) % AVAILABLE_COLORS.length];
}
__name(pickColorCode, "pickColorCode");
function wrapStringByColorCode(input, color) {
  if (typeof input !== "string")
    throw new import_js_format2.Errorf(
      'The parameter "input" of the function wrapStringByColorCode must be a String, but %v given.',
      input
    );
  if (typeof color !== "number")
    throw new import_js_format2.Errorf(
      'The parameter "color" of the function wrapStringByColorCode must be a Number, but %v given.',
      color
    );
  const colorCode = "\x1B[3" + (Number(color) < 8 ? color : "8;5;" + color);
  return `${colorCode};1m${input}\x1B[0m`;
}
__name(wrapStringByColorCode, "wrapStringByColorCode");
function matchPattern(pattern, input) {
  if (typeof pattern !== "string")
    throw new import_js_format2.Errorf(
      'The parameter "pattern" of the function matchPattern must be a String, but %v given.',
      pattern
    );
  if (typeof input !== "string")
    throw new import_js_format2.Errorf(
      'The parameter "input" of the function matchPattern must be a String, but %v given.',
      input
    );
  const regexpStr = pattern.replace(/\*/g, ".*?");
  const regexp = new RegExp("^" + regexpStr + "$");
  return regexp.test(input);
}
__name(matchPattern, "matchPattern");
function createDebugger(namespaceOrOptions = void 0, ...namespaceSegments) {
  if (namespaceOrOptions && typeof namespaceOrOptions !== "string" && !isNonArrayObject(namespaceOrOptions)) {
    throw new import_js_format2.Errorf(
      'The parameter "namespace" of the function createDebugger must be a String or an Object, but %v given.',
      namespaceOrOptions
    );
  }
  const withCustomState = isNonArrayObject(namespaceOrOptions);
  const state = withCustomState ? namespaceOrOptions : {};
  state.envNsSegments = Array.isArray(state.envNsSegments) ? state.envNsSegments : [];
  state.nsSegments = Array.isArray(state.nsSegments) ? state.nsSegments : [];
  state.pattern = typeof state.pattern === "string" ? state.pattern : "";
  state.hash = typeof state.hash === "string" ? state.hash : "";
  state.offsetSize = typeof state.offsetSize === "number" ? state.offsetSize : 0;
  state.offsetStep = typeof state.offsetStep !== "string" ? " ".repeat(DEFAULT_OFFSET_STEP_SPACES) : state.offsetStep;
  state.delimiter = state.delimiter && typeof state.delimiter === "string" ? state.delimiter : ":";
  if (!withCustomState) {
    if (typeof process !== "undefined" && process.env && process.env["DEBUGGER_NAMESPACE"]) {
      state.envNsSegments.push(process.env.DEBUGGER_NAMESPACE);
    }
    if (typeof namespaceOrOptions === "string")
      state.nsSegments.push(namespaceOrOptions);
  }
  namespaceSegments.forEach((segment) => {
    if (!segment || typeof segment !== "string")
      throw new import_js_format2.Errorf(
        "Namespace segment must be a non-empty String, but %v given.",
        segment
      );
    state.nsSegments.push(segment);
  });
  if (typeof process !== "undefined" && process.env && process.env["DEBUG"]) {
    state.pattern = process.env["DEBUG"];
  } else if (typeof localStorage !== "undefined" && typeof localStorage.getItem("debug") === "string") {
    state.pattern = localStorage.getItem("debug");
  }
  const isDebuggerEnabled = /* @__PURE__ */ __name(() => {
    const nsStr = [...state.envNsSegments, ...state.nsSegments].join(
      state.delimiter
    );
    const patterns = state.pattern.split(/[\s,]+/).filter((p) => p.length > 0);
    if (patterns.length === 0 && state.pattern !== "*") return false;
    for (const singlePattern of patterns) {
      if (matchPattern(singlePattern, nsStr)) return true;
    }
    return false;
  }, "isDebuggerEnabled");
  const getPrefix = /* @__PURE__ */ __name(() => {
    let tokens = [];
    [...state.envNsSegments, ...state.nsSegments, state.hash].filter(Boolean).forEach((token) => {
      const extractedTokens = token.split(state.delimiter).filter(Boolean);
      tokens = [...tokens, ...extractedTokens];
    });
    let res = tokens.reduce((acc, token, index) => {
      const isLast = tokens.length - 1 === index;
      const tokenColor = pickColorCode(token);
      acc += wrapStringByColorCode(token, tokenColor);
      if (!isLast) acc += state.delimiter;
      return acc;
    }, "");
    if (state.offsetSize > 0) res += state.offsetStep.repeat(state.offsetSize);
    return res;
  }, "getPrefix");
  function debugFn(messageOrData, ...args) {
    if (!isDebuggerEnabled()) return;
    const prefix = getPrefix();
    const multiString = (0, import_js_format3.format)(messageOrData, ...args);
    const rows = multiString.split("\n");
    rows.forEach((message) => {
      prefix ? console.log(`${prefix} ${message}`) : console.log(message);
    });
  }
  __name(debugFn, "debugFn");
  debugFn.withNs = function(namespace, ...args) {
    const stateCopy = JSON.parse(JSON.stringify(state));
    [namespace, ...args].forEach((ns) => {
      if (!ns || typeof ns !== "string")
        throw new import_js_format2.Errorf(
          "Debugger namespace must be a non-empty String, but %v given.",
          ns
        );
      stateCopy.nsSegments.push(ns);
    });
    return createDebugger(stateCopy);
  };
  debugFn.withHash = function(hashLength = 4) {
    const stateCopy = JSON.parse(JSON.stringify(state));
    if (!hashLength || typeof hashLength !== "number" || hashLength < 1) {
      throw new import_js_format2.Errorf(
        "Debugger hash must be a positive Number, but %v given.",
        hashLength
      );
    }
    stateCopy.hash = generateRandomHex(hashLength);
    return createDebugger(stateCopy);
  };
  debugFn.withOffset = function(offsetSize) {
    const stateCopy = JSON.parse(JSON.stringify(state));
    if (!offsetSize || typeof offsetSize !== "number" || offsetSize < 1) {
      throw new import_js_format2.Errorf(
        "Debugger offset must be a positive Number, but %v given.",
        offsetSize
      );
    }
    stateCopy.offsetSize = offsetSize;
    return createDebugger(stateCopy);
  };
  debugFn.withoutEnvNs = function() {
    const stateCopy = JSON.parse(JSON.stringify(state));
    stateCopy.envNsSegments = [];
    return createDebugger(stateCopy);
  };
  debugFn.inspect = function(valueOrDesc, ...args) {
    if (!isDebuggerEnabled()) return;
    const prefix = getPrefix();
    let multiString = "";
    if (typeof valueOrDesc === "string" && args.length) {
      multiString += `${valueOrDesc}
`;
      const multilineDump = args.map((v) => createColorizedDump(v)).join("\n");
      const dumpRows = multilineDump.split("\n");
      multiString += dumpRows.map((v) => `${state.offsetStep}${v}`).join("\n");
    } else {
      multiString += [valueOrDesc, ...args].map((v) => createColorizedDump(v)).join("\n");
    }
    const rows = multiString.split("\n");
    rows.forEach((message) => {
      prefix ? console.log(`${prefix} ${message}`) : console.log(message);
    });
  };
  debugFn.state = state;
  return debugFn;
}
__name(createDebugger, "createDebugger");

// node_modules/@e22m4u/js-service/src/debuggable-service.js
var _DebuggableService = class _DebuggableService extends Debuggable {
  /**
   * Service.
   *
   * @type {Service}
   */
  _service;
  /**
   * Container.
   *
   * @type {ServiceContainer}
   */
  get container() {
    return this._service.container;
  }
  /**
   * Получить существующий или новый экземпляр.
   *
   * @type {Service['getService']}
   */
  get getService() {
    return this._service.getService;
  }
  /**
   * Получить существующий или новый экземпляр,
   * только если конструктор зарегистрирован.
   *
   * @type {Service['getRegisteredService']}
   */
  get getRegisteredService() {
    return this._service.getRegisteredService;
  }
  /**
   * Проверка существования конструктора в контейнере.
   *
   * @type {Service['hasService']}
   */
  get hasService() {
    return this._service.hasService;
  }
  /**
   * Добавить конструктор в контейнер.
   *
   * @type {Service['addService']}
   */
  get addService() {
    return this._service.addService;
  }
  /**
   * Добавить конструктор и создать экземпляр.
   *
   * @type {Service['useService']}
   */
  get useService() {
    return this._service.useService;
  }
  /**
   * Добавить конструктор и связанный экземпляр.
   *
   * @type {Service['setService']}
   */
  get setService() {
    return this._service.setService;
  }
  /**
   * Найти сервис удовлетворяющий условию.
   *
   * @type {Service['findService']}
   */
  get findService() {
    return this._service.findService;
  }
  /**
   * Constructor.
   *
   * @param {ServiceContainer|undefined} container
   * @param {import('@e22m4u/js-debug').DebuggableOptions|undefined} options
   */
  constructor(container = void 0, options = void 0) {
    super(options);
    this._service = new Service(container);
  }
};
__name(_DebuggableService, "DebuggableService");
/**
 * Kinds.
 *
 * @type {string[]}
 */
__publicField(_DebuggableService, "kinds", Service.kinds);
var DebuggableService = _DebuggableService;

// src/mongodb-adapter.js
var import_js_repository3 = require("@e22m4u/js-repository");

// src/utils/pluralize.js
var singularExceptions = [
  /access$/i,
  /address$/i,
  /alias$/i,
  /bonus$/i,
  /boss$/i,
  /bus$/i,
  /business$/i,
  /canvas$/i,
  /class$/i,
  /cross$/i,
  /dress$/i,
  /focus$/i,
  /gas$/i,
  /glass$/i,
  /kiss$/i,
  /lens$/i,
  /loss$/i,
  /pass$/i,
  /plus$/i,
  /process$/i,
  /status$/i,
  /success$/i,
  /virus$/i
];
function pluralize(input) {
  if (!input || typeof input !== "string") {
    return input;
  }
  if (/s$/i.test(input) && !singularExceptions.some((re) => re.test(input))) {
    return input;
  }
  const lastChar = input.slice(-1);
  const isLastCharUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
  if (/(s|x|z|ch|sh)$/i.test(input)) {
    return input + (isLastCharUpper ? "ES" : "es");
  }
  if (/[^aeiou]y$/i.test(input)) {
    return input.slice(0, -1) + (isLastCharUpper ? "IES" : "ies");
  }
  return input + (isLastCharUpper ? "S" : "s");
}
__name(pluralize, "pluralize");

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

// src/utils/to-camel-case.js
function toCamelCase2(input) {
  if (!input) return "";
  const spacedString = String(input).replace(/([-_])/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  const intermediateCased = spacedString.toLowerCase().replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/\s/g, "");
  if (!intermediateCased) return "";
  return intermediateCased.charAt(0).toLowerCase() + intermediateCased.slice(1);
}
__name(toCamelCase2, "toCamelCase");

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

// src/utils/model-name-to-collection-name.js
function modelNameToCollectionName(modelName) {
  const ccName = toCamelCase2(modelName);
  const woModel = ccName.replace(/Model$/i, "");
  if (woModel.length <= 2) {
    return pluralize(ccName);
  }
  return pluralize(woModel);
}
__name(modelNameToCollectionName, "modelNameToCollectionName");

// src/mongodb-adapter.js
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
    const options = (0, import_js_repository3.selectObjectKeys)(this.settings, MONGODB_OPTION_NAMES);
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
    return this.getService(import_js_repository3.ModelDefinitionUtils).getPrimaryKeyAsPropertyName(
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
    return this.getService(import_js_repository3.ModelDefinitionUtils).getPrimaryKeyAsColumnName(
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
      import_js_repository3.ModelDefinitionUtils
    ).convertPropertyNamesToColumnNames(modelName, modelData);
    const idColName = this._getIdColName(modelName);
    if (idColName !== "id" && idColName !== "_id")
      throw new import_js_repository3.InvalidArgumentError(
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
        throw new import_js_repository3.InvalidArgumentError(
          'MongoDB is not supporting custom names of the primary key. Do use "id" as a primary key instead of %v.',
          idColName
        );
      if (idColName !== "_id") {
        tableData[idColName] = tableData._id;
        delete tableData._id;
      }
    }
    const modelData = this.getService(
      import_js_repository3.ModelDefinitionUtils
    ).convertColumnNamesToPropertyNames(modelName, tableData);
    return transformValuesDeep(modelData, (value) => {
      if (value instanceof import_mongodb2.ObjectId) return String(value);
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
    const modelDef = this.getService(import_js_repository3.DefinitionRegistry).getModel(modelName);
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
    collection = this.client.db(this.settings.database).collection(collectionName);
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
    const utils = this.getService(import_js_repository3.ModelDefinitionUtils);
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
      throw new import_js_repository3.InvalidArgumentError(
        "Property name must be a non-empty String, but %v given.",
        propName
      );
    const utils = this.getService(import_js_repository3.ModelDefinitionUtils);
    let colName = propName;
    try {
      colName = utils.getColumnNameByPropertyName(modelName, propName);
    } catch (error) {
      if (!(error instanceof import_js_repository3.InvalidArgumentError) || error.message.indexOf("does not have the property") === -1) {
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
      throw new import_js_repository3.InvalidArgumentError(
        "Model name must be a non-empty String, but %v given.",
        modelName
      );
    if (!propsChain || typeof propsChain !== "string")
      throw new import_js_repository3.InvalidArgumentError(
        "Properties chain must be a non-empty String, but %v given.",
        propsChain
      );
    propsChain = propsChain.replace(/\.{2,}/g, ".");
    const propNames = propsChain.split(".");
    const utils = this.getService(import_js_repository3.ModelDefinitionUtils);
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
        throw new import_js_repository3.InvalidArgumentError(
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
        throw new import_js_repository3.InvalidArgumentError(
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
          if (!(error instanceof import_js_repository3.InvalidArgumentError) || error.message.indexOf("does not have the property") === -1) {
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
      throw new import_js_repository3.InvalidArgumentError(
        'The provided option "where" should be an Object, but %v given.',
        clause
      );
    const query = {};
    const idPropName = this._getIdPropName(modelName);
    Object.keys(clause).forEach((key) => {
      var _a, _b;
      if (String(key).indexOf("$") !== -1)
        throw new import_js_repository3.InvalidArgumentError(
          'The symbol "$" is not supported, but %v given.',
          key
        );
      let cond = clause[key];
      if (key === "and" || key === "or" || key === "nor") {
        if (cond == null) return;
        if (!Array.isArray(cond))
          throw new import_js_repository3.InvalidOperatorValueError(key, "an Array", cond);
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
            throw new import_js_repository3.InvalidOperatorValueError(
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
            throw new import_js_repository3.InvalidOperatorValueError(
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
            throw new import_js_repository3.InvalidOperatorValueError(
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
            throw new import_js_repository3.InvalidOperatorValueError(
              "exists",
              "a Boolean",
              cond.exists
            );
          opConds.push({ $exists: cond.exists });
        }
        if ("like" in cond) {
          if (typeof cond.like !== "string" && !(cond.like instanceof RegExp))
            throw new import_js_repository3.InvalidOperatorValueError(
              "like",
              "a String or RegExp",
              cond.like
            );
          opConds.push({ $regex: (0, import_js_repository3.likeToRegexp)(cond.like) });
        }
        if ("nlike" in cond) {
          if (typeof cond.nlike !== "string" && !(cond.nlike instanceof RegExp))
            throw new import_js_repository3.InvalidOperatorValueError(
              "nlike",
              "a String or RegExp",
              cond.nlike
            );
          opConds.push({ $not: (0, import_js_repository3.likeToRegexp)(cond.nlike) });
        }
        if ("ilike" in cond) {
          if (typeof cond.ilike !== "string" && !(cond.ilike instanceof RegExp))
            throw new import_js_repository3.InvalidOperatorValueError(
              "ilike",
              "a String or RegExp",
              cond.ilike
            );
          opConds.push({ $regex: (0, import_js_repository3.likeToRegexp)(cond.ilike, true) });
        }
        if ("nilike" in cond) {
          if (typeof cond.nilike !== "string" && !(cond.nilike instanceof RegExp)) {
            throw new import_js_repository3.InvalidOperatorValueError(
              "nilike",
              "a String or RegExp",
              cond.nilike
            );
          }
          opConds.push({ $not: (0, import_js_repository3.likeToRegexp)(cond.nilike, true) });
        }
        if ("regexp" in cond) {
          if (typeof cond.regexp !== "string" && !(cond.regexp instanceof RegExp)) {
            throw new import_js_repository3.InvalidOperatorValueError(
              "regexp",
              "a String or RegExp",
              cond.regexp
            );
          }
          const flags = cond.flags || void 0;
          if (flags && typeof flags !== "string")
            throw new import_js_repository3.InvalidArgumentError(
              "RegExp flags must be a String, but %v given.",
              cond.flags
            );
          opConds.push({ $regex: (0, import_js_repository3.stringToRegexp)(cond.regexp, flags) });
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
      if (pkType !== import_js_repository3.DataType.STRING && pkType !== import_js_repository3.DataType.ANY)
        throw new import_js_repository3.InvalidArgumentError(
          "MongoDB unable to generate primary keys of %s. Do provide your own value for the %v property or set property type to String.",
          (0, import_js_repository3.capitalize)(pkType),
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
      throw new import_js_repository3.InvalidArgumentError("Identifier %v is not found.", String(id));
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
      if (pkType !== import_js_repository3.DataType.STRING && pkType !== import_js_repository3.DataType.ANY)
        throw new import_js_repository3.InvalidArgumentError(
          "MongoDB unable to generate primary keys of %s. Do provide your own value for the %v property or set property type to String.",
          (0, import_js_repository3.capitalize)(pkType),
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
      throw new import_js_repository3.InvalidArgumentError("Identifier %v is not found.", String(id));
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
      throw new import_js_repository3.InvalidArgumentError("Identifier %v is not found.", String(id));
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
    return await table.countDocuments(query);
  }
};
__name(_MongodbAdapter, "MongodbAdapter");
var MongodbAdapter = _MongodbAdapter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MongodbAdapter
});
