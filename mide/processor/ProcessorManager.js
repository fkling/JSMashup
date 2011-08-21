goog.provide('mide.processor.ProcessorManager');

mide.processor.ProcessorManager = function(config) {
	this.config = config;
};

mide.processor.ProcessorManager.prototype.getProcessorsFor = function(id) {
	var processors = [];
	if(id in this.config) {
		var p_ = this.config[id];
		for(var i = 0, l = p_.length; i < l; i++) {
			var Class = goog.getObjectByName(p_[i].type);
			if(Class) 
			    processors.push(new Class(p_[i].config));
		}
	}
	return processors;
};