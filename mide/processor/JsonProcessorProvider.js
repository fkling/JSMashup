goog.provide('mide.processor.JsonProcessorProvider');

goog.require('mide.processor.ProcessorProvider');

/**
 * Interface for getting process managers
 * 
 * @interface
 */
mide.processor.JsonProcessorProvider = function(config) {
	this.config = config;
};

goog.inherits(mide.processor.JsonProcessorProvider, mide.processor.ProcessorProvider)


/**
 * @override
 */
mide.processor.JsonProcessorProvider.prototype.getProcessorManagerInternal_ = function(cid) {
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
mide.processor.JsonProcessorProvider.prototype.addProcessors_ = function(config, processors) {
	for(var i = 0, l = config.length; i < l; i++) {
		var Class = goog.getObjectByName(config[i].type);
		if(Class) {
		    processors.push(new Class(config[i].config));
		}
	}
};