goog.provide('jsm.core.ArgumentMapper');

/**
 * Interface for mapping parameters between components.
 * 
 * @interface
 */
jsm.core.ArgumentMapper = function() {};


/**
 * Sets up a mapping for this particular connection.
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * 
 * @public
 */
jsm.core.ArgumentMapper.prototype.createMapping = function(source, event, target, operation) {};


/**
 * Removes a mapping for this particular connection.
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * 
 * @public
 */
jsm.core.ArgumentMapper.prototype.removeMapping = function(source, event, target, operation) {};


/**
 * Removes a mapping for this particular connection.
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * @param {Object} data
 * 
 * @return {Object} the mapped data
 * 
 * @public
 */
jsm.core.ArgumentMapper.prototype.map = function(source, event, target, operation, data) {};
