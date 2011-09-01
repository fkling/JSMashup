goog.provide('mide.processor.ProcessorProvider');

goog.require('mide.processor.ProcessorManager');

/**
 * Interface for getting process managers
 * 
 * @interface
 */
mide.processor.ProcessorProvider = function() {

};


/**
 * Gets the processor manager for a certain component. 
 * 
 * @param {string} cid - the component ID

 *
 * @public
 */
mide.processor.ProcessorProvider.prototype.getProcessorManager = function(component) {
	var processors = this.getProcessorManagerInternal_(component.getDescriptor().getId());
	for(var i = processors.length; i--; ) {
		processors[i].setComponent(component);
	}
	return new mide.processor.ProcessorManager(component, processors);
};


/**
 * Internally called, has to be overridden by child classes.
 * 
 * @protected
 */
mide.processor.ProcessorProvider.prototype.getProcessorManagerInternal_ = function(cid) {

};