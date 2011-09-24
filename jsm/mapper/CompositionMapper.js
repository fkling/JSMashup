goog.provide('jsm.mapper.CompositionMapper');

goog.require('jsm.core.composition.Connection');
goog.require('jsm.core.Composition');

/**
 * Interface to parse model files and create
 * ComponentDecriptor objects.
 * 
 * @interface
 */
jsm.mapper.CompositionMapper = function() {};


/**
 * @type jsm.registry.BaseRegistry
 */
jsm.mapper.CompositionMapper.prototype.registry = null;

/**
 * Converts a model description into a ComponentInstance instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {Object} data
 * @param {function} callback
 * @return {jsm.core.Composition}
 * 
 * @public
 */
jsm.mapper.CompositionMapper.prototype.getComposition = function(id, model, data, callback) {};


jsm.mapper.CompositionMapper.prototype.setRegistry = function(registry) {
	this.registry = registry;
};
