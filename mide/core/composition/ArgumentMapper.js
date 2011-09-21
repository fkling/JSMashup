goog.provide('mide.core.ArgumentMapper');

/**
 * Interface for mapping parameters between components.
 * 
 * @interface
 */
mide.core.ArgumentMapper = function() {};


/**
 * Sets up a mapping for this particular connection.
 * 
 * @param {mide.core.Component} source
 * @param {string} source
 * @param {mide.core.Component} target
 * @param {string} operation
 * 
 * @public
 */
mide.core.ArgumentMapper.prototype.createMapping = function(source, event, target, operation) {};


/**
 * Removes a mapping for this particular connection.
 * 
 * @param {mide.core.Component} source
 * @param {string} source
 * @param {mide.core.Component} target
 * @param {string} operation
 * 
 * @public
 */
mide.core.ArgumentMapper.prototype.removeMapping = function(source, event, target, operation) {};


/**
 * Removes a mapping for this particular connection.
 * 
 * @param {mide.core.Component} source
 * @param {string} source
 * @param {mide.core.Component} target
 * @param {string} operation
 * @param {Object} data
 * 
 * @return {Object} the mapped data
 * 
 * @public
 */
mide.core.ArgumentMapper.prototype.map = function(source, event, target, operation, data) {};