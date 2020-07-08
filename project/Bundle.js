/* Bundle as defined from all files in src/modules/*.js */
const Import = Object.create(null);

'use strict';

(function (exports, window) {

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * EnforceParameters
   A V8 GAS library which enables the ability for the developer to guarantee that functions receive arguments that match the expected types and values.
   https://github.com/classroomtechtools/EnforceArguments
 *
 * @author Adam Morris classroomtechtools.ctt@gmail.com https://classroomtechtools.com
 * @copyright May 2020
 * @license MIT
 * @version 2.5
 */

function throwError_(message) {
   throw new TypeError(message);
}

class Enforce_ {
  constructor (params, name) {
    /**
     * Save the name and param object
     * converting values to lowercase
     * @param {String} name
     * @param {Object<String>} params
     */
    this.name = name;
    const required = this.required = [];
    this.params = Object.entries(params).reduce(
      function (acc, [key, value]) {
        const type_ = typeof value;
        if (type_ === 'function') { // assume it's a class
          acc[key] = value;
        } else if (type_ === 'string') {
          if (value[0] === '!') {
            required.push(key);
            acc[key] = value.slice(1).toLowerCase();
          } else {
            acc[key] = value.toLowerCase();
          }
        } else {
          throw new Error(`Passed unknown value ${value}`);
        }
        return acc;
      }, {}
    );
  }

  static new (...params) {
    return new Enforce_(...params);
  }

  get req() {
    throwError_(`${this.name} is missing a required argument`);
  }

  extra(kwargs) {
    if (Object.entries(kwargs).length > 0)
      throwError_(`Unknown parameter(s) passed to ${this.name}: ${Object.keys(kwargs)}`);
  }

  enforceRequiredParams (passed) {
    const missing = this.required.filter(x => !passed.includes(x));
    if (missing.length > 0)
      throwError_(`Required arguments in ${this.name} not recieved: ${missing}`);
  }

  enforceNamed (args) {
    /**
     * Takes args in format of destructured arguments ([0] => {name, value}) and does typechecks, required checks, and arity checks
     */
    const named = {};
    for (const key in args) {
      for (const name in args[key]) {
        named[name] = args[key][name];
      }
    }
    this.typecheck(named, true, true);  // typecheck for named means we need to ensure no undefined and no extra

    return named;
  }

  enforcePositional (args) {
    /**
     * Take args in format of positional arguments ([0] => value), convert them to format for typecheck
     * This works because javascript objects, as long as all of the keys are non-numerical (which we can assume)
     *   retain the order by insertion
     */
    if (args === undefined) throwError_('Pass "arguments" to  enforcePositional');
    const keys = Object.keys(this.params);

    // convert positional to required format by typecheck
    const named = keys.reduce(
      (acc, key, index) => {
        if (index >= args.length) return acc;
        acc[key] = args[index];
        return acc;
      }, {}
    );

    this.typecheck(named, false, false);  // typecheck for positional means undefined needs to squeak through, check for extra is done here instead

    // Now check for arity as this will be missed in above
    if (args.length > keys.length) throwError_(`Too many arguments to ${this.name}. Recieved ${args.length} but expected ${Object.keys(this.params).length}`);

    return named;
  }

  /**
   * Validates args in key => value format
   */
  typecheck(argObj, checkUndefined=true, checkExtra=true) {
    this.enforceRequiredParams(Object.keys(argObj));

    for (const prop in this.params) {
      if (!argObj.hasOwnProperty(prop)) continue;
      const av = argObj[prop], klass = this.params[prop];  // actual value, klass (either passed directly or converted from instance)
      if (klass === null || av == null) continue;       // ensure all null values are not subject to checks
      if (av === undefined) {
        if (checkUndefined) throwError_(`"undefined" was passed to ${this.name} for ${prop}`);
        continue;
      }
      const at = typeof av,    et = this.params[prop];     // actual type, expected type
      if (et === 'any') continue;  // type of 'any' special meaning is to skip it
      if (typeof et === 'function') {
        if (!(av instanceof klass)) throwError_(`Expected instance of class ${this.params[prop].name} in ${this.name} but got ${av.constructor.name} instead`);
        continue;
      }
      if (et === 'array') {
        // arrays don't respond to typeof why javascript why
        if (!Array.isArray(argObj[prop])) throwError_(`Type mismatch in ${this.name}: "${prop}". Expected array but got ${at}`);
      } else if (at !== et) {
        throwError_(`Type mismatch in ${this.name}: "${prop}". Expected ${this.params[prop]} but got ${av} instead`);
      }
    }

    if (checkExtra) {
      // this is an option because positional arguments need a different kind of check for extra, no need to go here
      const paramSet = new Set(Object.keys(this.params));
      const extra = Object.keys(argObj).filter(x => !paramSet.has(x)).reduce(
        function (acc, key) {
          acc[key] = argObj[key];
          return acc;
        }, {}
      );
      this.extra(extra);
    }
  }

  static selfcheck (args) {
    const Me = Enforce_.new({parameters: '!object', name: '!string'}, 'Enforce.create');
    Me.enforcePositional(args);
  }
}


/**
 * @param {String} name
 * @param {Object} parameters
 * @return {EnforceObject}
 */
function create (parameters, name) {
  /**
   * Parameters is an object whose keys are parameters in the function you are augmenting.
   * Values determine the type, one of {number, string, boolean, object, any, array}
   *   (to indicate an instance of a class, value can be Class)
   * @example Enforce.create({id: '!number', name: '!string'}, '<name>');
   */
  if (name === null) throwError_('Enforce.create "name" cannot be null did you mean empty string instead?');
  if (parameters === null) throwError_('Enforce.create "parameters" cannot be null');
  Enforce_.selfcheck(arguments);
  return Enforce_.new(parameters, name);
}

/**
 * @param {Array} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function named (args, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throwError_("Enforce.named needs parameters as object");
  comment = comment || '<>';
  const him = Enforce_.new(parameters, comment);
  return him.enforceNamed(args);
}

/**
 * @param {Array} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function positional (args, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throwError_("Enforce.positional needs parameters as object");
  comment = comment || '<>';
  const him = Enforce_.new(parameters, comment);
  return him.enforcePositional(args);
}

const Enforce = {create, named, positional};

// install it globally
window.Enforce = Enforce;

function Log () {

    window.Logger = (function () {
        this._log = [];
        this.log = (...params) => {
            this._log.push(params.join(""));
        };
        this.get = () => this._log.join("\n");
        return this;
    })();

}
Log.get = function () {
    return window.Logger.get();
};

exports.Enforce = Enforce;
exports.Log = Log;

})(Import, this);
try{exports.Import = Import;}catch(e){}
