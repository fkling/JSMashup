goog.provide('mide.core.Session');
goog.provide('mide.config.session');

goog.require('goog.ui.IdGenerator');
goog.require('goog.object');

/**
 * @constructor
 * @private
 */
mide.core.Session = function() {
	this.id_generator = goog.ui.IdGenerator.getInstance();
	this.session_id = this.getSessionId();
};


/**
 * @public
 */
mide.core.Session.start = function() {
	if(!mide.core.Session.instance) {
		mide.core.Session.instance = new mide.core.Session();
	}
	return mide.core.Session.instance;
};

/**
 * @public
 */
mide.core.Session.getInstance = function(cb) {
	return mide.core.Session.instance;
};

/**
 * @private
 */
mide.core.Session.instance = null;

/**
 * @private
 */
mide.core.Session.prototype.session_id = null;


/**
 * @private
 */
mide.core.Session.prototype.id_generator = null;

/**
 * @return {string}
 * 
 * @public
 */
mide.core.Session.prototype.getId = function() {
	return this.session_id;
};


/**
 * @return {string}
 * 
 * @protected
 */
mide.core.Session.prototype.getSessionId = function() {
	return this.id_generator.getNextUniqueId() + Date.now();
};

/****** OLD STUFF ********/

/**
 * @public
 */
mide.core.Session.prototype.loadComposition = function(composition, cb) {
	console.log(composition);
	this.composition_ = composition;
	var modules = [];
	for(var item in composition.working.modules) {
		var config = composition.working.modules[item];
		goog.object.extend(config.config, config.value, {design: false, close: false, draggable: false, ddHandler: false});
		modules.push(config.config);
	}
	
	mide.PubSub.clear();
	
	mide.Canvas.getInstance().loadComposition(modules, composition.working.wires);
	mide.Canvas.getInstance().show();
};

/**
 * @public
 */
mide.core.Session.prototype.runComposition = function() {
	mide.Canvas.getInstance();
};

mide.core.Session.prototype.registerEventHandlers = function(modules, wires) {
	mide.PubSub.clear();
	
	for(var i = wires.length; i--; ) {
		var wireConfig = wires[i];
		mide.PubSub.connect(modules[wireConfig.src.moduleId].instanceId, 
				wireConfig.src.terminal, 
				modules[wireConfig.tgt.moduleId].instanceId, 
				wireConfig.tgt.terminal);
	}
};

mide.core.Session.prototype.getComponent = function(id, cb) {
	mide.registry.ServerRegistry.getInstance().getComponent(id, function(descriptor){
		var config = mide.core.Session.mapping[descriptor.getName()];

		var instance = descriptor.getInstance();
		if(config) {
			instance.addDataProcessor(new mide.ServiceCallConverter(config));
		}
		
		cb(instance);
	});
};


