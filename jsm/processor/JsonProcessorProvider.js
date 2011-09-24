goog.provide('jsm.processor.JsonProcessorProvider');

goog.require('jsm.processor.ProcessorProvider');

/**
 * Interface for getting process managers
 * 
 * @interface
 */
jsm.processor.JsonProcessorProvider = function(config) {
	this.config = config;
};

goog.inherits(jsm.processor.JsonProcessorProvider, jsm.processor.ProcessorProvider)


/**
 * @override
 */
jsm.processor.JsonProcessorProvider.prototype.getProcessorManagerInternal_ = function(cid) {
	var processors = [];
	if(cid in this.config) {
		this.addProcessors_(this.config[cid], processors)
	}
	if(this.config['*']) { // global processors
		this.addProcessors_(this.config['*'], processors);
	}
	return processors;
};

/**
 * @private
 */
jsm.processor.JsonProcessorProvider.prototype.addProcessors_ = function(config, processors) {
	for(var i = 0, l = config.length; i < l; i++) {
		var Class = goog.getObjectByName(config[i].type);
		if(Class) {
		    processors.push(new Class(config[i].config));
		}
	}
};
