goog.provide('mide.converter.ModelConverter');

goog.require('mide.core.Operation');
goog.require('mide.core.Event');
goog.require('mide.core.Parameter');

/**
 * Interface to parse model files and create
 * ComponentDecriptor objects.
 * 
 * @interface
 */
mide.converter.ModelConverter = function() {};

/**
 * Converts a model description into a ComponentInstance instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {string} implementation
 * @param {Object} metadata
 * @return {mide.core.ComponentDescriptor}
 * 
 * @public
 */
mide.converter.ModelConverter.prototype.getDescriptor = function(id, model, implementation, metaData) {};