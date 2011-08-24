/* The only purpose of this file is to load necessary 
 * dependencies at the beginning
 */
goog.provide('MashupIDE');

goog.require('mide.core.Session');
goog.require('mide.PubSub');
goog.require('mide.core.registry.ServerRegistry');

goog.require('goog.ui.Component');
goog.require('goog.object');
goog.require('goog.array');




/**
 * Main module for the IDE. Provides a public API to
 * simplify communication (facade).
 * 
 * @constructor
 */
MashupIDE = function(config) {
	window.MashupIDE = MashupIDE;
	mide.core.Session.start();
};

/**
 * @param {mide.core.registry.BaseRegistry} registry
 */
MashupIDE.setRegistry = function(registry) {
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
 */
MashupIDE.getComponentList = function(callback, error, opt_search, opt_forceReload) {
	MashupIDE.registry.getComponents(callback, error);
};


/**
 * Gets a list of objects which represent a component created by the currently logged in user.
 * 
 * @see mide.MashupIDE.prototype.getComponentList
 * 
 * @param {function} callback The list is passed as fist parameter
 * @param {string} opt_search A list of search parameters to filter the components
 * @param {boolean} opt_forceReload Whether to re-fetch the list from the server
 * 
 * @public
 */
MashupIDE.getUserComponentList = function(callback, error, opt_search, opt_forceReload) {
	MashupIDE.registry.getUserComponents(callback, error);
};



/**
 * Loads the component descriptor for the component with ID <code>id</code> and
 * passes it as first argument to the callback.
 * 
 * @param {string} id of the component
 * @param {function} callback A list of search parameters to filter the components
 * 
 * @public
 */
MashupIDE.getComponentDescriptor = function(id, callback, error) {
	MashupIDE.registry.getComponentDescriptorById(id, callback, error);
};

MashupIDE.saveComponent = function(id, model, implementation, data, callback, error) {
	MashupIDE.registry.saveComponent(id, model, implementation, data, callback, error);
};

MashupIDE.deleteComponent = function(id, callback, error) {
	MashupIDE.registry.deleteComponent(id, callback, error);
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
 */
MashupIDE.getCompositionList = function(callback, opt_search, opt_forceReload) {
	MashupIDE.registry.getCompositions(callback);
};


/**
 * Gets a list of objects which represent a component created by the currently logged in user.
 * 
 * @see mide.MashupIDE.prototype.getComponentList
 * 
 * @param {function} callback The list is passed as fist parameter
 * @param {string} opt_search A list of search parameters to filter the components
 * @param {boolean} opt_forceReload Whether to re-fetch the list from the server
 * 
 * @public
 */
MashupIDE.getUserCompositionList = function(callback, error, opt_search, opt_forceReload) {
	MashupIDE.registry.getUserCompositions(callback, error);
};



/**
 * Loads the component descriptor for the component with ID <code>id</code> and
 * passes it as first argument to the callback.
 * 
 * @param {string} id of the component
 * @param {function} callback A list of search parameters to filter the components
 * 
 * @public
 */
MashupIDE.getComposition = function(id, callback, error) {
	MashupIDE.registry.getComposition(id, callback, error);
};

MashupIDE.createComposition = function(model, data, callback, error) {
	MashupIDE.registry.createComposition(model, data, callback, error);
};

MashupIDE.saveComposition = function(id, model, data, callback, error) {
	MashupIDE.registry.saveComposition(id, model, data, callback, error);
};

MashupIDE.deleteComposition = function(id, callback, error) {
	MashupIDE.registry.deleteComposition(id, callback, error);
};
