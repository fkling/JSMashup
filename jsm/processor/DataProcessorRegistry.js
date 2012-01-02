goog.provide('jsm.processor.DataProcessorRegistry');

goog.require('jsm.processor.ProcessorManager');

/**
 * Configuration of data processors have to be registered
 * with this class.
 *
 * @constructor
 */
jsm.processor.DataProcessorRegistry = function() {
    this.processors_ = {};
};

goog.addSingletonGetter(jsm.processor.DataProcessorRegistry);


/**
 * Holds the data processor configurations
 *
 * @private
 */
jsm.processor.DataProcessorRegistry.prototype.processors_ = null;


/**
 * Adds a data processor configuration for the component with ID cid. If cid is '*', the
 * processor will be attached to all components.
 *
 * The format of the configuration object is as follows:
 *
 * {
 *   cls: {string} FQN of the data processor,
 *   url: {string} the URL to get the implementation from,
 *   config: {object} a configuration object for the data procossor, can contain any content
 * }
 *
 * @param {string} cid - the component ID
 * @param {object} config - the data processor configuration
 *
 * @public
 */
jsm.processor.DataProcessorRegistry.prototype.addDataProcessorConfiguration = function(cid, config) {
    (this.processors_[cid] || (this.processors_[cid] = [])).push(config);
};


/**
 * Gets the processor manager for a certain component. 
 * 
 * @param {string} component - the component
 * @param {function} callback - gets the 
 *
 * @public
 */
jsm.processor.DataProcessorRegistry.prototype.getProcessorManager = function(component, callback) {
	var processors = this.getDataProcessors_(component.getDescriptor().getId());
	callback(new jsm.processor.ProcessorManager(component, processors));
};


/**
 * Loads and instantiats the data processors for a certain component
 *
 * @private
 */
jsm.processor.DataProcessorRegistry.prototype.getDataProcessors_ = function(cid) {
    var result = [];
    for(var processors = this.processors_[cid] || [], processor, i = 0; processor = processors[i]; i++) {
        var Cls = goog.getObjectByName(processor.cls);
		if(Cls) {
		    result.push(new Cls(processor.config));
		}
    } 
    return result;
};
