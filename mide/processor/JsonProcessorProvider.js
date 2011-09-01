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
		var p_ = this.config[cid];
		for(var i = 0, l = p_.length; i < l; i++) {
			var Class = goog.getObjectByName(p_[i].type);
			if(Class) {
			    processors.push(new Class(p_[i].config));
			}
		}
	}
	return processors;
};