goog.provide('org.reseval.processor.ServiceCall');

goog.require('jsm.processor.DataProcessor')

goog.require('jsm.core.net');
goog.require('jsm.core.Session');
goog.require('jsm.core.Composition');
goog.require('jsm.core.Component');
goog.require('jsm.util.OptionMap');


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

goog.inherits(org.reseval.processor.ServiceCall, jsm.processor.DataProcessor);


/**
 * Key used to set and get the relevant data in the head of the message.
 * 
 * @private
 */
org.reseval.processor.ServiceCall.HEADER_NAME = 'org.reseval.processor.ServiceCall';


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
 * @param {jsm.core.Component} component
 * 
 * @public
 */
org.reseval.processor.ServiceCall.prototype.setComponent = function(component) {
	goog.base(this, 'setComponent', component);
	
	component.subscribe(jsm.core.Component.Events.ADDED, this.onAdd_, this);
	component.subscribe(jsm.core.Component.Events.REMOVED, this.onRemove_, this);
	component.subscribe(jsm.core.Component.Events.CONNECT, this.onConnect_, this);
	component.subscribe(jsm.core.Component.Events.DISCONNECT, this.onDisconnect_, this);
};

org.reseval.processor.ServiceCall.prototype.onAdd_ = function(component, composition) {
	composition.subscribe(composition.Events.CHANGED, this.onChange_, this);
};

org.reseval.processor.ServiceCall.prototype.onRemove_ = function(component, composition) {
	composition.unsubscribe(composition.Events.CHANGED, this.onChange_, this);
};

org.reseval.processor.ServiceCall.prototype.onChange_ = function(composition) {
	this.n++;
};

/**
 * Called when a component is connected to another component. This method
 * determines whether the other component has a ServiceCall data processor
 * too and adjusts the configuration parameters for the call accordingly, i.e.
 * whether to fetch (send) data from (to) the service or not.
 * 
 * @private
 */
