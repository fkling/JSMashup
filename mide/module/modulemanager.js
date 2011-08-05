goog.provide('mide.module.ModuleManager');

goog.require('mide.module.ModuleLoader');
goog.require('goog.module.ModuleManager');


/**
 * Manages external modules such as input elements,
 * data converters and component implementations.
 * 
 * @extends goog.module.ModuleManager
 * @constructor
 */
mide.module.ModuleManager = function() {
	goog.module.ModuleManager.call(this);
	this.setLoader(new mide.module.ModuleLoader(this));
	
	/**
	 * Name, URI mapping to keep track of modules
	 * 
	 * @type{Object}
	 * @private
	 */
	this.trackedModules_ = {};
};

goog.inherits(mide.module.ModuleManager, goog.module.ModuleManager);
goog.addSingletonGetter(mide.module.ModuleManager);

/**
 * Loads the module and calls opt_callback when it is available.
 * 
 * @param {string} name fully qualified name
 * @param {string} uri
 * @param {function} callback called when module is available
 * 
 * @public
 */
mide.module.ModuleManager.prototype.load = function(name, uri, callback) {
	if(!this.trackedModules_[name]) {
		var map = {}, uris = {};
		this.trackedModules_[name] = uri;
		map[name] = [];
		this.setAllModuleInfo(map);
		uris[name] = uri;
		this.setModuleUris(uris);
	}
	this.execOnLoad(name, callback, undefined, false, true);
};