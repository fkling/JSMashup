goog.provide('mide.core.Component');
goog.provide('mide.core.Component.Events');

goog.require('mide.core.OperationManager');
goog.require('mide.util.OptionMap');
goog.require('mide.ui.ConfigurationDialog');

goog.require('goog.pubsub.PubSub');
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.object');


/**
 * This class contains all the runtime logic for components. 
 * 
 * 
 */
mide.core.Component = function(componentDescriptor, opt_id, opt_config) {
	goog.base(this);
	this.Events = mide.core.Component.Events;
	
	this.id = opt_id;
	this.descriptor = componentDescriptor;

	this.requests = {};
	
	goog.array.forEach(this.descriptor.getRequests(), function(request) {
		this.requests[request.ref] = request;
	}, this);
	
	this.operationManager = new mide.core.OperationManager(this, this.descriptor.getOperations());

	
	this.configurationDialog = new mide.ui.ConfigurationDialog(componentDescriptor.getParameters());
	this.configurationDialog.createDom();
	
	goog.events.listen(this.configurationDialog, 'change', function() {
		this.publish(mide.core.Component.Events.CONFIG_CHANGED, this);
	}, false, this);
	
	if(opt_config) {
		this.setConfiguration(opt_config);
	}
};

goog.inherits(mide.core.Component, goog.pubsub.PubSub);


/**
 * @type {Object}
 * @public
 */
mide.core.Component.prototype.id = null;


/**
 * @type {mide.ui.ConfigurationDialog}
 * @private
 */
mide.core.Component.prototype.configurationDialog = null;

/**
 * @type {mide.core.OperationManager}
 * @private
 */
mide.core.Component.prototype.operationManager = null;


/**
 * Data process manager
 * 
 * @type {mide.processor.ProcessorManager}
 * @private
 */
mide.core.Component.prototype.processorManager = null;


/**
 * Composition this component belongs to
 * 
 * @private
 */
mide.core.Component.prototype.composition = null;


/**
 * @param {string} id
 * 
 * @public
 */
mide.core.Component.prototype.setId = function(id) {
	if(id) {
		this.id = id;	
	}
};

/**
 * @return {string}
 * 
 * @public
 */
mide.core.Component.prototype.getId = function() {
	return this.id;
};


/**
 * @return {mide.ui.ConfigurationDialog}
 * 
 * @public
 */
mide.core.Component.prototype.getConfigurationDialog = function() {
	return this.configurationDialog;
};


/**
 * @return {mide.core.ComponentDescriptor}
 * 
 * @public
 */
mide.core.Component.prototype.getDescriptor = function() {
	return this.descriptor;
};


/**
 * @param {string} id
 * 
 * @public
 */
mide.core.Component.prototype.setComposition = function(composition) {
	this.composition = composition;
};

/**
 * @return {string}
 * 
 * @public
 */
mide.core.Component.prototype.getComposition = function() {
	return this.composition;
};


/**
 * @param {mide.processor.ProcessorManager} manager
 * 
 * @public
 */
mide.core.Component.prototype.setProcessorManager = function(manager) {
	this.processorManager = manager;
};


/**
 * Returns the list of data processors for this component
 * 
 * @return {Array}
 * @public
 */
mide.core.Component.prototype.getDataProcessors = function() {
	return this.processorManager.getDataProcessors();
};


/**
 * @param {Object}
 */
mide.core.Component.prototype.setData = function(data, value) {
	this.descriptor.setData(data, value);
};

/**
 * @param {Object} a map of mide.core.Parameter 
 */
mide.core.Component.prototype.getData = function(key) {
	return this.descriptor.getData(key);
};


/**
 * Gets the content node of the component.
 * 
 * @return {?Element}
 * 
 * @private
 */
mide.core.Component.prototype.getContentNode = function() {
	return null;
};

/**
 * Gets the content node of the component.
 * 
 * @return {?Element}
 * 
 * @private
 */
mide.core.Component.prototype.update = function() {
};


/**
 * Returns a option name - value mapping.
 * 
 * @return {Object.<string, {value: string, display: string}} the configuration 
 */
mide.core.Component.prototype.getConfiguration = function() {
	return this.configurationDialog.getConfiguration();
};

/**
 * Sets the configuration of the component. The values must be objects
 * in {@code {value: string, display: string}} form.
 * 
 * @param {Object.<string, {value: string, display: string}} config
 */