org.reseval.processor.ServiceCall.prototype.onConnect_ = function(source, event, target, operation, isSource) {
	var trigger = this.getEventTrigger(event);
	
	// if this component is the source, then we have to fetch data from service
	if(isSource) {
		// if the other component has no ServiceCall data processor and this component
		// makes a service call for the action that triggers the event
		if(!goog.array.some(target.getDataProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(operation);
		}) && this.isConfiguredFor(trigger)) {
			var config = this.data[trigger] || ( this.data[trigger] = {});
			config.getData = true;
		}
	}
	else { // otherwise we have to send data to the service
		if(!goog.array.some(source.getDataProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(processor.getEventTrigger(event));
		}) && this.isConfiguredFor(operation)) {
			var config = this.data[operation] || ( this.data[operation] = {});
			config.sendData = true;
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
org.reseval.processor.ServiceCall.prototype.onDisconnect_ = function(source, event, target, operation, isSource) {
	var trigger = this.getEventTrigger(event);
	if(isSource) {
		if(!goog.array.some(target.getDataProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(operation);
		}) && this.isConfiguredFor(trigger)) {
			var config = this.data[trigger] || ( this.data[trigger] = {});
			config.getData = false;
		}
	}
	else {
		if(!goog.array.some(source.getDataProcessors(), function(processor) {
			return processor instanceof org.reseval.processor.ServiceCall && processor.isConfiguredFor(processor.getEventTrigger(event));
		}) && this.isConfiguredFor(operation)) {
			var config = this.data[operation] || ( this.data[operation] = {});
			config.sendData = false;
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
org.reseval.processor.ServiceCall.prototype.perform = function(operation, message, next) {
    var config = this.config[operation],
        header = message.header[org.reseval.processor.ServiceCall.HEADER_NAME] || {},
        data = this.data[operation] = this.data[operation] || {},
        key = data.cacheKey = this.getKey(config, data, header) || "",
        context = {
            config: goog.object.map(this.component.getConfiguration(), function(item) {
                return item.value;
            }),
            input: message.body
        };


    // if there is a service call configured for this operation    
    if(config && config.url) {

        var requestConfig = {
            url: config.url, 
            responseFormat: 'json',
            context: this,
            success: function(response, e) {
                // store cache key for event
                this.data[operation].cacheKey = response.cacheKey;

                // get the response
                var dataObject = response.dataObject || {};
                delete dataObject.key;

                this.data[operation].message_body = dataObject;

                if(config.passthrough) {
                    next(message);
                }
                else {
                    this.component.markOperationAsFinished(operation);
                    this.component.triggerEvent(operation, dataObject);
                }
            },
            error: function(txt, e) {
                this.component.triggerError(operation, txt);
            }
        };

        // if POST method is set or we have to data we get from the event to the 
        // service
        if(config.method === 'POST' || data.sendData) {
            var post_data = {
                key: key,
                dataRequest: data.getData ? 'yes' : 'no',
            };

            // if these parameters are set, we have to add those to the post data
            if(config.sendData && config.sendData.POST) {

                // prepare data map so that values are evaluated against the input and
                // the configuration
                var data_map = new jsm.util.OptionMap(config.sendData.POST,context);

                for(var prop in config.sendData.POST) {
                    post_data[prop] = data_map.get(prop);
                }
            }

            // this is data we always have to send:
            if(config.data && config.data.POST) {
                // prepare data map so that values are evaluated against the input and
                // the configuration
                var data_map = new jsm.util.OptionMap(config.data.POST,context);

                for(var prop in config.sendData.POST) {
                    post_data[prop] = data_map.get(prop);
                }
            }

            requestConfig.parameters = {};
            requestConfig.data = JSON.stringify(post_data);
            requestConfig.contentType = 'application/json';
            requestConfig.method = "POST";
        }
        else {

            requestConfig.parameters = {};
            if(key) {
                requestConfig.parameters.key = key;
            }
            if(data.getData) {
                requestConfig.parameters.data = 'yes';
            }
        }

        jsm.core.net.makeRequest(requestConfig);
    }
    else {
        next(message);
    }
};

/**
 * @inheritDoc
 * 
 * Enriches the outgoing data with cacheKey and data if available.
 * 
 * @public
*/
org.reseval.processor.ServiceCall.prototype.triggerEvent = function(event, message, next) {
    var data = {},
    message_header = message.header[org.reseval.processor.ServiceCall.HEADER_NAME] || (message.header[org.reseval.processor.ServiceCall.HEADER_NAME] = {})	,
    trigger = this.getEventTrigger(event)

    if(trigger && this.data[trigger]) {
        data = this.data[trigger];
        message_header.cacheKey = data.cacheKey;
        if(data.message_body && this.config[trigger].overwrite) {
            message.body = data.message_body;
        }
    }
    next(message);
};

/**
 * @inheritDoc
 * 
 * @public
*/
org.reseval.processor.ServiceCall.prototype.makeRequest = function(name, requestConfig, next) {
    // get the configuration for this call
    var config = this.config[name];

    // if configured
    if(config && config.url) {

        var data = this.data[name] = this.data[name] || {};

        // get the cache key for this request
        var key = this.data[name].cacheKey = this.getKey(config, data);

        // overwrite URL
        requestConfig.url = config.url;

        // if this a POST request, we have to prepare a special request object
        if(config.method === 'POST') {
            var post_data = {
                key: key,
                dataRequest: data.getData ? 'yes' : 'no'
            };

            // if the configuration defines data to be sent, we use this instead
            if(config.data) {
                // variables ({...}) are substituted from the event request parameters and configuration parameters
                var context = {
                    request: requestConfig.parameters,
                    config: goog.object.map(this.component.getConfiguration(), function(item) {
                        return item.value;
                    })
                };

                var data_map = new jsm.util.OptionMap(config.data, context);

                for(var prop in config.data) {
                    post_data[prop] = data_map.get(prop);
                }
            }
            else {
                // copy request parameters
                if(config.includeGet) {
                    for(var p in (requestConfig.parameters || {})) {
                        if(requestConfig.parameters[p] !== '') {
                            post_data[p] = requestConfig.parameters[p];
                        }
                    }
                }

                // copy post data if it is an object:
                if(config.includePost) {
                    if(goog.isObject(requestConfig.data)) {
                        for(var p in requestConfig.data) {
                            post_data[p] = requestConfig.data[p];
                        }
                    }
                }
            }

            requestConfig.parameters = {};
            requestConfig.data = JSON.stringify(post_data);
            requestConfig.contentType = 'application/json';
        }
        else {
            requestConfig.parameters.key = key;

            if(data.getData) {
                requestConfig.parameters.data = 'yes';
            }
        }


        var orig_success = requestConfig.success,
        orig_error = requestConfig.error,
        orig_complete = requestConfig.complete,
        orig_context =  requestConfig.context;


        requestConfig.context = this;
        requestConfig.complete = function() {
            if(orig_complete) orig_complete.apply(orig_context, arguments);
        };
        requestConfig.success = function(response, e) {
            response = JSON.parse(response);
            if(response.cacheKey) {
                this.data[name].cacheKey = response.cacheKey;
            }
            this.data[name].message_body = response.dataObject || {};
            delete this.data[name].message_body.key;
            if(orig_success) orig_success.call(orig_context, JSON.parse(JSON.stringify(this.data[name].message_body)), e);
        };
        requestConfig.error = function() {
            if(orig_error) orig_error.apply(orig_context, arguments);
        };
    }
    next(name, requestConfig);
};


/**
 * Generates or gets a cache key, based on the actions configuration.
 * 
 * @private
*/
org.reseval.processor.ServiceCall.prototype.getKey = function(config, data, header) {
    var key = jsm.core.Session.getInstance().getId() + this.component.getId() + this.n;

    if(data && data.cacheKey) {
        key = data.cacheKey;
    }

    if(header && header.cacheKey) {
        key = header.cacheKey;
    }
    if(config && config.useKeyFrom) {
        key = this.data[config.useKeyFrom].cacheKey || key;
    }
    return config.useKeyFrom === false ? '' : key;
};
