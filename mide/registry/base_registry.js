goog.provide('mide.core.registry');
goog.provide('mide.core.registry.BaseRegistry');
goog.provide('mide.config.registry');


/**
 * Registry configuration. `type` should refer to an object inheriting
 * from `mide.core.registry.BaseRegistry`. The `options` property will
 * be passed to constructor.
 * 
 * @public
 */
mide.config.registry = {
	type: null,
	options: {}
}


/**
 * Get current registry instance
 * 
 * @public
 */
mide.core.registry.getInstance = function() {
	if(!mide.config.registry.type) {
		return null;
	}
	
	if(!mide.core.registry.instance) {
		mide.core.registry.instance = new mide.config.registry.type(mide.config.registry.options);
	}
	return mide.core.registry.instance;
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
};

/**
 * @public
 */
mide.core.registry.BaseRegistry.prototype.load = function(cb) {
	cb(this);
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