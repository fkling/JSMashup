goog.provide('mide.validator.StaticDomainValidator');

goog.require('goog.array');


/**
 * Abstract interface for domain validation. 
 * 
 * @interface
 * @constructor
 */
mide.validator.StaticDomainValidator = function(domainConcepts) {
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
 * @param {mide.core.ComponentDescriptor} descriptor
 * 
 * @public
 */
mide.validator.StaticDomainValidator.prototype.validateComponent = function(descriptor, valid, invalid) {
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
		var outputs = operations[i].getOutputs(),
			inputs = operations[i].getInputs();
		
		for(var j = outputs.length; j--;) {
			var out = outputs[j];
			if(!this.isInDomain(out.type)) {
				errors.push(this.parseStatement_(this.componentInvalidMessage, out.type, operations[i].getRef()))
			}
		}
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

mide.validator.StaticDomainValidator.prototype.isInDomain = function(type) {
	return goog.array.contains(this.domainConcepts, type);
};


mide.validator.StaticDomainValidator.prototype.parseStatement_ = function() {
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
 * @param {mide.core.ComponentDescriptor} source
 * @param {string} event
 * @param {mide.core.ComponentDescriptor} target
 * @param {string} operation
 * 
 * 
 * @public
 */
mide.validator.StaticDomainValidator.prototype.validateConnection = function(source, event, target, operation) {};