goog.provide('jsm.core.Component');
goog.provide('jsm.core.Component.Events');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.functions');
goog.require('goog.pubsub.PubSub');
goog.require('jsm.core.OperationManager');
goog.require('jsm.ui.ConfigurationDialog');
goog.require('jsm.util.DataStore');
goog.require('jsm.util.OptionMap');



/**
 * This class contains all the runtime logic for components.
 *
 *
 */
jsm.core.Component = function(componentDescriptor, opt_id, opt_config) {
    goog.base(this);

    this.id = opt_id;
    this.descriptor = componentDescriptor;
    this.fn = {};
    this.requests = {};
    this.events_ = {};

    goog.array.forEach(this.descriptor.getRequests(), function(request) {
        this.requests[request.ref] = request;
    }, this);

    goog.array.forEach(this.descriptor.getEvents(), function(event) {
        this.events_[event.getRef()] = event;
    }, this);

    this.operationManager = new jsm.core.OperationManager(this, this.descriptor.getOperations());

    if (opt_config) {
        this.configuration_ = opt_config;
    }

};
goog.inherits(jsm.core.Component, goog.pubsub.PubSub);

jsm.core.Component = jsm.util.DataStore.attach(jsm.core.Component);


/**
 * @type {Object}
 */
jsm.core.Component.prototype.id = null;


/**
 * @type {jsm.ui.ConfigurationDialog}
 * @private
 */
jsm.core.Component.prototype.configurationDialog = null;

/**
 * @type {jsm.core.OperationManager}
 * @private
 */
jsm.core.Component.prototype.operationManager = null;


/**
 * Data process manager
 *
 * @type {jsm.processor.ProcessorManager}
 * @private
 */
jsm.core.Component.prototype.processorManager = null;


/**
 * Composition this component belongs to
 *
 * @private
 */
jsm.core.Component.prototype.composition = null;


/**
 * Holds the functions which implements the different operations
 *
 * @private
 */
jsm.core.Component.prototype.methods_ = null;


/**
 * @param {string} id
 *
 */
jsm.core.Component.prototype.setId = function(id) {
	if (id) {
		this.id = id;
	}
};

/**
 * @return {string}
 *
 */
jsm.core.Component.prototype.getId = function() {
	return this.id;
};


/**
 * @return {jsm.ui.ConfigurationDialog}
 *
 */
jsm.core.Component.prototype.getConfigurationDialog = function() {
    this.prepareConfigurationDialog_();
	return this.configurationDialog;
};


/**
 * @return {jsm.core.ComponentDescriptor}
 *
 */
jsm.core.Component.prototype.getDescriptor = function() {
	return this.descriptor;
};


/**
 * @param {string} id
 *
 */
jsm.core.Component.prototype.setComposition = function(composition) {
	this.composition = composition;
};

/**
 * @return {string}
 *
 */
jsm.core.Component.prototype.getComposition = function() {
	return this.composition;
};


/**
 * @param {jsm.processor.ProcessorManager} manager
 *
 */
jsm.core.Component.prototype.setProcessorManager = function(manager) {
	this.processorManager = manager;
};


/**
 * Returns the list of data processors for this component
 *
 * @return {Array}
 */
jsm.core.Component.prototype.getDataProcessors = function() {
	return this.processorManager.getDataProcessors();
};

/**
 * Returns a list of incoming connections, meaning where this component
 * is the target.
 *
 * @return {Array}
 */
jsm.core.Component.prototype.getIncomingConnections = function() {
    var result = [],
        id = this.getId();

    if (this.composition) {
        result = goog.array.filter(this.composition.getConnections(), function(connection) {
            return id == connection.target;
        });
    }

    return result;
};


/**
 * Returns a list of outgoing connections, meaning where this component
 * is the source.
 *
 * @return {Array}
 */
jsm.core.Component.prototype.getOutgoingConnections = function() {
    var result = [],
        id = this.getId();

    if (this.composition) {
        result = goog.array.filter(this.composition.getConnections(), function(connection) {
            return id == connection.source;
        });
    }

    return result;
};


/**
 * Gets the content node of the component.
 *
 * @return {?Element}
 *
 */
