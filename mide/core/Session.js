goog.provide('mashupIDE.core.Session');
goog.provide('mashupIDE.config.session');

goog.require('mashupIDE.Canvas');
goog.require('mashupIDE.ServiceCallConverter');

goog.require('goog.ui.IdGenerator');
goog.require('goog.object');

/**
 * @constructor
 * @private
 */
mashupIDE.core.Session = function() {
	this.id_generator = goog.ui.IdGenerator.getInstance();
	this.session_id = this.getSessionId();
};


/**
 * @public
 */
mashupIDE.core.Session.start = function() {
	if(!mashupIDE.core.Session.instance) {
		mashupIDE.core.Session.instance = new mashupIDE.core.Session();
	}
	return mashupIDE.core.Session.instance;
};

/**
 * @public
 */
mashupIDE.core.Session.getInstance = function(cb) {
	return mashupIDE.core.Session.instance;
};

/**
 * @private
 */
mashupIDE.core.Session.instance = null;

/**
 * @private
 */
mashupIDE.core.Session.prototype.session_id = null;


/**
 * @private
 */
mashupIDE.core.Session.prototype.id_generator = null;

/**
 * @return {string}
 * 
 * @public
 */
mashupIDE.core.Session.prototype.getId = function() {
	return this.session_id;
};


/**
 * @return {string}
 * 
 * @protected
 */
mashupIDE.core.Session.prototype.getSessionId = function() {
	return this.id_generator.getNextUniqueId() + Date.now();
};

/****** OLD STUFF ********/

/**
 * @public
 */
mashupIDE.core.Session.prototype.loadComposition = function(composition, cb) {
	console.log(composition);
	this.composition_ = composition;
	var modules = [];
	for(var item in composition.working.modules) {
		var config = composition.working.modules[item];
		goog.object.extend(config.config, config.value, {design: false, close: false, draggable: false, ddHandler: false});
		modules.push(config.config);
	}
	
	mashupIDE.PubSub.clear();
	
	mashupIDE.Canvas.getInstance().loadComposition(modules, composition.working.wires);
	mashupIDE.Canvas.getInstance().show();
};

/**
 * @public
 */
mashupIDE.core.Session.prototype.runComposition = function() {
	mashupIDE.Canvas.getInstance();
};

mashupIDE.core.Session.prototype.registerEventHandlers = function(modules, wires) {
	mashupIDE.PubSub.clear();
	
	for(var i = wires.length; i--; ) {
		var wireConfig = wires[i];
		mashupIDE.PubSub.connect(modules[wireConfig.src.moduleId].instanceId, 
				wireConfig.src.terminal, 
				modules[wireConfig.tgt.moduleId].instanceId, 
				wireConfig.tgt.terminal);
	}
};

mashupIDE.core.Session.prototype.getComponent = function(id, cb) {
	mashupIDE.registry.ServerRegistry.getInstance().getComponent(id, function(descriptor){
		var config = mashupIDE.core.Session.mapping[descriptor.getName()];

		var instance = descriptor.getInstance();
		if(config) {
			instance.addDataProcessor(new mashupIDE.ServiceCallConverter(config));
		}
		
		cb(instance);
	});
};

mashupIDE.core.Session.mapping = {
			'GetResearcher': {
				'researchers': {url: 'http://dev.liquidjournal.org:8081/resevalmash-api/resources/italianSource/getResearchers', 
					overwriteResult: true
				}
			},
			'MASSource': {
				'setResearchers': {url: 'http://dev.liquidjournal.org:8081/resevalmash-api/resources/masSource/setResearchers', 
					overwriteResult: true,
					passthrough: true
				}
			}
};



