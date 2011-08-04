goog.provide('mashupIDE.core.ComponentDescriptor');
goog.require('mashupIDE.core.Component');
goog.require('mashupIDE.parser');

goog.require('goog.array');
goog.require('goog.string');

/**
 * The basic structure for a mashup component
 * 
 * @param {Object} config the parsed configuration from XML
 * @param {Object=} opt_id  id of the the element in the composition
 * @param {string=} opt_xml  the XML configuration the component was created from
 * @param {Object=} opt_domHelper
 * @constructor
 */
mashupIDE.core.ComponentDescriptor = function() {
	this.operations = {};
	this.events = {};
	this.parameters = {};
};



/**
 * @type {Object}
 * @public
 */
mashupIDE.core.ComponentDescriptor.prototype.id = null;


/**
 * @type {string}
 * @public
 */
mashupIDE.core.ComponentDescriptor.prototype.name = '';

/**
 * @type {string}
 * @public
 */
mashupIDE.core.ComponentDescriptor.prototype.xml = '';

/**
 * @type {string}
 * @public
 */
mashupIDE.core.ComponentDescriptor.prototype.js = '';

/**
 * @type {Object.<string, {finished: boolean, requiredInputs: Array.<string>, depends: Array.<string>}>}
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.operations = null;

/**
 * @type {Object.<string, {depends: Array.<string>}>}
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.events = null;

/**
 * @type {Object.<string, string>}
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.calls = null;


/**
 * @type {Object.<string, Object>}
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.parameters = null;


/**
 * 
 * @param {string} xml the XML configuration to create the component from
 * @param {Object=} opt_id id of the the element in the composition
 * @param opt_domHelper
 */
mashupIDE.core.ComponentDescriptor.prototype.setXml = function(xml) {
	this.xml = xml;
	
	var config = mashupIDE.parser.parse(xml).component[0];
	
	this.name = config.name;
	this.autorun = config.autorun;
	this.id = config.id;	
	
	this.operations = {};
	this.events = {};
	this.calls = {};
	this.configureOperations(config.operation || []);
	this.configureEvents(config.event || []);
	this.configureCalls(config.call || []);
	this.parameters = config.configuration[0].input || [];
};

mashupIDE.core.ComponentDescriptor.prototype.getXml = function(xml) {
	return this.xml;
};

mashupIDE.core.ComponentDescriptor.prototype.setJs = function(js) {
	this.js = js;
};


mashupIDE.core.ComponentDescriptor.prototype.getJs = function() {
	return this.js;
};


mashupIDE.core.ComponentDescriptor.prototype.getId = function() {
	return this.id;
};


mashupIDE.core.ComponentDescriptor.prototype.setId = function(id) {
	this.id = id;
};

mashupIDE.core.ComponentDescriptor.prototype.getInstance = function(opt_instanceId, opt_config, opt_domHelper) {
	var instance = new mashupIDE.core.Component(this, opt_instanceId, opt_config, opt_domHelper);
	
	var f = new Function("exports", this.js);
	f(instance);
	
	return instance;
};

mashupIDE.core.ComponentDescriptor.prototype.getName = function() {
	return this.name;
};


/**
 * Sets up the meta data to handle operations.
 * 
 * 
 * @param {Array} operations
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.configureOperations = function(operations) {
	var i, j, op,       // loop variables
		required, inputs;
		
	
	for(i = operations.length; i--; ) {
		op = operations[i];
		required = [];
		inputs = op.input || [];
		for(j = inputs.length; j--; ) {
			if(inputs[j].required && inputs[j].required === 'true') {
				required.push(inputs[j].name);
			}
		}
	
		this.operations[op.ref] = {
			finished: false,
			async: (op.async && op.async === 'true'),
			requiredInputs: required,
			depends: (op.dependsOn ? op.dependsOn.split(/\s*,\s*/) : [])
		};
		
		// if the operation generates output, an event with the same name will be created
		if(op.output) {
			this.configureEvent({ref: op.ref + "Output"});
		}
	}
};

mashupIDE.core.ComponentDescriptor.prototype.getOperations = function() {
	return this.operations;
};

mashupIDE.core.ComponentDescriptor.prototype.getEvents = function() {
	return this.events;
};

mashupIDE.core.ComponentDescriptor.prototype.getParameters = function() {
	return this.parameters;
};

/**
 * Sets up the meta data to handle events.
 * 
 * @param {Array} event
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.configureCalls = function(calls) {
	var i, name;

	for(i = calls.length; i--; ) {
		name = calls[i].ref;
		this.calls[name] = true;
		if(calls[i].output) {
			this.configureEvent({ref: name});
		}
	}
};


/**
 * Sets up the meta data to handle events.
 * 
 * @param {Array} event
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.configureEvents = function(events) {
	var i;
		
	for(i = events.length; i--; ) {
		this.configureEvent(events[i]);
	}
};

/**
 * Sets up the meta data to handle event.
 * 
 * @param {Object} event
 * @private
 */
mashupIDE.core.ComponentDescriptor.prototype.configureEvent = function(ev) {
	this.events[ev.ref] = {
		depends: (ev.dependsOn ? goog.array.map(ev.dependsOn.split(','), goog.string.trim) : [])
	};
};

