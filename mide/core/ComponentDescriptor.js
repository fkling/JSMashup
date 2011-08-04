goog.provide('mide.core.ComponentDescriptor');
goog.require('mide.core.Component');
goog.require('mide.parser');

goog.require('goog.array');
goog.require('goog.string');

/**
 * A mashup component descriptor. Once passed an XML Model file,
 * an instance of this class provides meta information about
 * a component and a method to create component instances.
 * 
 * @constructor
 */
mide.core.ComponentDescriptor = function() {
	this.operations = {};
	this.events = {};
	this.parameters = {};
};

/**
 * @type {Object}
 * @private
 */
mide.core.ComponentDescriptor.prototype.id = null;


/**
 * @type {string}
 * @private
 */
mide.core.ComponentDescriptor.prototype.name = '';

/**
 * @type {string}
 * @private
 */
mide.core.ComponentDescriptor.prototype.xml = '';

/**
 * @type {string}
 * @private
 */
mide.core.ComponentDescriptor.prototype.js = '';

/**
 * @type {Object.<string, {finished: boolean, requiredInputs: Array.<string>, depends: Array.<string>}>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.operations = null;

/**
 * @type {Object.<string, {depends: Array.<string>}>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.events = null;

/**
 * @type {Object.<string, string>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.calls = null;


/**
 * @type {Object.<string, Object>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.parameters = null;


/**
 * Set the XML model file. All information about a component are parsed
 * from this file.
 * 
 * @param {string} xml the XML configuration to create the component from
 * @public
 */
mide.core.ComponentDescriptor.prototype.setXml = function(xml) {
	this.xml = xml;
	
	var config = mide.parser.parse(xml).component[0];
	
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

/**
 * @return {string} containing XML
 * @public
 */
mide.core.ComponentDescriptor.prototype.getXml = function() {
	return this.xml;
};

/**
 * Sets the implementation of the component.
 * 
 * @param {string} js the implementation
 * @public
 */
mide.core.ComponentDescriptor.prototype.setJs = function(js) {
	this.js = js;
};

/**
 * @return {string} containing JavaScript
 * @public
 */
mide.core.ComponentDescriptor.prototype.getJs = function() {
	return this.js;
};

/**
 * @return {string}
 */
mide.core.ComponentDescriptor.prototype.getId = function() {
	return this.id;
};

/**
 * @param {string} id of the component
 */
mide.core.ComponentDescriptor.prototype.setId = function(id) {
	this.id = id;
};


/**
 * Returns the descriptive name as provided in the model file.
 * 
 * @return {string}
 */
mide.core.ComponentDescriptor.prototype.getName = function() {
	return this.name;
};


/**
 * Get an instance of the component defined by this descriptor.
 * 
 * @param {string} opt_instanceId The ID which should be assigned to the instance. Used
 *                 when a instance is created for a stored composition.
 * @param {Object} opt_config Configuration of the instance. Like the with the ID, this is used
 *                 to restore the configuration of a stored component instance.
 * @return {!mide.core.Component}
 * 
 * @public
 */
mide.core.ComponentDescriptor.prototype.getInstance = function(opt_instanceId, opt_config) {
	var instance = new mide.core.Component(this, opt_instanceId, opt_config);
	
	var f = new Function("exports", this.js);
	f(instance);
	
	return instance;
};


/**
 * Sets up the meta data to handle operations.
 * 
 * 
 * @param {Array} operations
 * @private
 */
mide.core.ComponentDescriptor.prototype.configureOperations = function(operations) {
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

/**
 * 
 */
mide.core.ComponentDescriptor.prototype.getOperations = function() {
	return this.operations;
};

mide.core.ComponentDescriptor.prototype.getEvents = function() {
	return this.events;
};

mide.core.ComponentDescriptor.prototype.getParameters = function() {
	return this.parameters;
};

/**
 * Sets up the meta data to handle calls.
 * 
 * @param {Array} event
 * @private
 */
mide.core.ComponentDescriptor.prototype.configureCalls = function(calls) {
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
mide.core.ComponentDescriptor.prototype.configureEvents = function(events) {
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
mide.core.ComponentDescriptor.prototype.configureEvent = function(ev) {
	this.events[ev.ref] = {
		depends: (ev.dependsOn ? goog.array.map(ev.dependsOn.split(','), goog.string.trim) : [])
	};
};

