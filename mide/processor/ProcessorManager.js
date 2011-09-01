goog.provide('mide.processor.ProcessorManager');

goog.require('goog.array');

/**
 * Manages data processors and provides helper methods to
 * retrieve and execute necessary processors.
 * 
 * @constructor
 */
mide.processor.ProcessorManager = function(component, processors) {
	this.component = component;
	this.processors = processors;
};


mide.processor.ProcessorManager.prototype.getProcessors = function() {
	return this.processors;
};


/**
 * Executes all registered data processors.
 * 
 * @public
 */
mide.processor.ProcessorManager.prototype.perform = function(operation, params, callback) {
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

mide.processor.ProcessorManager.prototype.triggerEvent = function(event, data, callback) {
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


mide.processor.ProcessorManager.prototype.makeRequest = function(name, config, callback) {
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