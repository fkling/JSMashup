goog.provide('jsm.processor.ProcessorProvider');

goog.require('jsm.processor.ProcessorManager');

/**
 * Interface for getting process managers
 * 
 * @interface
 */
jsm.processor.ProcessorProvider = function() {

};


/**
 * Gets the processor manager for a certain component. 
 * 
 * @param {string} cid - the component ID

 *
 * @public
 */
jsm.processor.ProcessorProvider.prototype.getProcessorManager = function(component) {
	var processors = this.getProcessorManagerInternal_(component.getDescriptor().getId());
	for(var i = processors.length; i--; ) {
		processors[i].setComponent(component);
	}
	return new jsm.processor.ProcessorManager(component, processors);
};


/**
 * Internally called, has to be overridden by child classes.
 * 
 * @protected
 */
jsm.processor.ProcessorProvider.prototype.getProcessorManagerInternal_ = function(cid) {

};
