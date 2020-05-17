/**
 * EnforcedNamedParameters
 * A V8 GAS library which …
 * … enforces required parameters on function calls
 * … enforces type checking on function calls
 * … optionally detects extra parameters
 * … optionally define default values
 *
 * @author Adam Morris
 * @copyright May 2020
 * @license MIT
 * @version 1.0
 */

class Enforce_ {
  constructor (name, params) {
    /** 
     * Save the name and param object
     * converting values to lowercase
     * @param {String} name
     * @param {Object<String>} params
     */
    this.name = name;
    this.params = Object.entries(params).reduce(
      function (acc, [key, value]) {
        if (typeof (value) === 'function') // assume it's a class
          acc[key] = value;
        else if (value[0] === '!')
          acc[key] = value.slice(1).toLowerCase();
        else
          acc[key] = value.toLowerCase();
        return acc;
      }, {}
    );
    
    // filter out parameters that starts with !, and create list of those keys only
    this.required = Object.entries(params).filter( ([key, value]) => value[0] === '!').map( ([key, value]) => key);
  }
  
  static new (...params) {
    return new Enforce_(...params);
  }
  
  get req() {
    throw Error(`${this.name} requires the following parameters: ${this.required.join(',')}`);
  }

  extra(kwargs) {
    if (Object.entries(kwargs).length > 0) 
      throw Error(`Unknown parameter(s) passed to ${this.name}: ${Object.keys(kwargs)}`);
  }
  
  enforceRequiredParams (passed) {
    const missing = this.required.filter(x => !passed.includes(x));
    if (missing.length > 0) 
      throw new Error(`Required parameters not recieved: ${missing}`);
  }
  
  validate_named (args) {
    /**
     * Call from within the body of a function with named parameters, with the arguments reserved word
     * Checks that required params are present
     */
    const extra = this.typecheck(args);
    this.extra(extra);
  }

  validate_positional (args) {
    /**
     * Call when you need to validate a function call whose declaration provides positional arguments
     * This works because javascript objects, as long as all of the keys are non-numerical (which we can assume)
     *   retain the order by insertion
     * This will convert args into what arguments look like when they are named, and passes it to this.validate_named
     */
    if (args === undefined) throw new Error('Pass "arguments" to validate_positional');
    const named = Object.keys(this.params).reduce(
      (acc, key, index) => {
        if (index >= args.length) return acc;
        acc[0] = acc[0] || {};  // there is only one index in named parameters
        acc[0][key] = args[index];
        return acc;
      }, {}
    );
    this.validate_named(named);
    if (args.length > Object.keys(this.params).length) throw new Error(`Too many arguments to ${this.name}. Recieved ${args.length} but expected ${Object.keys(this.params).length}`);
  }

  /**
   * Returns any extra not checked
   */
  typecheck(args) {
    // arguments is an object-like array, need to flatten it so that we represent it as viewed from function scope
    let argObj = {};
    for (const prop in args) {
      argObj = {...argObj, ...args[prop]};
    }
    
    this.enforceRequiredParams(Object.keys(argObj));
    
    // now that both have matching types, let's go
    for (const prop in this.params) {
      const at = typeof argObj[prop], et = this.params[prop];    // actual type, expected type
      Logger.log(typeof et);
      if (typeof et === 'function') {
        Logger.log(argObj[prop]);
        if (!(argObj[prop] instanceof et)) throw new Error(`Expected instance of class ${this.params[prop].name} but got ${at} instead`);
        continue;
      }
      if (et === 'any' || argObj[prop] === undefined) continue;  // type of 'any' special meaning is to skip it
      if (et === 'array') {
        // arrays don't respond to typeof why javascript why
        if (!Array.isArray(argObj[prop])) throw new Error(`Type mismatch in ${this.name}: "${prop}". Expected array but got ${at}`);
      } else if (at !== et) {
        throw new Error(`Type mismatch in ${this.name}: "${prop}". Expected ${this.params[prop]} but got ${typeof(argObj[prop])} instead`);
      }
    }
    
    const paramSet = new Set(Object.keys(this.params));
    return Object.keys(argObj).filter(x => !paramSet.has(x)).reduce(
      function (acc, key) { 
        acc[key] = argObj[key];
        return acc;
      }, {}
    );
  }
  
  static selfcheck (args) {
    const Me = Enforce_.new('Enforce.create', {name: '!string', parameters: '!object'});
    Me.validate_positional(args);
  }
}


/**
 * @param {String} name
 * @param {Object} parameters
 * @return {EnforceNamedParameters}
 */
function create (name, parameters) {
  /**
   * Parameters is an object whose keys are parameters in the function you are augmenting.
   * Values determine the type, one of {number, string, boolean, object, any, array}
   *   (to indicate an instance of a class, value can be Class)
   * @example Enforce.create('<name>', {id: '!number', name: '!string'});
   */
  if (name === null) throw new Error('Enforce.create "name" cannot be null did you mean empty string instead?');
  if (parameters === null) throw new Error('Enforce.create "parameters" cannot be null');
  Enforce_.selfcheck(arguments);
  return Enforce_.new(name, parameters);
}

/**
 * @param {Array-like} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function named (arguments, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throw new Error("Enforce.named needs parameters as object");
  comment = comment || '<unknown>';
  const him = Enforce_.new(comment, parameters);
  him.validate_named(args);
}

/**
 * @param {Array-like} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function positional (arguments, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throw new Error("Enforce.positional needs parameters as object");
  comment = comment || '<unknown>';
  const him = Enforce_.new(comment, parameters);
  him.validate_positional(args);
}
