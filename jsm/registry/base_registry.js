goog.provide('jsm.core.registry');
goog.provide('jsm.core.registry.BaseRegistry');


/**
 * Abstract class providing the interface to save
 * and load components.
 * 
 * @interface
 * @constructor
 */
jsm.core.registry.BaseRegistry = function(options) {
	this.options = options || {};
	if(options.composition_mapper) {
		options.composition_mapper.setRegistry(this);
	}
};


/**
 * Get a list of all users components
 * 
 * @param {function(Array.<{id: string, description: string}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getComponents = function(success, error) {
	
};

/**
 * Get a list of all users components
 * 
 * @param {function(Array.<{id: string, description: string, public: boolean}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getUserComponents = function(success, error) {
	
};

/**
 * Get component descriptor via ID
 * 
 * @param {string} id - the FQN of the component
 * @param {function(jsm.core.ComponentDescriptor>} success callback
 * @param {function(string)} error callback
 *
 * @return {goog.async.Deferred}
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getComponentDescriptorById = function(id, success, error) {
	
};

/**
 * Get component descriptors by IDs
 * 
 * @param {Array.<string>} ids - the FQNs of the components
 * @param {function(jsm.core.ComponentDescriptor>} success callback
 * @param {function(string)} error callback
 *
 * @return {goog.async.Deferred}
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getComponentDescriptorsByIds = function(ids, success, error) {
};


/**
 * Get component descriptor via URL
 * 
 * @param {string} url of the model file
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};


/**
 * Get component descriptor via URL
 * 
 * @param {string} url of the model file
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};

/**
 * Returns a new component descriptor.
 * 
 * @private
 */
jsm.core.registry.BaseRegistry.prototype.getDescriptor_ = function(id, model, implementation, data) {
	try {
		return this.options.component_mapper.getDescriptor(id, model, implementation, data);
	}
	catch(e) {
		console.log(e);
		var descr = new jsm.core.ComponentDescriptor();
		descr.setId(id);
		descr.setModel(model);
		descr.setImplementation(implementation);
		descr.setData(data);
		return descr;
	}
};


/**
 * Save component
 * 
 * @param {jsm.core.ComponentDescriptor>} componentDescriptor
 * @param {function(jsm.ComponentDescriptor)} callback called when saved complete
 * @param {function(jsm.ComponentDescriptor)} callback called when saved complete
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.saveComponent = function(componentDescriptor, success, error) {
	
};

/**
 * Delete component
 * 
 * @param {jsm.ComponentDescriptor}  componentDescriptor
 * @param {function} callback called when saved complete
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.deleteComponent = function(componentDescriptor, success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getCompositions = function(success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.getUserCompositions = function(success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.createComposition = function(model, data, success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.saveComposition = function(id, model, data, success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
jsm.core.registry.BaseRegistry.prototype.deleteComposition = function(id, success, error) {
	
};
