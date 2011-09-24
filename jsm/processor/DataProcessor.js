goog.provide('jsm.processor.DataProcessor');

goog.require('goog.array');

/**
 * 
 * @constructor
 */
jsm.processor.DataProcessor = function(config) {
	this.config = config || {};
};


/**
 * Sets the instance this processor belongs to. Can be used to attach
 * event handlers to keep track of the component's state.
 * 
 * @param {jsm.core.Component} component
 * 
 * @public
 */
jsm.processor.DataProcessor.prototype.setComponent = function(component) {
	this.component = component;
};


/**
 * Called upon an operation of the component.
 * 
 * @param {string} operation
 * @param {Object} params
 * @param {function} next - function to be called to pass control to the 
 *     next data processor
 *
 * @public
 */
jsm.processor.DataProcessor.prototype.perform = function(operation, params, next) {
	next(params);
};


/**
 * Called when the components triggerEvent method is called.
 * 
 * @param {string} event
 * @param {Object} params
 * @param {function} next - function to be called to pass control to the 
 *     next data processor
 *
 * @public
 */
jsm.processor.DataProcessor.prototype.triggerEvent = function(event, params, next) {
	next(params);
};


/**
 * Called when the components makeRequest method is called.
 * 
 * @param {string} name
 * @param {Object} requestConfig
 * @param {function} next - function to be called to pass control to the 
 *     next data processor
 *
 * @public
 */
jsm.processor.DataProcessor.prototype.makeRequest = function(name, requestConfig, next) {
	next(name, requestConfig);
};



/**
 * Get the possible trigger of an event.
 * 
 * @param {string} event
 * @return {string}
 * 
 * @protected
 */
jsm.processor.DataProcessor.prototype.getEventTrigger = function(event) {
	var request = goog.array.find(this.component.getDescriptor().getRequests(), function(request) {
		return request.triggers === event;
	});
	
	if(request) return request.ref;
	
	var operation = goog.array.find(this.component.getDescriptor().getOperations(), function(operation) {
		return operation.getRef() === event;
	}); 
	if(operation) return operation.getRef();
	return event;
};

/**
 * Returns the DOM node of the processor. Has to be implemented by subclasses.
 * 
 * @return {Element}
 * 
 * @public
 */
jsm.processor.DataProcessor.prototype.getContentElement = function() {
	
};
