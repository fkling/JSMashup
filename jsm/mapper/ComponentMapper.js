goog.provide('jsm.mapper.ComponentMapper');

goog.require('jsm.core.Operation');
goog.require('jsm.core.Event');
goog.require('jsm.core.Parameter');

/**
 * Interface to parse model files and create
 * ComponentDecriptor objects.
 * 
 * @interface
 */
jsm.mapper.ComponentMapper = function() {};

/**
 * Converts a model description into a ComponentInstance instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {string} implementation
 * @param {Object} data
 * @return {jsm.core.ComponentDescriptor}
 * 
 * @public
 */
jsm.mapper.ComponentMapper.prototype.getDescriptor = function(id, model, implementation, data) {};


/**
 * Creates an instance of a component.
 * 
 * @param {jsm.core.ComponentDescriptor} descriptor
 * @param {string} opt_id - the instance id
 * @param {Object} opt_config - the configuration of this particular instance
 * 
 * @public
 */
jsm.mapper.ComponentMapper.prototype.getInstance = function(descriptor, opt_id, opt_config) {};


/**
 * Creates an instance of a component.
 * 
 * @param {jsm.core.ComponentDescriptor} descriptor
 * @param {function} valid 
 * @param {function} invalid
 * 
 * @public
 */
jsm.mapper.ComponentMapper.prototype.validate = function(descriptor, valid, invalid) {};
