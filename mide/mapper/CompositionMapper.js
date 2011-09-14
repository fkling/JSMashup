goog.provide('mide.mapper.CompositionMapper');

goog.require('mide.core.composition.Connection');
goog.require('mide.core.Composition');

/**
 * Interface to parse model files and create
 * ComponentDecriptor objects.
 * 
 * @interface
 */
mide.mapper.CompositionMapper = function() {};


/**
 * @type mide.registry.BaseRegistry
 */
mide.mapper.CompositionMapper.prototype.registry = null;

/**
 * Converts a model description into a ComponentInstance instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {Object} data
 * @param {function} callback
 * @return {mide.core.Composition}
 * 
 * @public
 */
mide.mapper.CompositionMapper.prototype.getComposition = function(id, model, data, callback) {};


mide.mapper.CompositionMapper.prototype.setRegistry = function(registry) {
	this.registry = registry;
};