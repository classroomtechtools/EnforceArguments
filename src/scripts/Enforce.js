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
 * @param {Object} parameters
 * @return {EnforceObject}
 */
function create (parameters, name) {
  const {create: create_} = Import.Enforce;
  return create_(parameters, name);
}

/**
 * @param {Array} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function named (args, parameters, comment) {
  const {named: named_} = Import.Enforce;
  return named_(args, parameters, comment);
}

/**
 * @param {Array} arguments
 * @param {Object} parameters
 * @parma {String} comment
 */
function positional (args, parameters, comment) {
  const {positional: positional_} = Import.Enforce;
  return positional_(args, parameters, comment);
}