jsm.core.Component.prototype.getContentNode = function() {
    var name = 'getContentNode';
    if(goog.isFunction(this.fn[name])) {
        return this.fn[name]();
    }
	return null;
};


/**
 * Returns the element holding the configuration interface
 *
 * @return {?Element}
 *
 */
jsm.core.Component.prototype.getConfigurationElement = function() {
    this.prepareConfigurationDialog_();
    return this.getConfigurationDialog().getContentElement();
};

/**
 * @private
 */
jsm.core.Component.prototype.prepareConfigurationDialog_ = function() {
    if (!this.configurationDialog) {
        this.configurationDialog = new jsm.ui.ConfigurationDialog(this.descriptor.getParameters(), this.getConfigurationTemplate());
        this.configurationDialog.createDom();
        if (this.configuration_) {
            this.setConfiguration(this.configuration_);
        }
        goog.events.listen(this.configurationDialog, 'change', function(event) {
            if(goog.isFunction(this.fn.onParameterChange)) {
                this.fn.onParameterChange(event.target);
            }
            this.publish(jsm.core.Component.Events.CONFIG_CHANGED, this);
        }, false, this);
    }
};



/**
 * Returns the template for the configuration interface.
 *
 * Can be overwritten by the implementation
 *
 * @return {string}
 *
 * @private
 */
jsm.core.Component.prototype.getConfigurationTemplate = function() {
    var name = 'getConfigurationTemplate';
    if(goog.isFunction(this.fn[name])) {
        return this.fn[name]();
    }
    return this.descriptor.getData('configTemplate') || null;
};


/**
 * Update the display of a component - can be overridden by implementation
 *
 *
 */
jsm.core.Component.prototype.update = function() {
    var name = 'update';
    if (goog.isFunction(this.fn[name])) {
        this.fn[name]();
    }
};

/**
 * Validates the component regarding its configuration options.
 *
 * @return {boolean} True if the configuration of the component is valid
 */
jsm.core.Component.prototype.validate = function() {
    var name = 'validate';
    if (goog.isFunction(this.fn[name])) {
        return this.fn[name](this.getConfiguration());
    }
    return true;
};

jsm.core.Component.prototype.open =  function() {
    this.publish(this.Events.OPEN);
};

jsm.core.Component.prototype.close = function() {
    this.publish(this.Events.CLOSE);
};



/**
 * Returns a parameter name - value mapping.
 *
 * @return {Object.<string, {value: string, display: string}} the configuration
 */
jsm.core.Component.prototype.getConfiguration = function() {
    this.prepareConfigurationDialog_();
    
    var configuration = this.configurationDialog.getConfiguration();

    if(goog.isFunction(this.fn.getConfiguration)) {
        goog.object.extend(configuration, this.fn.getConfiguration(configuration));
    }
    return configuration;
};

/**
 * Sets the configuration of the component. The values must be objects
 * in {@code {value: string, display: string}} form.
 *
 * @param {Object.<string, {value: string, display: string}} config
 */
jsm.core.Component.prototype.setConfiguration = function(config) {
    this.prepareConfigurationDialog_();

    if(goog.isFunction(this.fn.setConfiguration)) {
        config = this.fn.setConfiguration(config);
    }

	return this.configurationDialog.setConfiguration(config);
};


/**
 * Calls an operation of the component. If the component
 * has a method {@code this.fn[operation]}, this method is expected to
 * implement the logic for this operation.
 *
 * Calls data converters in reverse order.
 *
 * @param {string} operation The name of the operation.
 * @param {{head: Object,body: Object} message Input sent to operation
 */
