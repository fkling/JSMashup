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


/**
 * Creates an instance of a component.
 * 
 * @param {mide.core.ComponentDescriptor} descriptor
 * @param {string} opt_id - the instance id
 * @param {Object} opt_config - the configuration of this particular instance
 * 
 * @public
 */
mide.mapper.ComponentMapper.prototype.getInstance = function(descriptor, opt_id, opt_config) {};


/**
 * Creates an instance of a component.
 * 
 * @param {mide.core.ComponentDescriptor} descriptor
 * @param {function} valid 
 * @param {function} invalid
 * 
 * @public
 */
mide.mapper.ComponentMapper.prototype.validate = function(descriptor, valid, invalid) {};
