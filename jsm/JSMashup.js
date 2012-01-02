/* The only purpose of this file is to load necessary 
 * dependencies at the beginning
 */
goog.provide('JSMashup');
goog.provide('jsm');

goog.require('jsm.core.Session');
goog.require('jsm.core.registry.ServerRegistry');
goog.require('jsm.core.Composition');

goog.require('goog.ui.Component');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.debug.FancyWindow');

// add some dependcies
goog.require('org.reseval.processor.DomainConceptMapper');
goog.require('org.reseval.processor.ServiceCall');
goog.require('jsm.processor.DataProcessorRegistry');
goog.require('jsm.validator.StaticDomainValidator');
goog.require('jsm.mapper.EMDLMapper');
goog.require('jsm.mapper.JSONMapper');
goog.require('jsm.core.DataTypeMapper');


/**
 * Main module for the IDE. Provides a public API to
 * simplify communication (facade).
 * 
 * Configuration parameters are so far:
 * 	- registry: The registry to be used for loading, saving components, compositions etc
 * 	- componentMapper: The mapper used to convert the textual representation of components
 * 	- compositionMapper: Same for compositions
 * 	- domainValidator: Used to ensure that the data types defined in the component are in the domain
 * 
 * @constructor
 * @export
 */
JSMashup = function(config) {
    if(goog.DEBUG) {
        // Create the debug window.
        var debugWindow = new goog.debug.FancyWindow('main');
        debugWindow.setEnabled(true);
        debugWindow.init();
    }

	window['JSMashup'] = JSMashup;
	jsm.core.Session.start();
	
	JSMashup.config = config;
	
	if(config.argumentMapper) {
		jsm.core.Composition.setArgumentMapper(config.argumentMapper);
	}
};

/**
 * @param {jsm.core.registry.BaseRegistry} registry
 * @export
 */
JSMashup.setRegistry = function(registry) {
	this.registry = registry;
};


/**
 * Gets a list of objects which represent a component. Each object
 * has the following properties;
 * <ul>
 * <li>id: The global ID of the component
 * <li>name: The human readable name
 * <li>description: A more detailed description
 * <li>categories: An array of strings representing categories
 * </ul>
 * 
 * @param {function} callback The list is passed as fist parameter
 * @param {string} opt_search A list of search parameters to filter the components
 * @param {boolean} opt_forceReload Whether to re-fetch the list from the server
 * 
 * @public
 * @export
 */
JSMashup.getComponentList = function(callback, error, opt_search, opt_forceReload) {
	JSMashup.registry.getComponents(callback, error);
};


/**
 * Gets a list of objects which represent a component created by the currently logged in user.
 * 
 * @see jsm.JSMashup.prototype.getComponentList
 * 
 * @param {function} success The list is passed as fist parameter
 * @param {string} opt_search A list of search parameters to filter the components
 * @param {boolean} opt_forceReload Whether to re-fetch the list from the server
 * 
 * @public
 */
JSMashup.getUserComponentList = function(success, error, opt_search, opt_forceReload) {
	JSMashup.registry.getUserComponents(success, error);
};



/**
 * Loads the component descriptor for the component with ID <code>id</code> and
 * passes it as first argument to the callback.
 * 
 * @param {string} id of the component
 * @param {function} success A list of search parameters to filter the components
 * 
 * @public
 * @export
 */
JSMashup.getComponentDescriptor = function(id, callback, error) {
	JSMashup.registry.getComponentDescriptorById(id, callback, error);
};

/**
 * @export
 */
JSMashup.saveComponent = function(descriptor, data, success, error) {
	JSMashup.registry.saveComponent(descriptor, data, success, error);
};

/**
 * @export
 */
JSMashup.deleteComponent = function(id, success, error) {
	JSMashup.registry.deleteComponent(id, success, error);
};

/**
 * Validates a component descriptor. Internally calls the validation
 * function of the component mapper and the domain validator.
 * 
 * @param {jsm.core.ComponentDescriptor} descriptor
 * @param {function} valid
 * @param {function} invalid
 * 
 * @public
 * @export
 */
JSMashup.validateComponent = function(descriptor, valid, invalid) {
	if(JSMashup.config.componentMapper) {
		// first validate the model
		JSMashup.config.componentMapper.validate(descriptor, function() {
			// then the domain
			JSMashup.config.domainValidator.validateComponent(descriptor, valid, invalid);
		}, invalid);
	}
	else {
		valid(descriptor);
	}
};

/**
 * @export
 */
JSMashup.getEmptyComponentDescriptor = function() {
	return new jsm.core.ComponentDescriptor();
};

/**
 * Gets a list of objects which represent a composition. Each object
 * has the following properties;
 * <ul>
 * <li>id: The global ID of the component
 * <li>name: The human readable name
 * <li>description: A more detailed description
 * <li>categories: An array of strings representing categories
 * </ul>
 * 
 * @param {function} callback The list is passed as fist parameter
 * @param {string} opt_search A list of search parameters to filter the components
 * @param {boolean} opt_forceReload Whether to re-fetch the list from the server
 * 
 * @public
 * @export
 */
JSMashup.getCompositionList = function(callback, opt_search, opt_forceReload) {
	JSMashup.registry.getCompositions(callback);
};


/**
 * Gets a list of objects which represent a component created by the currently logged in user.
 * 
 * @see jsm.JSMashup.prototype.getComponentList
 * 
 * @param {function} callback The list is passed as fist parameter
 * @param {string} opt_search A list of search parameters to filter the components
 * @param {boolean} opt_forceReload Whether to re-fetch the list from the server
 * 
 * @public
 * @export
 */
JSMashup.getUserCompositionList = function(callback, error, opt_search, opt_forceReload) {
	JSMashup.registry.getUserCompositions(callback, error);
};



/**
 * Loads the component descriptor for the component with ID <code>id</code> and
 * passes it as first argument to the callback.
 * 
 * @param {string} id of the component
 * @param {function} callback A list of search parameters to filter the components
 * 
 * @public
 * @export
 */
JSMashup.getComposition = function(id, callback, error) {
	JSMashup.registry.getComposition(id, callback, error);
};

/**
 * @export
 */
JSMashup.createComposition = function(model, data, callback, error) {
	JSMashup.registry.createComposition(model, data, callback, error);
};

/**
 * @export
 */
JSMashup.saveComposition = function(id, model, data, callback, error) {
	JSMashup.registry.saveComposition(id, model, data, callback, error);
};

/**
 * @export
 */
JSMashup.deleteComposition = function(id, callback, error) {
	JSMashup.registry.deleteComposition(id, callback, error);
};
