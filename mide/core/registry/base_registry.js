goog.provide('mashupIDE.core.registry');
goog.provide('mashupIDE.core.registry.BaseRegistry');
goog.provide('mashupIDE.config.registry');


/**
 * Registry configuration. `type` should refer to an object inheriting
 * from `mashupIDE.core.registry.BaseRegistry`. The `options` property will
 * be passed to constructor.
 * 
 * @public
 */
mashupIDE.config.registry = {
	type: null,
	options: {}
}


/**
 * Get current registry instance
 * 
 * @public
 */
mashupIDE.core.registry.getInstance = function() {
	if(!mashupIDE.config.registry.type) {
		return null;
	}
	
	if(!mashupIDE.core.registry.instance) {
		mashupIDE.core.registry.instance = new mashupIDE.config.registry.type(mashupIDE.config.registry.options);
	}
	return mashupIDE.core.registry.instance;
};


/**
 * Abstract class providing the interface to save
 * and load components.
 * 
 * @interface
 * @constructor
 */
mashupIDE.core.registry.BaseRegistry = function(options) {
	this.options = options || {};
};

/**
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.load = function(cb) {
	cb(this);
};

/**
 * Get a list of all users components
 * 
 * @param {function(Array.<{id: string, description: string}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.getComponents = function(success, error) {
	
};

/**
 * Get a list of all users components
 * 
 * @param {function(Array.<{id: string, description: string, public: boolean}>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.getUserComponents = function(success, error) {
	
};

/**
 * Get component descriptor via ID
 * 
 * @param {string} id the FQN of the component
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.getComponentDescriptorById = function(id, success, error) {
	
};

/**
 * Get component descriptor via URL
 * 
 * @param {string} url of the model file
 * @param {function(Array.<mshupIDE.core.ComponentDescriptor>)} success callback
 * @param {function(string)} error callback
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};

/**
 * Save component
 * 
 * @param {mashupIDE.core.ComponentDescriptor>} componentDescriptor
 * @param {function(mashupIDE.ComponentDescriptor)} callback called when saved complete
 * @param {function(mashupIDE.ComponentDescriptor)} callback called when saved complete
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.saveComponent = function(componentDescriptor, success, error) {
	
};

/**
 * Delete component
 * 
 * @param {mashupIDE.ComponentDescriptor}  componentDescriptor
 * @param {function} callback called when saved complete
 * @public
 */
mashupIDE.core.registry.BaseRegistry.prototype.deleteComponent = function(componentDescriptor, success, error) {
	
};