mide.core.Component.prototype.setConfiguration = function(config) {
	return this.configurationDialog.setConfiguration(config);
};


/**
 * Calls an operation of the component. If the component
 * has a method {@code op_operation}, this method is expected to
 * implement the logic for this operation.
 * 
 * Calls data converters in reverse order.
 * 
 * @param {string} operation the name of the operation
 * @param {Object.<string, ?>} params parameters
 * @public
 */
mide.core.Component.prototype.perform = function(operation, message) {
	var op = this.operationManager.getOperation(operation),
		self = this;
	if(op) {	
		// record operation in history
		this.operationManager.record(operation, message);
		
		if(this.operationManager.hasUnresolvedDependencies(operation)) {
			return;
		}
		else {
			this.publish(mide.core.Component.Events.OPSTART, this, operation);
			this.processorManager.perform(operation, message, function(opertion, message) {
				self.performInternal(operation, message.body);
			});
		}
	}
	else {
		throw new Error('[Operation call error] Component {' + this.name + '} does not support operation' + operation);
	}
};

/**
 * Calls an operation of the component. If the component
 * has a method {@code op_operation}, this method is expected to
 * implement the logic for this operation.
 * 
 * @param {string} operation the name of the operation
 * @param {Object.<string, ?>} params parameters
 * @private
 */
mide.core.Component.prototype.performInternal = function(operation, message_body) {
	var op = this.operationManager.getOperation(operation),
		func;
	
	var self = this;
	func = this['op_' + operation];

	// if the operation is synchronous or there is no implemented method,  
	// we can mark the operation is finished automatically
	if(!op.isAsync() || !func) {
		var old_func = func || function(){};
		func = function(message_body) {
			old_func.call(this, message_body);
			this.markOperationAsFinished(operation);
			this.triggerEvent(operation, message_body);
		};
	}

	// If there is a request which should be run automatically,
	// we run it before the actual operation

	var request = goog.object.findKey(this.requests, function(value) {
		return value.runsOn === operation;
	});

	if(request) {	
		this.makeRequest(request, null, null, null, goog.bind(func, this, message_body), message_body);
	}
	else {
		try {
			func.call(this, message_body);	
		}
		catch (e) {
			this.triggerError(operation, e);
		}
	}
		
};


/**
 * 
 * @private
 */
mide.core.Component.prototype.markOperationAsFinished = function(operation) {
	this.publish(mide.core.Component.Events.OPEND, this, operation);
	this.operationManager.resolve(operation);
};


/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @protected
 */
mide.core.Component.prototype.triggerEvent = function(event, message_body) {
	var self = this;
	if(goog.isString(message_body)) {
		message_body = JSON.parse(message_body);
	}
	var message = {
		header: {},
		body: message_body
	}
	this.processorManager.triggerEvent(event, message, function(event, message) {
		self.triggerEventInternal(event, message);
	});
};

/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @private
 */
mide.core.Component.prototype.triggerEventInternal = function(name, message) {
	this.publish(mide.core.Component.Events.EVENT, this, name, message);
};


/**
 * Raise error.
 * 
 * @param {string} event name
 * @param {Object} params
 * @private
 */
mide.core.Component.prototype.triggerError = function(name, msg) {
	this.publish(mide.core.Component.Events.ERROR, this, name, msg);
};


/**
 * Used internally to make a named Ajax request, as defined in the 
 * component description.
 * 
 * If {@code postData} is provided, a POST request is performed.
 * 
 * 
 * @param {string} name - the name of the request as defined in description
 * @param {string} url
 * @param {Object.<string, string>} getData - GET data mapping
 * @param {Object.<string, string>} postData - POST data mapping
 * @param {function(Object)} cb - function being called upon request complication.
 * 									The argument passed is the response text.
 * 
 * @private
 */

