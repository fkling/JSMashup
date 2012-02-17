goog.provide('jsm.validator.StaticDomainValidator');

goog.require('goog.array');


/**
 * Abstract interface for domain validation. 
 * 
 * @interface
 * @constructor
 */
jsm.validator.StaticDomainValidator = function(domainConcepts) {
	/**
	 * An array of names of domain concepts.
	 * 
	 * @private
	 */
	this.domainConcepts = domainConcepts;
	
	this.componentInvalidMessage = "The type {0} in {1} is not valid."
};

/**
 * Takes a component descriptor. The implementation should test
 * the values types of each input and output value of the component.
 * 
 * @param {jsm.core.ComponentDescriptor} descriptor
 * 
 * @public
 */
jsm.validator.StaticDomainValidator.prototype.validateComponent = function(descriptor, valid, invalid) {
	var errors = [];
	
	// check events first:
	var events = descriptor.getEvents(),
		operations = descriptor.getOperations();
	
	for(var i = events.length; i--;) {
		var outputs = events[i].getOutputs();
		for(var j = outputs.length; j--;) {
			var out = outputs[j];
			if(!this.isInDomain(out.type)) {
				errors.push(this.parseStatement_(this.componentInvalidMessage, out.type, events[i].getRef()))
			}
		}
	}
	
	for(var i = operations.length; i--;) {
		var inputs = operations[i].getInputs();
		for(var j = inputs.length; j--;) {
			var inp = inputs[j];
			if(!this.isInDomain(inp.type)) {
				errors.push(this.parseStatement_(this.componentInvalidMessage, inp.type, operations[i].getRef()))
			}
		}
	}
	
	if(errors.length > 0) {
		invalid(errors);
	}
	else {
		valid();
	}
};

jsm.validator.StaticDomainValidator.prototype.isInDomain = function(type) {
	return goog.array.contains(this.domainConcepts, type);
};


jsm.validator.StaticDomainValidator.prototype.parseStatement_ = function() {
	var msg = arguments[0],
		params = [].slice.call(arguments, 1);
	
	return msg.replace(/\{(\d+)\}/g, function(match, number) {
		return params[+number];
	});
};


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
jsm.validator.StaticDomainValidator.prototype.validateConnection = function(source, event, target, operation) {};
