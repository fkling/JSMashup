goog.provide('jsm.module.ModuleLoader');

goog.require('goog.module.ModuleLoader');


/**
 * A module loader that works together with
 * the module manager.
 * 
 * @param {goog.module.ModuleManager} manager
 * 
 * @extends goog.module.ModuleLoader
 * @constructor
 */
jsm.module.ModuleLoader = function(manager) {
	goog.module.ModuleLoader.call(this);
	
	/**
	 * @type{goog.module.ModuleManager}
	 * @private
	 */
	this.moduleManager_ = manager;
};

goog.inherits(jsm.module.ModuleLoader, goog.module.ModuleLoader);

/**
 * @override
 */
jsm.module.ModuleLoader.prototype.loadModulesInternal = function(ids, moduleInfoMap,
		opt_successFn, opt_errorFn, opt_timeoutFn, opt_forceReload) {
	
	var fn = goog.bind(function() {
		for(var i = ids.length; i--; ) {
			this.moduleManager_.setLoaded(ids[i]);
		}
		if(opt_successFn) opt_successFn();
	}, this);
	jsm.module.ModuleLoader.superClass_.loadModulesInternal.call(this, ids, moduleInfoMap, fn, opt_errorFn, opt_timeoutFn, opt_forceReload);
};
