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

const throwError_ = (message) => {
   try {
     throw new Error();
   } catch (e) {
     const stack = e.stack.split(' at ').slice(5).join(' at ');
     throw new TypeError(message + ': ' + stack);
   }
};

const throw_if_any_keys = (kwargs) => {
  if (Object.entries(kwargs).length > 0)
    throwError_(`Unknown parameter(s) passed to ${this.name}: ${Object.keys(kwargs)}`);
};


class Enforce_ {
  constructor (params, name) {
    /**
     * Save the name and param object
     * converting values to lowercase
     * @param {Object<String>} params
     * @param {String} name
     */
    this.name = name;
    this.required = [];
    this.hybrid = {};
    const get_declared_type = (key, value, idx) => {
      const t_ = typeof value;
      if (t_ === 'object') {
        this.hybrid[idx] = value;
        return t_;
      }
      if (t_ === 'string' && value.startsWith('!')) {
        this.required.push(key);
        return value.slice(1).toLowerCase();
      }
      return t_ === 'string' ? value.toLowerCase() : value;
    };
    const get_type = (value) => typeof value;

    this.params = {};
    let idx = 0;
    for (const [key, value] of Object.entries(params)) {
      const type_ = get_type(value);
      const declared_type = get_declared_type(key, value, idx);
      if (['function', 'string', 'object'].includes(type_)) {
        // type is declared as a class or a string, just add it
        this.params[key] = declared_type;
      } else {
        throw new Error(`Must use strings, classes, or objects to describe parameters, passed "${value}" of type "${type_}" instead`);
      }
      idx += 1;
    }
  }


  static new (...params) {
    return new Enforce_(...params);
  }


  get req() {
    throwError_(`${this.name} is missing a required argument`);
  }

  enforceRequiredParams (passed) {
    const missing = this.required.filter(x => !passed.includes(x));
    if (missing.length > 0)
      throwError_(`Required argument for ${this.name} "${missing}" missing. Alternatively, you may have passed as a positional argument?`);
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
    this.enforceRequiredParams(Object.keys(named));
    this.typecheck(named, true, true);  // typecheck for named means we need to ensure no undefined and no extra

    return this;
  }


  enforcePositional (args) {
    /**
     * Take args in format of positional arguments ([0] => value), convert them to format for typecheck
     * This works because javascript objects, as long as all of the keys are non-numerical (which we can assume)
     *   retain the order by insertion
     */
    if (args === undefined) throwError_('Pass "arguments" to enforcePositional');
    const keys = Object.keys(this.params);

    // flatten arguments object to regular name/value store
    const named = {};
    const args_max = args.length;
    let idx = 0;
    for (const key of keys.slice(0, args_max)) {
      named[key] = args[idx];
      idx += 1;
    }
    
    this.enforceRequiredParams(Object.keys(named));
    this.typecheck(named, false, false);  // typecheck for positional means undefined needs to squeak through, check for extra is done here instead

    // Now check for arity as this will be missed in above
    if (args.length > keys.length) throwError_(`Too many arguments to ${this.name}. Recieved ${args.length} but expected ${Object.keys(this.params).length}`);

    return this;
  }


  enforceHybrid (args) {
    /**
     * Use itself
     * First check that position is proper, then break down any objects found into named
     */
    if (args === undefined) throwError_('Pass "arguments" to enforcePositional');
    //console.log(this.hybrid);
    // check that indeed have sent in objects for destructred and other params are correct
    this.enforcePositional(args);
    
    // going backwards, go through each destructured, create fake args for it 0=>foo
    // and call enforceNamed on those fake args
    for (const [idx, params] of Object.entries(this.hybrid)) {
      const enforce_ = new Enforce_(params, `${this.name} destructured arg #${idx}`);
      const thisArg = args[idx];
      enforce_.enforceNamed({'0': thisArg});
    }

    return this;
  }


  /**
   * Validates args in key => value format
   */
  typecheck(argObj, checkUndefined=true, checkExtra=true) {
    for (const prop in this.params) {
      if (!argObj.hasOwnProperty(prop)) continue;
      const av = argObj[prop], klass = this.params[prop];  // actual value, klass (either passed directly or converted from instance)
      if (klass === null || av == null) continue;       // ensure all null values are not subject to checks
      if (av === undefined) {
        if (checkUndefined) throwError_(`"undefined" was passed to ${this.name} for ${prop}`);
        continue;
      }
      const at = typeof av,    et = this.params[prop];     // actual type, expected type
      if (['any', '!any'].includes(et)) continue;  // type of 'any' special meaning is to skip it
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
      throw_if_any_keys(extra);
    }
  }

  
  static selfcheck (args) {
    const Me = Enforce_.new({parameters: '!object', name: '!string'}, 'Enforce.create');
    Me.enforcePositional(args);
  }
}


/**
 * @param {Object} parameters
 * @param {String} name
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
 * @param {Array} args
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
 * @param {Array} args
 * @param {Object} parameters
 * @parma {String} comment
 */
function positional (args, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throwError_("Enforce.positional needs parameters as object");
  comment = comment || '<>';
  const him = Enforce_.new(parameters, comment);
  return him.enforcePositional(args);
}


/**
 * @param {Array} args
 * @param {Object} parameters
 * @param {String} comment
 */
 function hybrid (args, parameters, comment) {
  if (parameters === undefined || typeof parameters !== 'object') throwError_("Enforce.positional needs parameters as object");
  comment = comment || '<>';
  const him = Enforce_.new(parameters, comment);
  return him.enforceHybrid(args);
}

const Enforce = {create, named, positional, hybrid};
export {Enforce};

// install it globally if window global is available
try {window.Enforce = Enforce} catch (e) {};
