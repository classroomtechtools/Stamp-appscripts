/* Bundle as defined from all files in src/modules/*.js */
const Import = Object.create(null);

'use strict';

(function (exports, window) {

Object.defineProperty(exports, '__esModule', { value: true });

var assign = Object.assign;

var plainObject = function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype;
};

var object = function isObject(arg) {
  var type = typeof arg;
  return Boolean(arg) && (type === 'object' || type === 'function');
};

var array = Array.isArray;

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param dst The object to merge into
 * @param src The object to merge from
 * @returns {*}
 */
function mergeOne(dst, src) {
  if (src === undefined) return dst;

  // According to specification arrays must be concatenated.
  // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
  if (array(src)) return (array(dst) ? dst : []).concat(src);

  // Now deal with non plain 'src' object. 'src' overrides 'dst'
  // Note that functions are also assigned! We do not deep merge functions.
  if (!plainObject(src)) return src;

  // See if 'dst' is allowed to be mutated.
  // If not - it's overridden with a new plain object.
  var returnValue = object(dst) ? dst : {};

  var keys = Object.keys(src);
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];

    var srcValue = src[key];
    // Do not merge properties with the 'undefined' value.
    if (srcValue !== undefined) {
      var dstValue = returnValue[key];
      // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
      var newDst = plainObject(dstValue) || array(srcValue) ? dstValue : {};

      // deep merge each property. Recursion!
      returnValue[key] = mergeOne(newDst, srcValue);
    }
  }

  return returnValue;
}

var merge = function (dst) {
  for (var i = 1; i < arguments.length; i++) {
    dst = mergeOne(dst, arguments[i]);
  }
  return dst;
};

var core = {
  assign: assign,
  merge: merge
};
var core_1 = core.assign;
var core_2 = core.merge;

var _function = function isFunction(arg) {
  return typeof arg === 'function';
};

var stamp = function isStamp(arg) {
  return _function(arg) && _function(arg.compose);
};

// More proper implementation would be
// isDescriptor(obj) || isStamp(obj)
// but there is no sense since stamp is function and function is object.
var composable = object;

var slice = Array.prototype.slice;

/**
 * Creates new factory instance.
 * @returns {Function} The new factory function.
 */
function createFactory() {
  return function Stamp(options) {
    var descriptor = Stamp.compose || {};
    // Next line was optimized for most JS VMs. Please, be careful here!
    var obj = {__proto__: descriptor.methods}; // jshint ignore:line

    merge(obj, descriptor.deepProperties);
    assign(obj, descriptor.properties);
    Object.defineProperties(obj, descriptor.propertyDescriptors || {});

    if (!descriptor.initializers || descriptor.initializers.length === 0) return obj;

    if (options === undefined) options = {};
    var inits = descriptor.initializers;
    var length = inits.length;
    for (var i = 0; i < length; i += 1) {
      var initializer = inits[i];
      if (_function(initializer)) {
        var returnedValue = initializer.call(obj, options,
          {instance: obj, stamp: Stamp, args: slice.apply(arguments)});
        obj = returnedValue === undefined ? obj : returnedValue;
      }
    }

    return obj;
  };
}

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {Compose} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
function createStamp(descriptor, composeFunction) {
  var Stamp = createFactory();

  if (descriptor.staticDeepProperties) {
    merge(Stamp, descriptor.staticDeepProperties);
  }
  if (descriptor.staticProperties) {
    assign(Stamp, descriptor.staticProperties);
  }
  if (descriptor.staticPropertyDescriptors) {
    Object.defineProperties(Stamp, descriptor.staticPropertyDescriptors);
  }

  var composeImplementation = _function(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function _compose() {
    return composeImplementation.apply(this, arguments);
  };
  assign(Stamp.compose, descriptor);

  return Stamp;
}

function concatAssignFunctions(dstObject, srcArray, propName) {
  if (!array(srcArray)) return;

  var length = srcArray.length;
  var dstArray = dstObject[propName] || [];
  dstObject[propName] = dstArray;
  for (var i = 0; i < length; i += 1) {
    var fn = srcArray[i];
    if (_function(fn) && dstArray.indexOf(fn) < 0) {
      dstArray.push(fn);
    }
  }
}


function combineProperties(dstObject, srcObject, propName, action) {
  if (!object(srcObject[propName])) return;
  if (!object(dstObject[propName])) dstObject[propName] = {};
  action(dstObject[propName], srcObject[propName]);
}

function deepMergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, merge);
}
function mergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, assign);
}

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [srcComposable] The composable
 * (either descriptor or stamp) to merge data form.
 */
function mergeComposable(dstDescriptor, srcComposable) {
  var srcDescriptor = (srcComposable && srcComposable.compose) || srcComposable;

  mergeAssign(dstDescriptor, srcDescriptor, 'methods');
  mergeAssign(dstDescriptor, srcDescriptor, 'properties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'propertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticProperties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'staticDeepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticPropertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'configuration');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepConfiguration');
  concatAssignFunctions(dstDescriptor, srcDescriptor.initializers, 'initializers');
  concatAssignFunctions(dstDescriptor, srcDescriptor.composers, 'composers');
}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
var compose = function compose() {
  var descriptor = {};
  var composables = [];
  if (composable(this)) {
    mergeComposable(descriptor, this);
    composables.push(this);
  }

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (composable(arg)) {
      mergeComposable(descriptor, arg);
      composables.push(arg);
    }
  }

  var stamp$1 = createStamp(descriptor, compose);

  var composers = descriptor.composers;
  if (array(composers) && composers.length > 0) {
    for (var j = 0; j < composers.length; j += 1) {
      var composer = composers[j];
      var returnedValue = composer({stamp: stamp$1, composables: composables});
      stamp$1 = stamp(returnedValue) ? returnedValue : stamp$1;
    }
  }

  return stamp$1;
};