jsm.core.Component.prototype.perform = function(operation, message) {
    var op = this.operationManager.getOperation(operation),
    self = this;
    if (op) {
        // record operation in history
        this.operationManager.record(operation, message);

        if (this.operationManager.hasUnresolvedDependencies(operation)) {
            return;
        }
        else {
            this.publish(jsm.core.Component.Events.OPSTART, this, operation);
            this.processorManager.perform(operation, message, function(operation, message) {
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
 * has a method {@code this.fn[operation]}, this method is expected to
 * implement the logic for this operation.
 *
 * @param {string} operation the name of the operation.
 * @param {Object} message_body the parameters passed from the event.
 * @private
 */
jsm.core.Component.prototype.performInternal = function(operation, message_body) {
    var op = this.operationManager.getOperation(operation),
        self = this,
        trigger = op.getTrigger(),
        func;

    // This is the function to call for this operation. If no function is registered,
    // we create a dummy function
    func = this.fn[operation] || function() { return arguments[1] || {}; };

    // This is a stripped down version of the component itself and these
    // methods are available in operation via `this`. This is done to automate
    // task as much as possible.

    var this_obj = {
        'getConfiguration': goog.bind(this.getConfiguration, self),

        // can be called from inside the operation to mark the operation as finished.
        'finish': this.createFinishFunction_(operation, trigger),

        // Inside an operation, a named request can be executed. In that case
        // we again provide some methods to make implementation easier.
        'makeRequest': goog.bind(function(name, config) {
            if (name in this.requests) { //named request, trigger event if finished
                var event = this.requests[name].triggers,
                    orig_callback = config.callback;

                // chaining succint request finish calls and operation finish call
                this_obj['finish'] = goog.functions.sequence(
                    this.createFinishFunction_(name, event),
                    this_obj.finish
                );

                // Wrap the callback. Instead of calling `finishRequest`, returning
                // a value finishes the request and operation automatically
                config.callback = function(response) {
                    if(goog.isFunction(orig_callback)) {
                        response = orig_callback.call(this_obj, response);
                    }

                    if (goog.isDef(response)) {
                        this_obj.finish(response);
                    }
                };
            }

            // Make the request. If it was not named, the callback
            // remains unchanged.
            this.makeRequest(name, config);
        }, this),
        'open': function() {
            this.publish(this.Events.OPEN);
        },
        'close': function() {
            this.publish(this.Events.CLOSE);
        }
    };

    // A wrapper which handles the cases if either the operation is called
    // immediatly or a request was triggered beforehand.
    function call_operation() {

        // Call the actual implementation passing the generated `this` object.
        var result = func.apply(this_obj, arguments);

        // If it returns a result we automatically mark the function as finished
        if (goog.isDef(result)) {
            this_obj.finish(result);
        }
    }

    // check whether the operation triggers an event or request
    if (trigger && trigger in this.requests) {
        // if operation triggers request, the request is performed first
        // and the result is passed to the defined callback as second argument
        this_obj['finish'] = this.createFinishFunction_(trigger, this.requests[trigger].triggers);
        this.makeRequest(trigger, {callback: goog.bind(call_operation, this, message_body)}, message_body);
    }
    else {
        call_operation(message_body);
    }
};


/**
 *
 * @private
 */
jsm.core.Component.prototype.markOperationAsFinished = function(operation) {
    this.publish(jsm.core.Component.Events.OPEND, this, operation);
    this.operationManager.resolve(operation);
};


/** 
 * Returns a function, which marks an action as finished and triggers an event by name, 
 * passing the result if provided.
 *
 * @param {string} name Operation name
 * @param {string} eventName Event name
 *
 * @return {function}
 */
jsm.core.Component.prototype.createFinishFunction_ = function(name, eventName) {
    return goog.bind(function finish(result) {
        if(!finish.called) {
            finish.called = true;
            this.markOperationAsFinished(name);

            if(eventName) {
                this.triggerEvent(eventName, this.prepareEventData_(eventName, result));
            }
        }
    }, this);
};


/**
 * Finishes an operation and triggers the assacociated event if available.
 * This a convenial wrapper.
 *
 * @param {string} operation Operation name
 * @param {Object} data Data to send as result
 */
jsm.core.Component.prototype.finishOperation = function(operation, data) {
    var op = this.operationManager.getOperation(operation);
    this.createFinishFunction_(operation, op.getTrigger)(data);
};


/**
 * Finishes an request and triggers the assacociated event if available.
 * This a convenial wrapper.
 *
 * @param {string} request_name Request name
 * @param {Object} opt_data Data to send as result
 */
jsm.core.Component.prototype.finishRequest = function(request_name, opt_data) {
    var request = this.requests[request_name];
    this.createFinishFunction_(request_name, request.triggers)(opt_data);
};


/** 
 * Used prepare the result of an operation or requestas event output.
 * If the result is an object, it might already be the complete body, 
 * i.e. each key corresponds to an output paramter of the event. If not,
 * the result is assigned to each output paramter of the event.
 * 
 * @param {string} eventName Event name
 * @param {*} data Result of the operation
 *
 * @return {Object} the body of the resulting message
 * 
 */ 
jsm.core.Component.prototype.prepareEventData_ = function(eventName, data) {
    var event = this.events_[eventName];
    var body = {},
    outputs = event.getOutputs();

    // check whether result is already the output or not
    if (!goog.isObject(data) || goog.array.some(outputs, function(o) { return !(o.name in data); })) {
        for (var i = outputs.length; i--; ) {
            body[outputs[i].name] = data;
        }
    }
    else {
        body = data;
    }
    return body;
};


/**
 * Raise event.
 *
 * @param {string} event name Event name
 * @param {Object} message_body Data to send to the next component
 * @protected
*/
jsm.core.Component.prototype.triggerEvent = function(event, message_body) {
    var self = this;
    if (goog.isString(message_body)) {
        message_body = JSON.parse(message_body);
    }
    var message = {
        header: {},
        body: message_body || {}
    };
    this.processorManager.triggerEvent(event, message, function(event, message) {
        self.triggerEventInternal(event, message);
    });
};

/**
 * Raise event.
 *
 * @param {string} event name.
 * @param {Object} params
 * @private
*/
jsm.core.Component.prototype.triggerEventInternal = function(name, message) {
    this.publish(jsm.core.Component.Events.EVENT, this, name, message);
};


/**
 * Raise error.
 *
 * @param {string} event name.
 * @param {Object} params
 * @private
*/
jsm.core.Component.prototype.triggerError = function(name, msg) {
    this.publish(jsm.core.Component.Events.ERROR, this, name, msg);
};


/**
 * Used internally to make a named Ajax request, as defined in the
 * component description.
 *
 * If {@code postData} is provided, a POST request is performed.
 *
 *
 * @param {string} name - the name of the request as defined in description.
 * @param {Object} opt_config Configuration for the Ajax request. Paramters are
 *      - url: The URL to send the request to
 *      - GET: The GET data to send
 *      - POST: The POST data to send
 *      - callack: Function to call when response was received
 * @param {Object} message_body Used internally to forward operation input
 *
*/
jsm.core.Component.prototype.makeRequest = function(name, opt_config, message_body) {
    opt_config = opt_config || {};
    var request = this.requests[name];
    var self = this;
    if (request) {

        // passed parameters are evaluated against the configuration parameters and the data received from
        // an operation
        var context = {};
        goog.object.extend(context, goog.object.map(this.getConfiguration(), function(item) {
            return item.value;
        }), message_body || {});


        // prepare GET parameters
        if (request.parameters) {
            var parameters = jsm.util.OptionMap.get(request.parameters, null, context);
            goog.object.extend(parameters, goog.object.get(opt_config, 'GET', {}));
            opt_config.GET = parameters;
        }

        // prepare POST parameters
        if (request.data) {
            if (goog.isObject(request.data) && goog.isObject(opt_config.POST)) {
                var data = jsm.util.OptionMap.get(request.data, null, context);
                goog.object.extend(data, goog.object.get(opt_config, 'POST', {}));
                opt_config.POST = data;
            }
            else if (!opt_config.POST) {
                opt_config.POST = request.data;
            }
        }

        // set and parse URL if configured
        if (request.url && !opt_config.url) {
            opt_config.url = jsm.util.OptionMap.get({url: request.url}, 'url', context);
        }

        opt_config.callback = goog.isFunction(opt_config.callback) ? opt_config.callback : this.createFinishFunction_(name, request.triggers);
    }


    if (opt_config.url) {
        if(name) {
            this.publish(jsm.core.Component.Events.OPSTART, this, name);
        }

        var config = {
            url: opt_config.url,
            parameters: opt_config.GET || {},
            data: opt_config.POST,
            success: opt_config.callback,
            error: function(msg, e) {
                this.triggerError(name, e.target.getStatusText());
            },
            context: this
        };

        this.processorManager.makeRequest(name, config, function(name, config) {
            jsm.core.net.makeRequest(config);
        });
    }
};


/**
 * Connects two components. {@code operation} on {@code target} will
 * be invoked when {@code event} is raised.
 *
 * @param {string} event
 * @param {jsm.core.Component} target
 * @param {string} operation
*/
jsm.core.Component.prototype.connect = function(src, event, target, operation) {
    this.publish(jsm.core.Component.Events.CONNECT,
                 src,
                 event,
                 target,
                 operation,
                 src === this
                );
};


/**
 * Disconnects two components.
 *
 * @param {string} event
 * @param {jsm.core.Component} target
 * @param {string} operation
*/
jsm.core.Component.prototype.disconnect = function(src, event, target, operation) {
    this.publish(jsm.core.Component.Events.DISCONNECT,
                 src,
                 event,
                 target,
                 operation,
                 src === this
                );
};

//TODO: Refactor UI so that these two methods can be removed
/**
 * Get possible inputs (operations + configurations)
 *
*/
jsm.core.Component.prototype.getInputs = function() {
    var operations = this.descriptor.getOperations(),
    inputs = {};
    for (var j = operations.length; j--; ) {
        inputs[operations[j].getRef()] = {name: operations[j].getData('name'), type: operations[j].getInputs()[0].type};
    }
    return inputs;
};


/**
 * Get outputs (events)
 *
*/
jsm.core.Component.prototype.getOutputs = function() {
    var outputs = {},
        events = this.descriptor.getEvents();

    for (var j = events.length; j--; ) {
        outputs[events[j].getRef()] = {name: events[j].getData('name'), type: events[j].getOutputs()[0].type};
    }
    return outputs;
};


/**
 * Should be overridden by implementation
 *
*/
jsm.core.Component.prototype.autorun = function() {
    var name = 'autorun',
        this_obj = {
        'getConfiguration': goog.bind(this.getConfiguration, this),

        // Inside an operation, a named request can be executed. In that case
        // we again provide some methods to make implementation easier.
        'makeRequest': goog.bind(function(name, config) {
            config = config || {};
            if (name in this.requests) { //named request, trigger event if finished
                var event = this.requests[name].triggers,
                    orig_callback = config.callback;

                // chaining succint request finish calls and operation finish call
                this_obj['finish'] = this.createFinishFunction_(name, event);

                // Wrap the callback. Instead of calling `finishRequest`, returning
                // a value finishes the request and operation automatically
                config.callback = function(response) {
                    if(goog.isFunction(orig_callback)) {
                        response = orig_callback.call(this_obj, response);
                    }

                    if (goog.isDef(response)) {
                        this_obj.finish(response);
                    }
                };
            }

            // Make the request. If it was not named, the callback
            // remains unchanged.
            this.makeRequest(name,config);
        }, this)
    };


    if(goog.isFunction(this.fn[name])) {
        this.fn[name].call(this_obj);
    }
};


/**
 * Prepares the component for a new run.
 *
*/
jsm.core.Component.prototype.reset = function() {
    this.operationManager.reset();
};

/**
 * Should be called when the component is added to a
 * the composition.
 *
 * @param {jsm.core.Composition} composition The composition this component is added to.
*/
jsm.core.Component.prototype.add = function(composition) {
    this.composition = composition;
    this.publish(jsm.core.Component.Events.ADDED, this, this.composition);
};



/**
 * Should be called when the component is removed from
 * the composition.
 *
*/
jsm.core.Component.prototype.remove = function() {
    this.publish(jsm.core.Component.Events.REMOVED, this, this.composition);
};


/**
 * List of events
 *
 * @type {Object}
*/
jsm.core.Component.Events = jsm.core.Component.prototype.Events = {
    ERROR: 'error',
    OPSTART: 'opstart',
    OPEND: 'opend',
    CONFIG_CHANGED: 'config_changed',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    EVENT: 'event',
    ADDED: 'added',
    REMOVED: 'removed',
    OPEN: 'open',
    CLOSE: 'close'
};
