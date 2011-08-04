goog.provide('mashupIDE.core.Component');
goog.provide('mashupIDE.core.Component.Events');
goog.require('mashupIDE.PubSub');
goog.require('mashupIDE.OperationHistory');
goog.require('mashupIDE.ui.ConfigurationDialog');

goog.require('goog.ui.Component');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.ui.IdGenerator');


mashupIDE.core.Component = function(componentDescriptor, opt_id, opt_config, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	
	this.id = opt_id || goog.ui.IdGenerator.getInstance().getNextUniqueId();
	this.descriptor = componentDescriptor;


	this.events = componentDescriptor.getEvents();
	this.operations = componentDescriptor.getOperations();
	this.outputBuffer = {};
	this.inputBuffer = {};
	this.dataProcessors = [];
	this.finishedOperations = {};
	this.connectionStatus = {};
	
	this.history = new mashupIDE.OperationHistory(this);

	
	this.configuration_dialog = new mashupIDE.ui.ConfigurationDialog(componentDescriptor.getParameters());
	
	goog.events.listen(this.configuration_dialog, 'change', function() {
		this.dispatchEvent({type: mashupIDE.core.Component.Events.CONFIG_CHANGED});
	}, false, this);
	
	if(opt_config) {
		this.setConfiguration(opt_config);
	}
};

goog.inherits(mashupIDE.core.Component, goog.ui.Component);


/**
 * @type {Object}
 * @public
 */
mashupIDE.core.Component.prototype.id = null;


/**
 * @type {mashupIDE.ui.ConfigurationDialog}
 * @private
 */
mashupIDE.core.Component.prototype.configurationDialog = '';

/**
 * @type {Object.<string, {finished: boolean, requiredInputs: Array.<string>, depends: Array.<string>}>}
 * @private
 */
mashupIDE.core.Component.prototype.operations = null;

/**
 * @type {Object.<string, {depends: Array.<string>}>}
 * @private
 */
mashupIDE.core.Component.prototype.events = null;


/**
 * Output buffer
 * 
 * @type {Object.<string, Object>}
 * @private
 */
mashupIDE.core.Component.prototype.outputBuffer = null;

/**
 * Input buffer
 * 
 * @type {Object.<string, Object>}
 * @private
 */
mashupIDE.core.Component.prototype.inputBuffer = null;

/**
 * Data converters
 * 
 * @type {Object.<string, Object>}
 * @private
 */
mashupIDE.core.Component.prototype.dataProcessors = null;

/**
 * Stores connection status of operations and events
 * 
 * @type {Object.<string, boolean>}
 * @private
 */
mashupIDE.core.Component.prototype.connectionStatus = null;


/**
 * Stores connection status of operations and events
 * 
 * @type {Object.<string, boolean>}
 * @private
 */
mashupIDE.core.Component.prototype.finishedOperations = null;


/**
 * Keeps track of the executed operations.
 * 
 * @type {mashupIDE.OperationHistory}
 * @private
 */
mashupIDE.core.Component.prototype.history = null;





mashupIDE.core.Component.prototype.setId = function(id) {
	if(id) {
		this.id = id;	
	}
};

mashupIDE.core.Component.prototype.getId = function() {
	return this.id;
};


/**
 * 
 * @returns {mashupIDE.ui.ConfigurationDialog}
 */
mashupIDE.core.Component.prototype.getConfigurationDialog = function() {
	return this.configurationDialog;
};


/**
 * 
 * @returns {mashupIDE.core.ComponentDescriptor}
 */
mashupIDE.core.Component.prototype.getDescriptor = function() {
	return this.descriptor;
};


/**
 * Tests whether the component can run or that.
 * This is determined by
 * 1. The component has an autorun method.
 * 2. The component has input data to work with.
 * 
 * @return {boolean}
 */
mashupIDE.core.Component.prototype.isRunnable = function() {
	return this.descriptor.autorun || this.history.getSize() > 0;
};


/**
 * Runs a component. This will either execute the 
 * autorun method or 
 * 
 */
