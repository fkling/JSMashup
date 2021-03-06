/*global jsm:true, goog:true*/

goog.provide('jsm.core.Composition');

goog.require('goog.pubsub.PubSub');
goog.require('jsm.dsl.SimpleConceptHandler');

/**
 * @param {Array} components
 * @param {Array} connections
 * 
 * @constructor
 */
jsm.core.Composition = function(components, connections) {
	goog.base(this);
	
	this.components = {};
	this.connections = {};
	this.connected_map = {};
	this.data = {};
	this.cid_ = 1;
	this.pubsub = new goog.pubsub.PubSub();
	
	this.Events = jsm.core.Composition.Events;

    this.conceptHandler = jsm.core.Composition.conceptHandler || new jsm.dsl.SimpleConceptHandler();
};

goog.inherits(jsm.core.Composition, goog.pubsub.PubSub);

jsm.core.Composition.Events = {
		CHANGED: 'change'
};

/**
 * @type Object
 */
jsm.core.Composition.prototype.data = null;

/**
 * @type string
 */
jsm.core.Composition.prototype.model = "";

/**
 * @type string
 */
jsm.core.Composition.prototype.id = null;

/**
 * @type Array
 */
jsm.core.Composition.prototype.connections = null;

/**
 * @type Array
 */
jsm.core.Composition.prototype.components = null;

/**
 * @param {string} id
 */
jsm.core.Composition.prototype.setId = function(id){
	this.id = id;
};

/**
 * return {string} id
 */
jsm.core.Composition.prototype.getId = function(){
	return this.id;
};


/**
 * @param {string} model
 */
jsm.core.Composition.prototype.setModel = function(model){
	this.model = model;
};

/**
 * return {string} model
 */
jsm.core.Composition.prototype.getModel = function(){
	return this.model;
};


/**
 * Add a component to this composition.
 *
 * Triggers the CHANGED event.
 *
 * @param {jsm.core.Component} component
 *
 * @public
 */
jsm.core.Composition.prototype.addComponent = function(component){
	var id = +component.getId() || ++this.cid_;
	if(id > this.cid_) {
		this.cid_ =  id;
	}
	component.setId(id.toString());
	component.add(this);
	
	this.components[id] = component;
	
	component.subscribe(component.Events.OPSTART, this.onOperationStart_, this);
	component.subscribe(component.Events.OPEND, this.onOperationEnd_, this);
	component.subscribe(component.Events.EVENT, this.onEventTrigger_, this);
	this.publish(jsm.core.Composition.Events.CHANGED, this);
};


/**
 * Remove a component from this compostion.
 *
 * Triggers the CHANGED event.
 *
 * @param {jsm.core.Component} component
 *
 * @public
 */
jsm.core.Composition.prototype.removeComponent = function(component){
	this.publish(jsm.core.Composition.CHANGED, this);
	var id = component.getId();
	
	// remove connections
	if(this.connections[id]) {
		delete this.connections[id];
	}
	
	for(var source in this.connections) {
		for(var event in this.connections[source]) {
			var conns = this.connections[source][event];
			for(var i = conns.length; i--; ) {
				if(conns[i].target === id) {
					conns.splice(i, 1);
				}
			}
		}
	}
	
	component.unsubscribe(component.Events.OPSTART, this.onOperationStart_, this);
	component.unsubscribe(component.Events.OPEND, this.onOperationEnd_, this);
	component.unsubscribe(component.Events.EVENT, this.onEventTrigger_, this);

	delete this.connected_map[id];
	delete this.components[id];
};


/**
 * Add a list of components.
 *
 * @param {Array} components
 *
 * @public
 */
jsm.core.Composition.prototype.setComponents = function(components){
	for(var i = 0, l = components.length; i < l; i++) {
		this.addComponent(components[i]);
	}
};

/**
 * Get a list of components present in this composition.
 *
 * @return  {Array} components
 *
 * @public
 */
jsm.core.Composition.prototype.getComponents = function(){
	var result = [];
	for(var id in this.components) {
		result.push(this.components[id]);
	}
	return result;
};


/**
 * Returns the component with the given ID.
 *
 * @param {number|string} id
 * @return {?jsm.core.Component}
 *
 * @public
 */
jsm.core.Composition.prototype.getComponent = function(id) {
    return this.components[id] || null;
};


/**
 * Returns the components with the given name.
 *
 * @param {string} name
 * @return {Array} of jsm.core.Component
 *
 * @public
 */
jsm.core.Composition.prototype.getComponentByName = function(name) {
    name = name.toLowerCase();
    var results = [];
    for(var id in this.components) {
        if(this.components[id].getData('name').toLowerCase() === name) {
            results.push(this.components[id]);
        }
    }
    return results;
};


/**
 * @param {Array} connections
 */
jsm.core.Composition.prototype.addConnection = function(connection){
	this.connect(connection.source, connection.event, connection.target, connection.operation);
};


/**
 * @param {Array} connections
 */
jsm.core.Composition.prototype.setConnections = function(connections){
	for(var i = connections.length; i--; ) {
		var connection = connections[i];
		this.addConnection(connection);
	}
};


/**
 * return {Array} connections
 */
