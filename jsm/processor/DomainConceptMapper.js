goog.provide('org.reseval.processor.DomainConceptMapper');

goog.require('jsm.processor.DataProcessor')

goog.require('jsm.core.net');
goog.require('jsm.core.Session');
goog.require('jsm.core.Composition');
goog.require('jsm.core.Component');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.array');

/**
 * 
 * @constructor
 */
org.reseval.processor.DomainConceptMapper = function(config) {
	goog.base(this, config);
	
	/**
	 * Holds the control data that has to be passed from operations
	 * to events.
	 * 
	 * @type Object
	 * @private
	 */
	this.map = {};
	
};

goog.inherits(org.reseval.processor.DomainConceptMapper, jsm.processor.DataProcessor);

/**
 * Sets the instance this processor belongs to. Attaches
 * event handlers to keep track of the component's state.
 * 
 * @param {jsm.core.Component} component
 * 
 * @public
 */
org.reseval.processor.DomainConceptMapper.prototype.setComponent = function(component) {
	goog.base(this, 'setComponent', component);
	
	component.subscribe(jsm.core.Component.Events.CONNECT, this.onConnect_, this);
	component.subscribe(jsm.core.Component.Events.DISCONNECT, this.onDisconnect_, this);
};

/**
 * 
 * @private
 */
org.reseval.processor.DomainConceptMapper.prototype.onConnect_ = function(source, event, target, operation, isSource) {
	// if this component is the source, then we have to map the data accordingly
	if(isSource) {
		var operation = goog.array.find(target.getDescriptor().getOperations(), function(element) {
			return element.getRef() === operation;
		});
		
		var event = goog.array.find(source.getDescriptor().getEvents(), function(element) {
			return element.getRef() === event;
		});
		
		if(operation && event) {
			var outputs = operation.getInputs(),
				inputs = event.getOutputs(),
				map = this.map[event] || (this.map[event] = {}),
				notFound = false;
			
			goog.array.forEach(outputs, function(output){
				var input = goog.array.find(inputs, function(input){
					return input.type === output.type;
				});
				if(input) {
					map[output.name] = input.name;
				}
				else {
					notFound = true;
				}
			}, this);
		}
		if(notFound) {
			alert("The components don't seem to be compatible. The composition will probably not work.")
		}
	}
};


/**
 * @private
 */
org.reseval.processor.DomainConceptMapper.prototype.onDisconnect_ = function(source, event, target, operation, isSource) {
	if(isSource) {
		delete this.map[event];
	}
};

/**
 * 
 * @inheritDoc
 *
 * @public
 */
org.reseval.processor.DomainConceptMapper.prototype.perform = function(operation, params, next) {
	next(params);
};

/**
 * @inheritDoc
 * 
 * Enriches the outgoing data with cacheKey and data if available.
 * 
 * @public
 */
org.reseval.processor.DomainConceptMapper.prototype.triggerEvent = function(event, params, next) {
	if(this.map[event]) {
		for(var ouput_name in this.map[event]) {
			var input_name = this.map[event][ouput_name];
			
			if(params[ouput_name]) {
				params[input_name] = params[ouput_name];
				delete params[input_name];
			}
		}
	}
	next(params);
};

/**
 * @inheritDoc
 * 
 * @public
 */
org.reseval.processor.DomainConceptMapper.prototype.makeRequest = function(name, requestConfig, next) {
	next(name, requestConfig);
};