mashupIDE.core.Component.prototype.run = function() {
	return this.descriptor.autorun || this.history.getSize() > 0;
};



/**
 * Raise event.
 * 
 * @param {string} event name
 * @param {Object} params
 * @protected
 */
mashupIDE.core.Component.prototype.triggerEvent = function(event, params) {
	var self = this;
	if(this.id) {
		if(event in this.operations) {
			// operation was performed
			this.end(event);
		}
		var converters = [],
			dataProcessors = this.dataProcessors.slice();
		dataProcessors.reverse();
		
		for(var i = dataProcessors.length; i--;) {
			if(dataProcessors[i].triggerEvent) converters.push(dataProcessors[i]);
		}
		
		var next = function(data) {
			if(converters[0]) {
				converters.shift().triggerEvent(event, data, next);
			}
			else {
				self.triggerEventInternal(event, data);
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
mashupIDE.core.Component.prototype.triggerEventInternal = function(event, params) {
	this.outputBuffer[event] = params;
	mashupIDE.PubSub.triggerEvent(this, event, params);
};


/**
 * Returns a option name - value mapping.
 * 
 * @return {Object.<string, {value: string, display: string}} the configuration 
 */
mashupIDE.core.Component.prototype.getConfiguration = function() {
	return this.configuration_dialog.getConfiguration();
};

/**
 * Sets the configuration of the component. The values must be objects
 * in {@code {value: string, display: string}} form.
 * 
 * @param {Object.<string, {value: string, display: string}} config
 */
mashupIDE.core.Component.prototype.setConfiguration = function(config) {
	return this.configuration_dialog.setConfiguration(config);
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
mashupIDE.core.Component.prototype.perform = function(operation, params) {
	var op = this.operations[operation],
		self = this;
	if(op) {
		// cache parameters for later invocation
		this.inputBuffer[operation] = params;
		// record operation in history
		this.history.push(operation, params);
		
		if(this.hasUnfulfilledDependencies(operation)) {
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
			this.start(operation);
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
mashupIDE.core.Component.prototype.performInternal = function(operation, params) {
	var op = this.operations[operation],
		func;
	
	if(this.validateInput(operation, params)) {
		var self = this;
		func = this['op_' + operation] || function(){
			if (operation+"Output" in self.events) {
				self.triggerEvent(operation+"Output", {});
			}
		};
		if(!op.async) {
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
 * Checks if all required input parameters are passed.
 * 
 * @param {string} operation the name of the operation
 * @param {Object.<string, ?>} params parameters
 * @private
 */
mashupIDE.core.Component.prototype.validateInput = function(operation, params) {
	var op = this.operations[operation],
		i;
	if(op) {
		i = op.requiredInputs.length;
		if(i === 0) {
			return true;
		}
		while(i--) {
			if(!params.hasOwnProperty(op.requiredInputsp[i])) {
				return false;
			}
		}
		return true;
	}
	return false;
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

mashupIDE.core.Component.prototype.makeRequest = function(name, url, getData, postData, cb) {
	this.start(name);
	var self = this;
	
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
			mashupIDE.net.makeRequest(url, getData, postData, function(response) {
				while(convertersResponse[0]) {
					response = convertersResponse.shift().makeResponse(name, response);
				}
				cb(response);
			});
		}
	};
	next(name, url, getData, postData);
};

/**
 * Mark the start of an operation/request/event.
 * 
 * @param {string} operation
 * 
 * @private
 */
mashupIDE.core.Component.prototype.start = function(operation) {
    this.dispatchEvent({type: mashupIDE.core.Component.Events.OPSTART, operation: operation});
    goog.dom.classes.add(this.element_, 'active');
};

/**
 * Mark the end of an operation/request/event.
 * 
 * @param {string} operation
 * 
 * @private
 */
mashupIDE.core.Component.prototype.end = function(operation) {
	this.dispatchEvent({type: mashupIDE.core.Component.Events.OPEND, operation: operation});
	goog.dom.classes.remove(this.element_, 'active');
	goog.dom.classes.add(this.element_, 'done');
};


/**
 * Checks whether all operations this operation depends on are run.
 * 
 * @param {string} operation the name of the operation
 * @private
 */
mashupIDE.core.Component.prototype.hasUnfulfilledDependencies = function(operation) {
	var deps = this.operations[operation].depends,
		l = deps.length;
	if(l === 0) {
		return false;
	}
	
	while(l--) {
		if(!this.finishedOperations[deps[l]]) {
			return true;
		}
	}
	return false;
};


/**
 * To properly manage dependencies, we need to know when an operation
 * is completed. This is needed for operations that run asynchronous code.
 * 
 * @param {string} operation the name of the operation
 * @private
 */
mashupIDE.core.Component.prototype.markOperationAsFinished = function(operation) {
	this.finishedOperations[operation] = true;
	this.end(operation);
	
	// see whether there are any operations that depend on this one
	// and run them
	for(var op in this.operations) {
		if(goog.array.indexOf(this.operations[op].depends, operation) && op in this.inputBuffer) {
			this.perform(op, this.inputBuffer[op]);
		}
	}
};


/**
 * Connects two components. {@code operation} on {@code target} will
 * be invoked when {@code event} is raised.
 * 
 * @param {string} event
 * @param {mashupIDE.core.Component} target
 * @param {string} operation
 */
mashupIDE.core.Component.prototype.connect = function(src, event, target, operation) {
	if(src === this) {
		this.connectionStatus[event] = true;
		mashupIDE.PubSub.connect(this, event, target, operation);
		if(this.outputBuffer[event]) {
			mashupIDE.PubSub.triggerEvent(this, event, this.outputBuffer[event]);
		}
	}
	else {
		this.connectionStatus[operation] = true;
	}
};

/**
 * Disconnects two components.
 * 
 * @param {string} event
 * @param {mashupIDE.core.Component} target
 * @param {string} operation
 */
mashupIDE.core.Component.prototype.disconnect = function(src, event, target, operation) {
	if(src === this) {
		this.connectionStatus[event] = false;
		mashupIDE.PubSub.disconnect(this, event, target, operation);
	}
	else {
		this.connectionStatus[operation] = false;
		delete this.finishedOperations[operation];
		delete this.inputBuffer[operation];
		this.history.purge(operation);
	}
};



/**
 * Gets the content node of the component.
 * 
 * @return {?Element}
 * 
 * @private
 */
mashupIDE.core.Component.prototype.getContentNode = function() {
	var div = this.dom_.createElement('div'),
		content = this.getContentNodeInternal();
	if(content) {
		div.appendChild(content);
	}
	
	for(var i = 0, l = this.dataProcessors.length; i < l;i++) {
		if(this.dataProcessors[i].getContentNode) {
			div.appendChild(this.dataProcessors[i].getContentNode());
		}
	}
	return div;
};

/**
 * A function that has to be overwritten by subclasses.
 * Returns the GUI DOM node for this component.
 * 
 * @return {?Element}
 * 
 * @protected
 */
mashupIDE.core.Component.prototype.getContentNodeInternal = function() {
	
};


mashupIDE.core.Component.prototype.addDataProcessor = function(converter) {
	converter.setComponentInstance(this);
	this.dataProcessors.push(converter);
};


/**
 * @override
 */
mashupIDE.core.Component.prototype.createDom = function() {
	this.element_ =  this.dom_.createDom('div', {'class': 'mashup-component'});
	this.content_ = content = this.dom_.createDom('div', {'class': 'mashup-component-content'});

	this.dom_.append(this.element_,content);
};

/**
 * @override
 */
mashupIDE.core.Component.prototype.decorateInternal = function(element) {
	if(!this.element_) {
		this.createDom();		
	}
	this.dom_.removeChildren(element);
	goog.dom.insertChildAt(this.content_, this.getContentNode(), 0);
	this.dom_.append(element, this.element_);
};

/**
 * List of events 
 * 
 * @type {Object}
 */
mashupIDE.core.Component.Events = {
		OPSTART: 'opstart',
		OPEND: 'opend',
		CONFIG_CHANGED: 'config_changed'
};

