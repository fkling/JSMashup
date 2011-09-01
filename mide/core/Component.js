goog.provide('mide.core.Component');
goog.provide('mide.core.Component.Events');

goog.require('mide.PubSub');
goog.require('mide.core.OperationManager');
goog.require('mide.util.OptionMap');
goog.require('mide.ui.ConfigurationDialog');

goog.require('goog.events.EventTarget');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.ui.IdGenerator');


mide.core.Component = function(componentDescriptor, composition, opt_id, opt_config, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	
	this.id = opt_id;
	this.descriptor = componentDescriptor;
	this.composition = composition;

	this.requests = {};
	
	goog.array.forEach(this.descriptor.getRequests(), function(request) {
		this.requests[request.ref] = request;
	}, this);
	
	this.operationManager = new mide.core.OperationManager(this, this.descriptor.getOperations());

	
	this.configurationDialog = new mide.ui.ConfigurationDialog(componentDescriptor.getParameters());
	this.configurationDialog.createDom();
	
	goog.events.listen(this.configurationDialog, 'change', function() {
		this.dispatchEvent({type: mide.core.Component.Events.CONFIG_CHANGED});
	}, false, this);
	
	if(opt_config) {
		this.setConfiguration(opt_config);
	}
};

goog.inherits(mide.core.Component, goog.events.EventTarget);


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


mide.core.Component.prototype.setProcessorManager = function(manager) {
	this.processorManager = manager;
};

mide.core.Component.prototype.getProcessorManager = function() {
	return this.processorManager;
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
	if(!this.element_) {
		var div = this.element_ = document.createElement('div'),
		content = this.getContentNodeInternal();
		if(content) {
			div.appendChild(content);
		}
	}
	return this.element_;
};

/**
 * Has to be overridden by the implementation
 * 
 * @protected
 */
mide.core.Component.prototype.getContentNodeInternal = function() {
	
};


/**
 * 
 * @public
 */
mide.core.Component.prototype.hasContent = function() {
	var node = this.getContentNode();
	return node.children.length > 0;
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
mide.core.Component.prototype.perform = function(operation, data) {
	var op = this.operationManager.getOperation(operation),
		self = this;
	if(op) {	
		// record operation in history
		this.operationManager.record(operation, data);
		
		if(this.operationManager.hasUnresolvedDependencies(operation)) {
			return;
		}
		else {
			this.dispatchEvent({type: mide.core.Component.Events.OPSTART, component: this, operation: operation});
			this.processorManager.perform(operation, data, function(opertion, data) {
				self.performInternal(operation, data);
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
mide.core.Component.prototype.performInternal = function(operation, data) {
	var op = this.operationManager.getOperation(operation),
		func;
	
	if(op.isInputValid(data)) {
		var self = this;
		func = this['op_' + operation];
		
		// if the operation is synchronous or there is no implemented method,  
		// we can mark the operation is finished automatically
		if(!op.isAsync() || !func) {
			var old_func = func || function(){};
			func = function(data) {
				old_func.call(this, data);
				this.markOperationAsFinished(operation);
				this.triggerEvent(operation, data);
			};
		}
		
		// If there is a request which should be run automatically,
		// we run it before the actual operation
		
		var request = goog.object.findKey(this.requests, function(value) {
			return value.runsOn === operation;
		});
		
		if(request) {	
			this.makeRequest(request, null, null, null, goog.bind(func, this, data), data);
		}
		else {
			func.call(this, data);	
		}
		
	}
	else {
		throw new Error('[Operation call error] Operation {' + operation + '}: Missing parameter(s)');
	}
};


/**
 * 
 * @private
 */
mide.core.Component.prototype.markOperationAsFinished = function(operation) {
	this.dispatchEvent({type: mide.core.Component.Events.OPEND, component: this, operation: operation});
	this.operationManager.resolve(operation);
};


/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @protected
 */
mide.core.Component.prototype.triggerEvent = function(event, data) {
	var self = this;
	if(goog.isString(data)) {
		data = JSON.parse(data);
	}
	
	this.processorManager.triggerEvent(event, data, function(event, data) {
		self.triggerEventInternal(event, data);
	});
};

/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @private
 */
mide.core.Component.prototype.triggerEventInternal = function(name, params) {
	this.dispatchEvent({type: mide.core.Component.Events.EVENT, source: this, event: name, parameters: params});
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
 * @param {function(Object)} cb - function beeing called upon request complication.
 * 									The argument passed is the parsed JSON response.
 * 
 * @private
 */

mide.core.Component.prototype.makeRequest = function(name, url, getData, postData, cb, op_data) {
	if(this.requests[name]) {
		var context = {};
		goog.object.extend(context, this.configurationDialog.getValues(), op_data || {});
		if(this.requests[name].parameters) {
			var parameters = mide.util.OptionMap.get(this.requests[name].parameters, null, context);
			goog.object.extend(parameters, getData || {});
			getData = parameters
		}
		
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
		
		if(this.requests[name].url && !url) {
			url = mide.util.OptionMap.get({url: this.requests[name].url}, 'url', context);
		}
		
		if(this.requests[name].triggers) {
			cb = function(data) {
				this.markOperationAsFinished(name);
				this.triggerEvent(this.requests[name].triggers, data);
			};
		}
	}
	
	if(url) {
		this.dispatchEvent({type: mide.core.Component.Events.OPSTART, component: this, operation: name});
		var config = {
				url: url,
				parameters: getData || {},
				data: postData,
				complete: cb,
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
	this.dispatchEvent({
		type: mide.core.Component.Events.CONNECT, 
		source: src,
		event: event.replace(/^output_/, ''), 
		target: target, 
		operation: operation.replace(/^input_/, ''),
		isSource: src === this
	});
};


/**
 * Disconnects two components.
 * 
 * @param {string} event
 * @param {mide.core.Component} target
 * @param {string} operation
 */
mide.core.Component.prototype.disconnect = function(src, event, target, operation) {
	this.dispatchEvent({
		type: mide.core.Component.Events.DISCONNECT, 
		source: src, 
		event: event.replace(/^output_/, ''), 
		target: target, 
		operation: operation.replace(/^input_/, ''),
		isSource:  src === this
	});
};


/**
 * Get possible inputs (operations + configurations)
 * 
 * @public
 */
mide.core.Component.prototype.getInputs = function() {
	var operations = this.operationManager.getOperations(),
		inputs = [];
	for(var name in operations) {
		if(!operations[name].isInternal()) {
			inputs.push('input_' + name);
		}	
	}
	return inputs;
};


/**
 * Get outputs (events)
 * 
 * @public
 */
mide.core.Component.prototype.getOutputs = function() {
	var operations = this.operationManager.getOperations(),
		outputs = [];
	for(var name in operations) {
		if(operations[name].getOutputs().length > 0) {
			outputs.push('output_' + name);
		}
	}
	
	var events = this.descriptor.getEvents();
	for(var j = events.length; j--; ) {
		outputs.push('output_' + events[j].ref);
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
 * Should be called when the component is removed from
 * the composition.
 * 
 * @public
 */
mide.core.Component.prototype.remove = function() {
	this.dispatchEvent({type: mide.core.Component.Events.REMOVE, component: this});
	
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
		OPSTART: 'opstart',
		OPEND: 'opend',
		CONFIG_CHANGED: 'config_changed',
		CONNECT: 'connect',
		DISCONNECT: 'disconnect',
		EVENT: 'event',
		REMOVE: 'remove'
};