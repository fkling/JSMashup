goog.provide('org.reseval.processor.ServiceCall');

goog.require('mide.processor.DataProcessor')

goog.require('mide.core.net');
goog.require('mide.core.Session');
goog.require('mide.core.Composition');
goog.require('mide.core.Component');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.array');

/**
 * 
 * @constructor
 */
org.reseval.processor.ServiceCall = function(config) {
	goog.base(this, config);
	
	/**
	 * Holds the control data that has to be passed from operations
	 * to events.
	 * 
	 * @type Object
	 * @private
	 */
	this.data = {};
	
	
	/**
	 * 
	 * @private
	 */
	this.n = 0;
};

goog.inherits(org.reseval.processor.ServiceCall, mide.processor.DataProcessor);

/**
 * @public
 */
org.reseval.processor.ServiceCall.prototype.isConfiguredFor = function(action) {
	return !!(this.config[action] && this.config[action].url);
};



/**
 * Sets the instance this processor belongs to. Attaches
 * event handlers to keep track of the component's state.
 * 
 * @param {mide.core.Component} component
 * 
 * @public
 */
org.reseval.processor.ServiceCall.prototype.setComponent = function(component) {
	goog.base(this, 'setComponent', component);
	
	goog.events.listen(this.component.getComposition(), mide.core.Composition.Events.CHANGE, function() {
		this.n++;
	}, null, this);
	
	goog.events.listen(this.component, mide.core.Component.Events.CONNECT, this.onConnect_, null, this);
	
	goog.events.listen(this.component, mide.core.Component.Events.DISCONNECT, this.onDisconnect_, null, this);
};

/**
 * Called when a component is connected to another component. This method
 * determines whether the other component has a ServiceCall data processor
 * too and adjusts the configuration parameters for the call accordingly, i.e.
 * whether to fetch (send) data from (to) the service or not.
 * 
 * @private
 */
org.reseval.processor.ServiceCall.prototype.onConnect_ = function(e) {
	var trigger = this.getEventTrigger(e.event);
	if(e.isSource) {
		if(!goog.array.some(e.target.getProcessorManager().getProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(e.operation);
		}) && this.isConfiguredFor(trigger)) {
			var config = this.data[trigger] || ( this.data[trigger] = {});
			config.getData = true;
		}
	}
	else {
		if(!goog.array.some(e.source.getProcessorManager().getProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(processor.getEventTrigger(e.event));
		}) && this.isConfiguredFor(e.operation)) {
			this.data[e.operation].sendData = true;
		}
	}
};


/**
 * Called when a component is disconnected from another component. This method
 * determines whether the other component had a ServiceCall data processor
 * too and adjusts the configuration parameters for the call accordingly, i.e.
 * whether to fetch (send) data from (to) the service or not.
 * 
 * @private
 */
org.reseval.processor.ServiceCall.prototype.onDisconnect_ = function(e) {
	var trigger = this.getEventTrigger(e.event);
	if(e.isSource) {
		if(!goog.array.some(e.target.getProcessorManager().getProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(e.operation);
		}) && this.isConfiguredFor(trigger)) {
			var config = this.data[trigger] || ( this.data[trigger] = {});
			config.getData = false;
		}
	}
	else {
		if(!goog.array.some(e.source.getProcessorManager().getProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(processor.getEventTrigger(e.event));
		}) && this.isConfiguredFor(e.operation)) {
			this.data[e.operation].sendData = false;
		}
	}
};

/**
 * 
 * @inheritDoc
 * 
 * If the processor is configured accordingly, this method makes an Ajax call to a webservice. 
 * This webservice should perform the same operation as the component is doing.
 * 
 * If no cacheKey is set in the passed data, the method will generate a new key.
 * 
 * The configuration parameters are:
 * 
 * <ul>
 * <li> url: The url of the service
 * <li> passthrough: Whether the "real" operation of the component should be called
 * <li> useKeyFrom: Specifies another action from which to take the key form
 *</ul>
 *
 * @public
 */
org.reseval.processor.ServiceCall.prototype.perform = function(operation, params, next) {
	var config = this.config[operation];
	
	this.data[operation] = this.data[operation] || {};
	this.data[operation].cacheKey = params.controlData && params.controlData.cacheKey || this.getKey(config);
	
	if(config && config.url) {
		var parameters = {
			key: this.data[operation].cacheKey
		};
		
		if(this.data[operation].getData) {
			parameters.data = 'yes';
		}
		
		mide.core.net.makeRequest({
			url: config.url, 
			parameters: parameters,
			responseFormat: 'json',
			context: this,
			data: this.data[operation].sendData ? params.dataObject || params || {} : null,
			complete: function(response, e) {
				var r = e.target.getResponseJson();
				this.data[operation].cacheKey = r.cacheKey;
				this.data[operation].dataObject = r.dataObject;
				if(config.passthrough) {
					next(r.dataObject);
				}
			}
		});
	}
	else {
		next(params.dataObject);
	}
};

/**
 * @inheritDoc
 * 
 * Enriches the outgoing data with cacheKey and data if available.
 * 
 * @public
 */
org.reseval.processor.ServiceCall.prototype.triggerEvent = function(event, params, next) {
	var cacheKey = null, 
	    dataObject = params,
	    trigger = this.getEventTrigger(event)
	
	if(trigger && this.data[trigger]) {
		cacheKey = this.data[trigger].cacheKey;
		if(!this.data[trigger].getData) {
			params = {
					controlData: {cacheKey: cacheKey},
					dataObject: this.data[trigger].dataObject || params
			};
		}
	}
	next(params);
};

/**
 * @inheritDoc
 * 
 * @public
 */
org.reseval.processor.ServiceCall.prototype.makeRequest = function(name, requestConfig, next) {
	var config = this.config[name];
	
	if(config && config.url) {
		this.data[name] = this.data[name] || {};
		this.data[name].cacheKey = this.getKey(config);
		
		requestConfig.url = config.url;
		requestConfig.parameters.key = this.data[name].cacheKey;
		
		if(this.data[name].getData) {
			requestConfig.parameters.data = 'yes';
		}
		
		var orig_callback = requestConfig.complete,
			orig_context =  requestConfig.context;
		
		
		requestConfig.context = this;
		requestConfig.complete = function(response, e) {
			response = JSON.parse(response);
			if(response.cacheKey) {
				this.data[name].cacheKey = response.cacheKey;
			}
			this.data[name].dataObject = response.dataObject;
			orig_callback.call(orig_context, JSON.stringify(response.dataObject), e);
		};	
	}
	next(name, requestConfig);
};


/**
 * Generates or gets a cache key, based on the actions configuration.
 * 
 * @private
 */
org.reseval.processor.ServiceCall.prototype.getKey = function(config) {
	var key = mide.core.Session.getInstance().getId() + this.component.getId() + this.n;
	if(config && config.useKeyFrom) {
		key = this.data[config.useKeyFrom].cacheKey || key;
	}
	return key;
};