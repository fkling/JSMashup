goog.provide('mide.validator.AbstractDomainValidator');


/**
 * Abstract interface for domain validation. 
 * 
 * @interface
 * @constructor
 */
mide.validator.AbstractDomainValidator = function() {
	
};

/**
 * Takes a component descriptor. The implementation should test
 * the values typs of each input and output value of the component.
 * 
 * @param {mide.core.ComponentDescriptor} descriptor
 * 
 * @public
 */
mide.validator.AbstractDomainValidator.prototype.validateComponent = function(descriptor, valid, invalid) {};


/**
 * The implementation should test the values typs of each input and output values 
 * are compatible.
 * 
 * @param {mide.core.ComponentDescriptor} source
 * @param {string} event
 * @param {mide.core.ComponentDescriptor} target
 * @param {string} operation
 * 
 * 
 * @public
 */
mide.validator.AbstractDomainValidator.prototype.validateConnection = function(source, event, target, operation, valid, invalid) {};