/*global goog: true, jsm: true */
/*jshint strict:false */
goog.provide('jsm.core.ComponentDescriptor');
goog.require('jsm.core.Component');
goog.require('jsm.processor.DataProcessorRegistry');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.async.Deferred');
goog.require('goog.debug');
goog.require('goog.debug.Logger');

/**
 * A mashup component descriptor. Once passed an XML Model file,
 * an instance of this class provides meta information about
 * a component and a method to create component instances.
 * 
 * @constructor
 */
jsm.core.ComponentDescriptor = function(mapper) {
	this.mapper = mapper;
	
	this.operations = [];
	this.events = [];
	this.parameters = [];
	this.requests = [];
	this.data = {};
	this.processorRegistry = jsm.processor.DataProcessorRegistry.getInstance();

    this.logger_ = goog.debug.Logger.getLogger('jsm.core.ComponentDescriptor');
};

/**
 * @type {Object}
 * @private
 */
jsm.core.ComponentDescriptor.prototype.id = null;


/**
 * @type {Object|string}
 * @private
 */
jsm.core.ComponentDescriptor.prototype.mapper = null;
jsm.core.ComponentDescriptor.prototype.model = '';

/**
 * @type {string}
 * @private
 */
jsm.core.ComponentDescriptor.prototype.implementation = '';

/**
 * @type {Object.<Operation>}
 * @private
 */
jsm.core.ComponentDescriptor.prototype.operations = null;

/**
 * @type {Object.<Event>}
 * @private
 */
jsm.core.ComponentDescriptor.prototype.events = null;

/**
 * @type {Object.<Paramter>}
 * @private
 */
jsm.core.ComponentDescriptor.prototype.parameters = null;


/**
 * Set the mapper with which this instance was created
 * Set the XML model file. All information about a component are parsed
 * from this file.
 * 
 * @param {jsm.mapper.ComponentMapper} mapper
 * @param {string} xml the XML configuration to create the component from
 * @public
 */
jsm.core.ComponentDescriptor.prototype.setMapper = function(mapper) {
	this.mapper = mapper;
};


/**
 * Sets the implementation of the component.
 * 
 * @param {string} js the implementation
 * @public
 */
jsm.core.ComponentDescriptor.prototype.getMapper = function() {
	return this.mapper;	
};

/**
 * @return {string}
 */
jsm.core.ComponentDescriptor.prototype.getId = function() {
	return this.id;
};

/**
 * @param {string} id of the component
 */
jsm.core.ComponentDescriptor.prototype.setId = function(id) {
	this.id = id;
};

/**
 * Returns the operation with the given name (if any).
 * 
 * @param {string} name
 * @return {?jsm.component.Operation}
 * 
 * @public
 */
jsm.core.ComponentDescriptor.prototype.getOperation = function(name) {
	return goog.array.find(this.operations, function(op){
		return op.getRef() === name;
	});
};


/**
 * @return {Array} a list of jsm.component.Operation 
 */
jsm.core.ComponentDescriptor.prototype.getOperations = function() {
	return this.operations;
};


/**
 * Returns the event with the given name (if any).
 * 
 * @param {string} name
 * @return {?jsm.component.Event}
 * 
 * @public
 */
jsm.core.ComponentDescriptor.prototype.getEvent = function(name) {
	var event =  goog.array.find(this.events, function(event){
		return event.getRef() === name;
	});
	
	if(!event) {
		event = goog.array.find(this.operations, function(operation){
			return operation.getRef() === name && operation.getOutputs().length > 0;
		});
	}
	return event;
};


/**
 * @return {Array} a list of jsm.component.Event
 */
jsm.core.ComponentDescriptor.prototype.getEvents = function() {
	return this.events;
};

/**
 * @return {Object} a map of jsm.core.Parameter
 */
jsm.core.ComponentDescriptor.prototype.getParameters = function() {
	return this.parameters;
};


/**
 * @return {Object} a map of jsm.core.Parameter
 */
jsm.core.ComponentDescriptor.prototype.getRequests = function() {
	return this.requests;
};


/**
 * @param {Object} a map of jsm.core.Operation
 */
jsm.core.ComponentDescriptor.prototype.setOperations = function(operations) {
	this.operations = operations;
};

/**
 * @param {Object} a map of jsm.core.Event 
 */
jsm.core.ComponentDescriptor.prototype.setEvents = function(events) {
	this.events = events;
};

/**
 * @param {Object} a map of jsm.core.Parameter 
 */
jsm.core.ComponentDescriptor.prototype.setParameters = function(parameters) {
	this.parameters = parameters;
};


/**
 * @param {Array} requests
 */
jsm.core.ComponentDescriptor.prototype.setRequests = function(requests) {
	this.requests = requests;
};


/**
 * @param {Object}
 */
jsm.core.ComponentDescriptor.prototype.setData = function(data, value, overwrite) {
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
 * @param {Object} a map of jsm.core.Parameter 
 */
jsm.core.ComponentDescriptor.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
};


/**
 * Get an instance of the component defined by this descriptor. This is an asynchronous operation.
 * 
 * @param {string} opt_instanceId The ID which should be assigned to the instance. Used
 *                 when a instance is created for a stored composition.
 * @param {Object} opt_config Configuration of the instance. Like the with the ID, this is used
 *                 to restore the configuration of a stored component instance.
 * @param {function} opt_callback - Callback which gets the new instance.
 *
 * @return {!goog.async.Deferred}
 * 
 * @public
 */
jsm.core.ComponentDescriptor.prototype.getInstance = function(opt_instanceId, opt_config, opt_callback) {
    var self = this;
    if(goog.isFunction(opt_instanceId)) {
        opt_callback = opt_instanceId;
        opt_instanceId = undefined;
    }
    else if(goog.isFunction(opt_config)) {
        opt_callback = opt_config;
        opt_config = undefined;
    }

    var deferred = new goog.async.Deferred(),
        instance = this.mapper.getInstance(this, opt_instanceId, opt_config);

    this.processorRegistry.getProcessorManager(instance, function(manager) {
        instance.setProcessorManager(manager);
        self.logger_.info('Instance created: ' + goog.debug.expose(instance));
        if(opt_callback) {
            opt_callback(instance);
        }
        deferred.callback(instance);
    });

    return deferred;
};


/**
 * Validates the component descriptor according to its model. 
 * 
 * @param {function} callback - a function receiving two parameters, a boolean and a list of errors
 */
jsm.core.ComponentDescriptor.prototype.validate = function(callback) {
	this.mapper.validate(callback);
};
