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
  return Enforce.create(paramObj, name);
}

/**
 * @param {Array} arguments
 * @param {Object} paramObj
 * @parma {String} comment
 */
function named (arguments, paramObj, comment) {
  return Enforce.named(arguments, paramObj, comment);
}

/**
 * @param {Array} arguments
 * @param {Object} paramObj
 * @parma {String} comment
 */
function positional (arguments, paramObj, comment) {
  return Enforce.positional(arguments, paramObj, comment);
}

