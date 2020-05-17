/**
 * EnforcedNamedParameters
 * A V8 GAS library which …
 * … enforces required parameters on function calls
 * … enforces type checking on function calls
 * … optionally detects extra parameters
 * … optionally define default values
 *
 * @author Adam Morris classroomtechtools.ctt@gmail.com https://classroomtechtools.com
 * @copyright May 2020
 * @license MIT
 * @version 1.0
 */

class Interface_ {
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
        if (value[0] === '!')
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
    return new Interface_(...params);
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
  
  validate (args) {
    const extra = this.typecheck(args);
    this.extra(extra);
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
      if (this.params[prop] === 'any' || argObj[prop] === undefined) continue;  // type of 'any' special meaning is to skip it
      if (this.params[prop] === 'array') {
        if (!Array.isArray(argObj[prop])) throw new Error(`Type mismatch in ${this.name}: "${prop}". Expected array but got ${typeof(argObj)}`);
      } else if (typeof(argObj[prop]) !== this.params[prop]) {
        throw new Error(`Type mismatch in ${this.name}: "${prop}". Expected ${this.params[prop]} but got ${typeof(argObj[prop])}`);
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
}


/**
 * @param {String} name
 * @param {Object<String>} parameters
 * @return {Interface}
 */
const CI = Interface_.new('Interface.create', {name: '!string', parameters: '!array'});
function create ({name=CI.req, parameters=CI.req}={}) {
  /**
   * Parameters is an object whose keys are parameters in the function you are augmenting.
   * 
   */
  return Interface_.new(name, parameters);
}
