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

/**
 * @param {String} name
 * @param {Object} paramObj
 * @return {EnforceObject}
 */
function create (paramObj, name) {
  const {Enforce} = Import;
  return Enforce.create(paramObj, name);
}

/**
 * @param {Array} args
 * @param {Object} paramObj
 * @parma {String} comment
 */
function named (args, paramObj, comment) {
  const {Enforce} = Import;
  return Enforce.named(args, paramObj, comment);
}

/**
 * @param {Array} args
 * @param {Object} paramObj
 * @parma {String} comment
 */
function positional (args, paramObj, comment) {
  const {Enforce} = Import;
  return Enforce.positional(args, paramObj, comment);
}

