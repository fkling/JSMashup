goog.provide('jsm.processor.ProcessorManager');

goog.require('goog.array');

/**
 * Manages data processors and provides helper methods to
 * retrieve and execute necessary processors.
 * 
 * @constructor
 */
jsm.processor.ProcessorManager = function(component, processors) {
	this.component = component;
	this.processors = processors;
};


jsm.processor.ProcessorManager.prototype.getDataProcessors = function() {
	return this.processors;
};


/**
 * Executes all registered data processors.
 * 
 * @public
 */
jsm.processor.ProcessorManager.prototype.perform = function(operation, params, callback) {
	var processors = goog.array.filter(this.processors, function(processor) {
		return !!processor.perform;
	});

	var next = function(data) {
		setTimeout(function() {
			if(processors[0]) {
				processors.shift().perform(operation, data, next);
			}
			else {
				callback(operation, data);
			}
		}, 10)
	};
	next(params);
};

jsm.processor.ProcessorManager.prototype.triggerEvent = function(event, data, callback) {
	var processors = goog.array.filter(this.processors, function(processor) {
		return !!processor.triggerEvent;
	});
	processors.reverse();
	
	var next = function(data) {
		setTimeout(function() {
			if(processors[0]) {
				processors.shift().triggerEvent(event, data, next);
			}
			else {
				callback(event, data);
			}
		}, 10)
	};
	next(data);
};


jsm.processor.ProcessorManager.prototype.makeRequest = function(name, config, callback) {
	var processors = goog.array.filter(this.processors, function(processor) {
		return !!processor.makeRequest;
	});
	processors.reverse();
	
	var next = function(name, config) {
		setTimeout(function() {
			if(processors[0]) {
				processors.shift().makeRequest(name, config, next);
			}
			else {
				callback(name, config);
			}
		}, 10)
	};
	next(name, config);
};