function createShortcut(propName) {
  return function (arg) {
    var param = {};
    param[propName] = arg;
    return this && this.compose ? this.compose(param) : compose(param);
  };
}

var properties = createShortcut('properties');
var staticProperties = createShortcut('staticProperties');
var configuration = createShortcut('configuration');
var deepProperties = createShortcut('deepProperties');
var staticDeepProperties = createShortcut('staticDeepProperties');
var deepConfiguration = createShortcut('deepConfiguration');
var initializers = createShortcut('initializers');

var shortcut = compose({
  staticProperties: {
    methods: createShortcut('methods'),

    props: properties,
    properties: properties,

    statics: staticProperties,
    staticProperties: staticProperties,

    conf: configuration,
    configuration: configuration,

    deepProps: deepProperties,
    deepProperties: deepProperties,

    deepStatics: staticDeepProperties,
    staticDeepProperties: staticDeepProperties,

    deepConf: deepConfiguration,
    deepConfiguration: deepConfiguration,

    init: initializers,
    initializers: initializers,

    composers: createShortcut('composers'),

    propertyDescriptors: createShortcut('propertyDescriptors'),

    staticPropertyDescriptors: createShortcut('staticPropertyDescriptors')
  }
});

var string = function isString(arg) {
  return typeof arg === 'string';
};

var concat = Array.prototype.concat;
function extractFunctions() {
  var fns = concat.apply([], arguments).filter(_function);
  return fns.length === 0 ? undefined : fns;
}

function standardiseDescriptor(descr) {
  if (!object(descr)) return descr;

  var methods = descr.methods;
  var properties = descr.properties;
  var props = descr.props;
  var initializers = descr.initializers;
  var init = descr.init;
  var composers = descr.composers;
  var deepProperties = descr.deepProperties;
  var deepProps = descr.deepProps;
  var pd = descr.propertyDescriptors;
  var staticProperties = descr.staticProperties;
  var statics = descr.statics;
  var staticDeepProperties = descr.staticDeepProperties;
  var deepStatics = descr.deepStatics;
  var configuration = descr.configuration;
  var conf = descr.conf;
  var deepConfiguration = descr.deepConfiguration;
  var deepConf = descr.deepConf;

  var p = object(props) || object(properties) ?
    assign({}, props, properties) : undefined;

  var dp = object(deepProps) ? merge({}, deepProps) : undefined;
  dp = object(deepProperties) ? merge(dp, deepProperties) : dp;

  var sp = object(statics) || object(staticProperties) ?
    assign({}, statics, staticProperties) : undefined;

  var sdp = object(deepStatics) ? merge({}, deepStatics) : undefined;
  sdp = object(staticDeepProperties) ? merge(sdp, staticDeepProperties) : sdp;

  var spd = descr.staticPropertyDescriptors;
  if (string(descr.name)) spd = assign({}, spd || {}, { name: { value: descr.name } });

  var c = object(conf) || object(configuration) ?
    assign({}, conf, configuration) : undefined;

  var dc = object(deepConf) ? merge({}, deepConf) : undefined;
  dc = object(deepConfiguration) ? merge(dc, deepConfiguration) : dc;

  var ii = extractFunctions(init, initializers);

  var cc = extractFunctions(composers);

  var descriptor = {};
  if (methods) descriptor.methods = methods;
  if (p) descriptor.properties = p;
  if (ii) descriptor.initializers = ii;
  if (cc) descriptor.composers = cc;
  if (dp) descriptor.deepProperties = dp;
  if (sp) descriptor.staticProperties = sp;
  if (sdp) descriptor.staticDeepProperties = sdp;
  if (pd) descriptor.propertyDescriptors = pd;
  if (spd) descriptor.staticPropertyDescriptors = spd;
  if (c) descriptor.configuration = c;
  if (dc) descriptor.deepConfiguration = dc;

  return descriptor;
}

function stampit() {
  var length = arguments.length, args = [];
  for (var i = 0; i < length; i += 1) {
    var arg = arguments[i];
    args.push(stamp(arg) ? arg : standardiseDescriptor(arg));
  }

  return compose.apply(this || baseStampit, args); // jshint ignore:line
}

var baseStampit = shortcut.compose({
  staticProperties: {
    create: function () { return this.apply(this, arguments); },
    compose: stampit // infecting
  }
});

var shortcuts = shortcut.compose.staticProperties;
for (var prop in shortcuts) stampit[prop] = shortcuts[prop].bind(baseStampit);
stampit.compose = stampit.bind();

var it = stampit;

exports.assign = core_1;
exports.merge = core_2;
exports.stampit = it;

})(Import, this);
try{exports.Import = Import;}catch(e){}