mide.core.Component.prototype.makeRequest = function(name, url, getData, postData, cb, message_body) {
	if(this.requests[name]) {
		
		// passed parameters are evaluated against the configuration parameters and the data received from
		// an operation
		var context = {};
		goog.object.extend(context, this.configurationDialog.getValues(), message_body || {});
		
		
		// prepare GET parameters
		if(this.requests[name].parameters) {
			var parameters = mide.util.OptionMap.get(this.requests[name].parameters, null, context);
			goog.object.extend(parameters, getData || {});
			getData = parameters
		}
		
		// prepare POST parameters
		if(this.requests[name].data) {
			if(!postData) {
				postData = this.requests[name].data;
			}
			else if(goog.isObject(this.requests[name].data) && goog.isObject(postData)) {
				var data = mide.util.OptionMap.get(this.requests[name].data, null, context);
				goog.object.extend(data, postData);
				postData = data;
			}
		}
		
		// set and parse URL if configured
		if(this.requests[name].url && !url) {
			url = mide.util.OptionMap.get({url: this.requests[name].url}, 'url', context);
		}
		
		// if the request should trigger an event at completion, override callback
		if(this.requests[name].triggers) {
			cb = function(data) {
				this.markOperationAsFinished(name);
				if(goog.isString(data)) {
					data = JSON.parse(data);
				}
				this.triggerEvent(this.requests[name].triggers, data);
			};
		}
	}
	

	if(url) {
		this.publish(mide.core.Component.Events.OPSTART, this, name);
		var config = {
				url: url,
				parameters: getData || {},
				data: postData,
				success: cb,
				error: function(msg, e) {
					this.triggerError(name, e.target.getStatusText());
				},
				context: this
		};

		this.processorManager.makeRequest(name, config, function(name, config) {
			mide.core.net.makeRequest(config);
		});
	}
};


/**
 * Connects two components. {@code operation} on {@code target} will
 * be invoked when {@code event} is raised.
 * 
 * @param {string} event
 * @param {mide.core.Component} target
 * @param {string} operation
 */
mide.core.Component.prototype.connect = function(src, event, target, operation) {
	this.publish(mide.core.Component.Events.CONNECT, 
			src, 
			event.replace(/^output_/, ''), 
			target,  
			operation.replace(/^input_/, ''), 
			src === this
	);
};


/**
 * Disconnects two components.
 * 
 * @param {string} event
 * @param {mide.core.Component} target
 * @param {string} operation
 */
mide.core.Component.prototype.disconnect = function(src, event, target, operation) {
	this.publish(mide.core.Component.Events.DISCONNECT, 
			src, 
			event.replace(/^output_/, ''), 
			target,  
			operation.replace(/^input_/, ''), 
			src === this
	);
};


/**
 * Get possible inputs (operations + configurations)
 * 
 * @public
 */
mide.core.Component.prototype.getInputs = function() {
	var operations = this.descriptor.getOperations(),
		inputs = {};
	for(var j = operations.length; j--; ) {
		inputs['input_' + operations[j].getRef()] = operations[j].getData('name');
	}
	return inputs;
};


/**
 * Get outputs (events)
 * 
 * @public
 */
mide.core.Component.prototype.getOutputs = function() {
	var operations = this.descriptor.getOperations(),
		outputs = {};
	for(var j = operations.length; j--; ) {
		if(operations[j].getOutputs().length > 0) {
			outputs['output_' + operations[j].getRef()] = operations[j].getData('name')
		}
	}
	
	var events = this.descriptor.getEvents();
	for(var j = events.length; j--; ) {
		outputs['output_' + events[j].getRef()] = events[j].getData('name')
	}
	return outputs;
};


/**
 * Should be overridden by implementation
 * 
 * @public
 */
mide.core.Component.prototype.autorun = function() {
	
};


/**
 * Prepares the component for a new run.
 * 
 * @public
 */
mide.core.Component.prototype.reset = function() {
	this.operationManager.reset();
};

/**
 * Should be called when the component is added to a
 * the composition.
 * 
 * @public
 */
mide.core.Component.prototype.add = function(composition) {
	this.composition = composition;
	this.publish(mide.core.Component.Events.ADDED, this, this.composition);
};



/**
 * Should be called when the component is removed from
 * the composition.
 * 
 * @public
 */
mide.core.Component.prototype.remove = function() {
	this.publish(mide.core.Component.Events.REMOVED, this, this.composition);
	
	goog.events.removeAll(this.configurationDialog, 'change');
	
	this.configurationDialog = null;
	
	if(this.element_ && this.element_.parentNode) {
		this.element_.parentNode.removeChild(this.element_);
	}
	this.element_ = null;
};


/**
 * List of events 
 * 
 * @type {Object}
 */
mide.core.Component.Events = {
		ERROR: 'error',
		OPSTART: 'opstart',
		OPEND: 'opend',
		CONFIG_CHANGED: 'config_changed',
		CONNECT: 'connect',
		DISCONNECT: 'disconnect',
		EVENT: 'event',
		ADDED: 'added',
		REMOVED: 'removed'
};