/**
 * EnforceParameters
   A V8 GAS library which enables the ability for the developer to guarantee that functions receive arguments that match the expected types and values.
   https://github.com/classroomtechtools/EnforceArguments
 *
 * @author Adam Morris classroomtechtools.ctt@gmail.com https://classroomtechtools.com
 * @copyright May 2020
 * @license MIT
 * @version 1.5
 */

class Enforce_ {
  constructor (params, name) {
    /** 
     * Save the name and param object
     * converting values to lowercase
     * @param {String} name
     * @param {Object<String>} params
     */
    this.name = name;
    this.params = Object.entries(params).reduce(
      function (acc, [key, value]) {
        const type_ = typeof value;
        if (type_ === 'function') // assume it's a class
          acc[key] = value;
        else if (type_ === 'string') {
          if (value[0] === '!')
            acc[key] = value.slice(1).toLowerCase();
          else
            acc[key] = value.toLowerCase();
        } else {
          throw new Error(`Passed unknown value ${value}`);
        }
        return acc;
      }, {}
    );
    
    // filter out parameters that starts with !, and create list of those keys only
    this.required = Object.entries(params).filter( ([key, value]) => (value !== null && value[0] === '!')).map( ([key, value]) => key);
  }
  
  static new (...params) {
    return new Enforce_(...params);
  }
  
  get req() {
    throw Error(`${this.name} is missing a required argument`);
  }

  extra(kwargs) {
    if (Object.entries(kwargs).length > 0) 
      throw Error(`Unknown parameter(s) passed to ${this.name}: ${Object.keys(kwargs)}`);
  }
  
  enforceRequiredParams (passed) {
    const missing = this.required.filter(x => !passed.includes(x));
    if (missing.length > 0) 
      throw new TypeError(`Required arguments in ${this.name} not recieved: ${missing}`);
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
    this.typecheck(named);
    
    return named;
  }

  enforcePositional (args) {
    /**
     * Take args in format of positional arguments ([0] => value), convert them to format for destructured arguments
     *    and then do checks
     * This works because javascript objects, as long as all of the keys are non-numerical (which we can assume)
     *   retain the order by insertion
     */
    if (args === undefined) throw new TypeError('Pass "arguments" to enforcePositional');
    const keys = Object.keys(this.params);
        
    // convert positional to required format by typecheck
    const named = keys.reduce(
      (acc, key, index) => {
        if (index >= args.length) return acc;
        acc[key] = args[index];
        return acc;
      }, {}
    );

    this.typecheck(named, false);

    // Now check for arity as this will be missed in above
    if (args.length > keys.length) throw new TypeError(`Too many arguments to ${this.name}. Recieved ${args.length} but expected ${Object.keys(this.params).length}`);

    return named;
  }

  /**
   * Validates args in key => value format
   */
  typecheck(argObj, checkExtra=true) {
    this.enforceRequiredParams(Object.keys(argObj));
    
    for (const prop in this.params) {
      const av = argObj[prop], klass = this.params[prop];  // actual value, klass (either passed directly or converted from instance)
      if (klass === null) continue;       // ensure all null values are not subject to checks
      if (av === undefined) throw new TypeError(`"undefined" was passed to ${this.name} for ${prop}`);
      const at = typeof av,    et = this.params[prop];     // actual type, expected type
      if (et === 'any') continue;  // type of 'any' special meaning is to skip it
      if (typeof et === 'function') {
        if (!(av instanceof klass)) throw new TypeError(`Expected instance of class ${this.params[prop].name} in ${this.name} but got ${av.constructor.name} instead`);
        continue;
      }
      if (et === 'array') {
        // arrays don't respond to typeof why javascript why
        if (!Array.isArray(argObj[prop])) throw new TypeError(`Type mismatch in ${this.name}: "${prop}". Expected array but got ${at}`);
      } else if (at !== et) {
        throw new TypeError(`Type mismatch in ${this.name}: "${prop}". Expected ${this.params[prop]} but got ${av} instead`);
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
  if (name === null) throw new TypeError('Enforce.create "name" cannot be null did you mean empty string instead?');
  if (parameters === null) throw new TypeError('Enforce.create "parameters" cannot be null');
  Enforce_.selfcheck(arguments);
  return Enforce_.new(parameters, name);
}

/**
 * @param {Array-like} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function named (arguments, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throw new TypeError("Enforce.named needs parameters as object");
  comment = comment || '<>';
  const him = Enforce_.new(parameters, comment);
  return him.enforceNamed(arguments);
}

/**
 * @param {Array-like} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function positional (arguments, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throw new TypeError("Enforce.positional needs parameters as object");
  comment = comment || '<>';
  const him = Enforce_.new(parameters, comment);
  return him.enforcePositional(arguments);
}
