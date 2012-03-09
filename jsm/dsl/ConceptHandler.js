goog.provide('jsm.dsl.ConceptHandler');

/**
 * This class defines an interface for concept handler.
 * Their task is to 
 *
 *  - validate (data)types of inputs and outputs, i.e. decide 
 *  whether or not the type belongs to the domain and whether two
 *  concepts are compatible
 *
 *  - convert one concept into another if possible
 *
 * @constructor
 */
jsm.dsl.ConceptHandler = function() {};

/**
 * @param {string} concept
 * @return boolean
 */
jsm.dsl.ConceptHandler.prototype.isValid = function(concept) {

};

/**
 * @param {jsm.core.Event} event
 * @param {jsm.core.Operation} operation
 * @return boolean
 */
jsm.dsl.ConceptHandler.prototype.isCompatible = function(event, operation) {

};

/**
 * @param {jsm.core.Event} event
 * @param {jsm.core.Operation} operation
 * @param {object} data
 *
 * @return object
 */

jsm.dsl.ConceptHandler.prototype.convert = function(event, operation, data) {

};
