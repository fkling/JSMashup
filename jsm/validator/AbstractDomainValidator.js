goog.provide('jsm.validator.AbstractDomainValidator');


/**
 * Abstract interface for domain validation. 
 * 
 * @interface
 * @constructor
 */
jsm.validator.AbstractDomainValidator = function() {
	
};

/**
 * Takes a component descriptor. The implementation should test
 * the values typs of each input and output value of the component.
 * 
 * @param {jsm.core.ComponentDescriptor} descriptor
 * 
 * @public
 */
jsm.validator.AbstractDomainValidator.prototype.validateComponent = function(descriptor, valid, invalid) {};


/**
 * The implementation should test the values typs of each input and output values 
 * are compatible.
 * 
 * @param {jsm.core.ComponentDescriptor} source
 * @param {string} event
 * @param {jsm.core.ComponentDescriptor} target
 * @param {string} operation
 * 
 * 
 * @public
 */
jsm.validator.AbstractDomainValidator.prototype.validateConnection = function(source, event, target, operation, valid, invalid) {};
