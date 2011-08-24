goog.provide('mide.core.registry');
goog.provide('mide.core.registry.BaseRegistry');
goog.provide('mide.config.registry');


/**
 * Registry configuration. `type` should refer to an object inheriting
 * from `mide.core.registry.BaseRegistry`. The `options` property will
 * be passed to constructor.
 * 
 * @abstract
 * @public
 */
mide.config.registry = {
	type: null,
	options: {}
};


/**
 * Abstract class providing the interface to save
 * and load components.
 * 
 * @interface
 * @constructor
 */
mide.core.registry.BaseRegistry = function(options) {
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
mide.core.registry.BaseRegistry.prototype.getComponents = function(success, error) {
	
};

/**
 * Get a list of all users components
 * 
 * @param {function(Array.<{id: string, description: string, public: boolean}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.getUserComponents = function(success, error) {
	
};

/**
 * Get component descriptor via ID
 * 
 * @param {string} id the FQN of the component
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.getComponentDescriptorById = function(id, success, error) {
	
};

/**
 * Get component descriptor via URL
 * 
 * @param {string} url of the model file
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};


/**
 * Get component descriptor via URL
 * 
 * @param {string} url of the model file
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};

/**
 * Returns a new component descriptor.
 * 
 * @private
 */
mide.core.registry.BaseRegistry.prototype.getDescriptor_ = function(id, model, implementation, data) {
	try {
		return this.options.component_mapper.getDescriptor(id, model, implementation, data);
	}
	catch(e) {
		console.log(e);
		var descr = new mide.core.ComponentDescriptor();
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
 * @param {mide.core.ComponentDescriptor>} componentDescriptor
 * @param {function(mide.ComponentDescriptor)} callback called when saved complete
 * @param {function(mide.ComponentDescriptor)} callback called when saved complete
 * @public
 */
mide.core.registry.BaseRegistry.prototype.saveComponent = function(componentDescriptor, success, error) {
	
};

/**
 * Delete component
 * 
 * @param {mide.ComponentDescriptor}  componentDescriptor
 * @param {function} callback called when saved complete
 * @public
 */
mide.core.registry.BaseRegistry.prototype.deleteComponent = function(componentDescriptor, success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.getCompositions = function(success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.getUserCompositions = function(success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.createComposition = function(model, data, success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.saveComposition = function(id, model, data, success, error) {
	
};


/**
 * Get a list of all users compositions
 * 
 * @param {function(Array.<{id: string, data: Object}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mide.core.registry.BaseRegistry.prototype.deleteComposition = function(id, success, error) {
	
};