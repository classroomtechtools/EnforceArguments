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
    this.typecheck(args);
  }

  enforcePositional (args) {
    /**
     * Take args in format of positional arguments ([0] => value), convert them to format for destructured arguments
     *    and then do checks
     * This works because javascript objects, as long as all of the keys are non-numerical (which we can assume)
     *   retain the order by insertion
     */
    // check args is not nothing
    if (args === undefined) throw new TypeError('Pass "arguments" to enforcePositional');
    
    // convert positional to destructured arguments
    const named = Object.keys(this.params).reduce(
      (acc, key, index) => {
        if (index >= args.length) return acc;
        acc[0] = acc[0] || {};  // there is only one index in named arguments
        acc[0][key] = args[index];
        return acc;
      }, {}
    );

    this.typecheck(named);

    // Now check for arity as this will be missed in above
    if (args.length > Object.keys(this.params).length) throw new TypeError(`Too many arguments to ${this.name}. Recieved ${args.length} but expected ${Object.keys(this.params).length}`);
  }

  /**
   * Validates args in [0] => {key: value} format
   */
  typecheck(args, checkExtra=true) {
    // arguments is an object-like array, need to flatten it so that we represent it as viewed from function scope
    let argObj = {};
    for (const prop in args) {
      argObj = {...argObj, ...args[prop]};
    }
    
    this.enforceRequiredParams(Object.keys(argObj));
    
    // now that both have matching types, let's go
    for (const prop in this.params) {
      const at = typeof argObj[prop], et = this.params[prop];    // actual type, expected type
      if (typeof et === 'function') {
        if (!(argObj[prop] instanceof et)) throw new TypeError(`Expected instance of class ${this.params[prop].name} but got ${at} instead`);
        continue;
      }
      if (et === 'any' || argObj[prop] === undefined) continue;  // type of 'any' special meaning is to skip it
      if (et === 'array') {
        // arrays don't respond to typeof why javascript why
        if (!Array.isArray(argObj[prop])) throw new TypeError(`Type mismatch in ${this.name}: "${prop}". Expected array but got ${at}`);
      } else if (at !== et) {
        throw new TypeError(`Type mismatch in ${this.name}: "${prop}". Expected ${this.params[prop]} but got ${typeof(argObj[prop])} instead`);
      }
    }
    
    if (checkExtra) {
      const paramSet = new Set(Object.keys(this.params));
      const extra = Object.keys(argObj).filter(x => !paramSet.has(x)).reduce(
        function (acc, key) { 
          acc[key] = argObj[key];
          return acc;
        }, {}
      );
      this.extra(extra);
    }

    return argObj[0];
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
  comment = comment || '<unknown>';
  const him = Enforce_.new(parameters, comment);
  him.enforceNamed(arguments);
}

/**
 * @param {Array-like} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function positional (arguments, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throw new TypeError("Enforce.positional needs parameters as object");
  comment = comment || '<unknown>';
  const him = Enforce_.new(parameters, comment);
  him.enforcePositional(arguments);
}
