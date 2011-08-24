goog.provide('mide.mapper.ComponentMapper');

goog.require('mide.core.Operation');
goog.require('mide.core.Event');
goog.require('mide.core.Parameter');

/**
 * Interface to parse model files and create
 * ComponentDecriptor objects.
 * 
 * @interface
 */
mide.mapper.ComponentMapper = function() {};

/**
 * Converts a model description into a ComponentInstance instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {string} implementation
 * @param {Object} data
 * @return {mide.core.ComponentDescriptor}
 * 
 * @public
 */
mide.mapper.ComponentMapper.prototype.getDescriptor = function(id, model, implementation, data) {};