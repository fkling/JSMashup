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
mide.core.ComponentDescriptor = function(mapper) {
	this.mapper = mapper;
	
	this.operations = [];
	this.events = [];
	this.parameters = [];
	this.requests = [];
	this.data = {};
	this.processorProvider = null;
};

/**
 * @type {Object}
 * @private
 */
mide.core.ComponentDescriptor.prototype.id = null;


/**
 * @type {Object|string}
 * @private
 */
mide.core.ComponentDescriptor.prototype.mapper = null;
mide.core.ComponentDescriptor.prototype.model = '';

/**
 * @type {string}
 * @private
 */
mide.core.ComponentDescriptor.prototype.implementation = '';

/**
 * @type {Object.<Operation>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.operations = null;

/**
 * @type {Object.<Event>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.events = null;

/**
 * @type {Object.<Paramter>}
 * @private
 */
mide.core.ComponentDescriptor.prototype.parameters = null;



mide.core.ComponentDescriptor.prototype.setProcessorProvider = function(p) {
	this.processorProvider = p;
};


/**
 * Set the mapper with which this instance was created
 * Set the XML model file. All information about a component are parsed
 * from this file.
 * 
 * @param {mide.mapper.ComponentMapper} mapper
 * @param {string} xml the XML configuration to create the component from
 * @public
 */
mide.core.ComponentDescriptor.prototype.setMapper = function(mapper) {
	this.mapper = mapper;
};

mide.core.ComponentDescriptor.prototype.setModel = function(model) {
	this.model = model;
};

/**
 * @return {mide.mapper.ComponentMapper}
 * @return {Object|string}
 * @public
 */
mide.core.ComponentDescriptor.prototype.getModel = function() {
	return this.model;
};

/**
 * Sets the implementation of the component.
 * 
 * @param {string} js the implementation
 * @public
 */
mide.core.ComponentDescriptor.prototype.getMapper = function() {
	return this.mapper;	
};

mide.core.ComponentDescriptor.prototype.setImplementation = function(implementation) {
	this.implementation = implementation;
};

/**
 * @return {string}
 * @public
 */
mide.core.ComponentDescriptor.prototype.getImplementation = function() {
	return this.implementation;
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
 * @return {Object} a map of mide.core.Operation 
 */
mide.core.ComponentDescriptor.prototype.getOperations = function() {
	return this.operations;
};

/**
 * @return {Object} a map of mide.core.Event
 */
mide.core.ComponentDescriptor.prototype.getEvents = function() {
	return this.events;
};

/**
 * @return {Object} a map of mide.core.Parameter
 */
mide.core.ComponentDescriptor.prototype.getParameters = function() {
	return this.parameters;
};


/**
 * @return {Object} a map of mide.core.Parameter
 */
mide.core.ComponentDescriptor.prototype.getRequests = function() {
	return this.requests;
};


/**
 * @param {Object} a map of mide.core.Operation
 */
mide.core.ComponentDescriptor.prototype.setOperations = function(operations) {
	this.operations = operations;
};

/**
 * @param {Object} a map of mide.core.Event 
 */
mide.core.ComponentDescriptor.prototype.setEvents = function(events) {
	this.events = events;
};

/**
 * @param {Object} a map of mide.core.Parameter 
 */
mide.core.ComponentDescriptor.prototype.setParameters = function(parameters) {
	this.parameters = parameters;
};


/**
 * @param {Array} requests
 */
mide.core.ComponentDescriptor.prototype.setRequests = function(requests) {
	this.requests = requests;
};


/**
 * @param {Object}
 */
mide.core.ComponentDescriptor.prototype.setData = function(data, value, overwrite) {
	if(arguments.length == 2 && goog.isString(data)) {
		this.data[data] = value;
	}
	else {
		if(overwrite) {
			this.data = data;
		}
		else {
			for(var name in data) {
				if(data.hasOwnProperty(name)) {
					this.data[name] = data[name];
				}
			}
		}
	}
};

/**
 * @param {Object} a map of mide.core.Parameter 
 */
mide.core.ComponentDescriptor.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
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
	return this.mapper.getInstance(this, opt_instanceId, opt_config);
};


/**
 * Validates the component descriptor according to its model. 
 * 
 * @param {function} callback - a function receiving two parameters, a boolean and a list of errors
 */
mide.core.ComponentDescriptor.prototype.validate = function(callback) {
	this.mapper.validate(callback);
};