jsm.core.Composition.prototype.getConnections = function(){
	var connections = [];
	for(var source in this.connections) {
		for(var event in this.connections[source]) {
			var c = this.connections[source][event];
			for(var i = c.length; i--; ) {
				var conn = c[i];
				connections.push({source: source, event: event, target: conn.target, operation: conn.op})
			}		
		}
	}
	return connections;
};



/**
 * Validates each component for missing required parameters or connections 
 * 
 * @param {Object} errors and output argument. Stores the possible errors.
 * @return {boolean} true if the composition is valid (can be run) else false
 * 
 * @public
 */
jsm.core.Composition.prototype.isValid = function(errors) {
	var errors = {},
		valid_ = true;

    for(var id in this.components) {
        var valid = this.components[id].validate();
        if(valid !== true) {
            errors[this.components[id].getData('name')] = valid;
            valid_ = false;
        }
    }
	
	return valid_ || errors;
};


/**
 * Runs the composition. This basically executes the `autorun` method of 
 * each component if available.
 * 
 * @public
 */
jsm.core.Composition.prototype.run = function(error) {
    var valid = this.isValid();
    if(valid !== true) {
        error(valid);
        return;
    }

	for(var id in this.components) {
		this.components[id].reset();
	}
	
	for(var id in this.components) {
		this.components[id].autorun();
	}
};


/**
 * Connect two components.
 *
 * @param {jsm.core.Component} source
 * @param {string} event
 * @param {jsm.core.Component}} target
 * @param {string} operation
 *
 * @public
 */
jsm.core.Composition.prototype.connect = function(source, event, target, operation){
    var sourceId = source.getId(),
        targetId = target.getId();
    
    var src_connections = this.connections[sourceId] || (this.connections[sourceId] = {}),
        event_connections = src_connections[event] || (src_connections[event] = []);

    // don't connect twice
    if(goog.array.some(event_connections, function(c) {return c.target === targetId && c.op === operation;})) {
        return;
    }

    // Test whether the components are compatible
    var valid = this.conceptHandler.isCompatible(source.getDescriptor().getEvent(event), target.getDescriptor().getOperation(operation));

    if(valid || confirm("The components don't seem to be compatible. Do you want to connect them anyways?")) {
        event_connections.push({target: targetId, op: operation});
        var connected = this.connected_map[targetId] || (this.connected_map[targetId] = {});
        connected[operation] = true;

        source.connect(source, event, target, operation);
        target.connect(source, event, target, operation);
    }
};

/**
 * @param {string} source
 * @param {string} event
 * @param {string} target
 * @param {string} operation
*/
jsm.core.Composition.prototype.disconnect = function(source, event, target, operation, isSource){
    var sourceId = source.getId(),
    targetId = target.getId();

    if(this.connections[sourceId] && this.connections[sourceId][event]) {
        var event_connections = this.connections[sourceId][event];
        for(var i = event_connections.length; i--; ) {
            var connection = event_connections[i];
            if(connection.target === targetId && connection.op === operation) {
                this.connected_map[targetId][operation] = false;
                event_connections.splice(i, 1);
            }
        }
    }

    if(jsm.core.Composition.argumentMapper) {
        jsm.core.Composition.argumentMapper.removeMapping(source, event, target, operation);
    }
    source.disconnect(source, event, target, operation);
    target.disconnect(source, event, target, operation);
};


/**
 * @param {Object}
*/
jsm.core.Composition.prototype.setData = function(data, value, overwrite) {
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
jsm.core.Composition.prototype.getData = function(key) {
    if(goog.isString(key)) {
        return this.data[key];
    }
    return this.data;
};

/**
 * Handles component's operation start events
 * 
 * @private
*/
jsm.core.Composition.prototype.onOperationStart_ = function(component, operation) {
    this.pubsub.publish('operation_start', component, operation);
};

/**
 * Handles component's operation end events
 * 
 * @private
*/
jsm.core.Composition.prototype.onOperationEnd_ = function(component, operation) {
    this.pubsub.publish('operation_end', component, operation);
};

/**
 * Handles component's events
 * 
 * @private
*/
jsm.core.Composition.prototype.onEventTrigger_ = function(source, event, message) {
    var srcId = goog.isString(source) ? source : source.getId(),
    self = this;

    if(this.connections[srcId] && this.connections[srcId][event] && this.connections[srcId][event].length > 0) {
        goog.array.forEach(this.connections[srcId][event], function(connection) {
            setTimeout(function() {
                //create a copy of the parameters
                var message_copy = JSON.parse(JSON.stringify(message));

                //map input data
                message_copy.body = self.conceptHandler.convert(
                    source.getDescriptor().getEvent(event), 
                    self.components[connection.target].getDescriptor().getOperation(connection.op),
                    message_copy.body);

                self.components[connection.target].perform(connection.op, message_copy);
            }, 0);
        });
    }
};


/**
 * Sets the object used to map incoming arguments in operations
 * to the ones specified in the model. If no strategy is set,
 * the arguments are just passed through.
 * 
 * @param {jsm.component.ArgumentMapper} mapper 
*/
jsm.core.Composition.setArgumentMapper = function(mapper) {
    jsm.core.Composition.argumentMapper = mapper;
};
