goog.provide('mide.core.Component');
goog.provide('mide.core.Component.Events');

goog.require('mide.PubSub');
goog.require('mide.core.OperationManager');
goog.require('mide.ui.ConfigurationDialog');

goog.require('goog.events.EventTarget');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.ui.IdGenerator');


mide.core.Component = function(componentDescriptor, composition, opt_id, opt_config, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	
	this.id = opt_id;
	this.descriptor = componentDescriptor;
	this.composition = composition;

	this.outputBuffer = {};
	this.inputBuffer = {};
	this.dataProcessors = [];
	
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
 * @type {Object.<string, {finished: boolean, requiredInputs: Array.<string>, depends: Array.<string>}>}
 * @private
 */
mide.core.Component.prototype.operations = null;

/**
 * @type {Object.<string, {depends: Array.<string>}>}
 * @private
 */
mide.core.Component.prototype.events = null;


/**
 * Output buffer
 * 
 * @type {Object.<string, Object>}
 * @private
 */
mide.core.Component.prototype.outputBuffer = null;

/**
 * Input buffer
 * 
 * @type {Object.<string, Object>}
 * @private
 */
mide.core.Component.prototype.inputBuffer = null;

/**
 * Data converters
 * 
 * @type {Object.<string, Object>}
 * @private
 */
mide.core.Component.prototype.dataProcessors = null;


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
 * Prepares the component for a new run.
 * 
 * @public
 */
mide.core.Component.prototype.reset = function() {
	this.operationManager.reset();
};


/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @protected
 */
mide.core.Component.prototype.triggerEvent = function(name, params) {
	var self = this;
	if(this.id) {
		if(this.operationManager.hasOperation(name)) {
			// operation was performed
			this.dispatchEvent({type: mide.core.Component.Events.OPEND, component: this, operation: name});
		}
		var converters = [],
			dataProcessors = this.dataProcessors.slice();
		dataProcessors.reverse();
		
		for(var i = dataProcessors.length; i--;) {
			if(dataProcessors[i].triggerEvent) converters.push(dataProcessors[i]);
		}
		
		var next = function(data) {
			if(converters[0]) {
				converters.shift().triggerEvent(name, data, next);
			}
			else {
				self.triggerEventInternal(name, data);
			}
		};
		next(params);
	}
};

/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @private
 */
mide.core.Component.prototype.triggerEventInternal = function(name, params) {
	this.outputBuffer[name] = params;
	var self = this;
	setTimeout(function(){
		self.dispatchEvent({type: mide.core.Component.Events.EVENT, source: self, event: name, parameters: params});
	}, 0);
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
mide.core.Component.prototype.perform = function(operation, params) {
	var op = this.operationManager.getOperation(operation),
		self = this;
	if(op) {	
		// cache parameters for later invocation
		this.inputBuffer[operation] = params;
		// record operation in history
		this.operationManager.record(operation, params);
		
		if(this.operationManager.hasUnresolvedDependencies(operation)) {
			return;
		}
		else {
			var converters = [];
			for(var i = this.dataProcessors.length; i--;) {
				if(this.dataProcessors[i].perform) converters.push(this.dataProcessors[i]);
			}
			
			var next = function(data) {
				if(converters[0]) {
					converters.shift().perform(operation, data, next);
				}
				else {
					self.performInternal(operation, data);
				}
			};
			this.dispatchEvent({type: mide.core.Component.Events.OPSTART, component: this, operation: operation});
			next(params);
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
mide.core.Component.prototype.performInternal = function(operation, params) {
	var op = this.operationManager.getOperation(operation),
		func;
	
	if(op.isInputValid(params)) {
		var self = this;
		func = this['op_' + operation] || function(){
			if (op.getOutputs().length > 0) {
				self.triggerEvent(operation, params);
			}
		};
		if(!op.isAsync()) {
			var old_func = func;
			// we can mark the operation as finished automatically
			func = function(params) {
				old_func.call(this, params);
				this.markOperationAsFinished(operation);
			};
		}
		func.call(this, params);	
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
	delete this.inputBuffer[operation];
	this.dispatchEvent({type: mide.core.Component.Events.OPEND, component: this, operation: operation});
	this.operationManager.resolve(operation);
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

mide.core.Component.prototype.makeRequest = function(name, url, getData, postData, cb) {
	this.dispatchEvent({type: mide.core.Component.Events.OPSTART, component: this, operation: name});
	var self = this;
	//TODO Update to new net interface
	var convertersRequest = [],
		dataProcessors = this.dataProcessors.slice();
	dataProcessors.reverse();
	for(var i = dataProcessors.length; i--;) {
		if(dataProcessors[i].makeRequest) convertersRequest.push(dataProcessors[i]);
	}
	var convertersResponse = convertersRequest.slice();
	convertersResponse.reverse();

	var next = function(name, url, getData, postData) {
		if(convertersRequest[0]) {
			convertersRequest.shift().makeRequest(name, url, getData, postData, next);
		}
		else {
			mide.core.net.makeRequest({
				url: url, 
				parameters: getData, 
				data: postData, 
				complete: function(response) {
					while(convertersResponse[0]) {
						response = convertersResponse.shift().makeResponse(name, response);
					}
					cb(response);
				}
			});
		}
	};
	next(name, url, getData, postData);
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
	if(src === this) {
		this.dispatchEvent({
			type: mide.core.Component.Events.CONNECT, 
			source: this.getId(), 
			event: event.replace(/^output_/, ''), 
			target: target, 
			operation: operation.replace(/^input_/, '')
		});
	}
};


/**
 * Disconnects two components.
 * 
 * @param {string} event
 * @param {mide.core.Component} target
 * @param {string} operation
 */
mide.core.Component.prototype.disconnect = function(src, event, target, operation) {
	if(src === this) {
		this.dispatchEvent({
			type: mide.core.Component.Events.DISCONNECT, 
			source: this.getId(), 
			event: event.replace(/^output_/, ''), 
			target: target, 
			operation: operation.replace(/^input_/, '')
		});
	}
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
 * 
 * @public
 */
mide.core.Component.prototype.hasContent = function() {
	var node = this.getContentNode();
	return node.children.length > 0;
};


mide.core.Component.prototype.getContentNodeInternal = function() {
	
};


mide.core.Component.prototype.addDataProcessor = function(processor) {
	processor.setComponentInstance(this);
	this.dataProcessors.push(processor);
};

mide.core.Component.prototype.setDataProcessors = function(processors) {
	for(var i = 0, l = processors.length; i < l; i++) {
		this.addDataProcessor(processors[i]);
	}
};

mide.core.Component.prototype.getDataProcessors = function() {
	return this.dataProcessors;
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
 * Should be called when the component is removed from
 * the composition.
 * 
 * @public
 */
mide.core.Component.prototype.remove = function() {
	this.dispatchEvent({type: mide.core.Component.Events.REMOVE, component: this});
	
	this.dataProcessors = [];
	
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