goog.provide('mide.core.Composition');

goog.require('goog.pubsub.PubSub');
goog.require('goog.events.EventTarget');

/**
 * @param {Array} components
 * @param {Array} connections
 * 
 * @constructor
 */
mide.core.Composition = function(components, connections) {
	this.components = {};
	this.connections = {};
	this.connected_map = {};
	this.data = {};
	this.cid_ = 1;
	this.pubsub = new goog.pubsub.PubSub();
};

goog.inherits(mide.core.Composition, goog.events.EventTarget);

mide.core.Composition.Events = {
		CHANGE: 'change'
};

/**
 * @type Object
 */
mide.core.Composition.prototype.data = null;

/**
 * @type string
 */
mide.core.Composition.prototype.model = "";

/**
 * @type string
 */
mide.core.Composition.prototype.id = null;

/**
 * @type Array
 */
mide.core.Composition.prototype.connections = null;

/**
 * @type Array
 */
mide.core.Composition.prototype.components = null;

/**
 * @param {string} id
 */
mide.core.Composition.prototype.setId = function(id){
	this.id = id;
};

/**
 * return {string} id
 */
mide.core.Composition.prototype.getId = function(){
	return this.id;
};


/**
 * @param {string} model
 */
mide.core.Composition.prototype.setModel = function(model){
	this.model = model;
};

/**
 * return {string} model
 */
mide.core.Composition.prototype.getModel = function(){
	return this.model;
};

/**
 * @param {mide.core.Component} component
 */
mide.core.Composition.prototype.addComponent = function(component){
	var id = component.getId() || ++this.cid_;
	if(id > this.cid_) {
		this.cid_ =  id;
	}
	component.setId(id.toString());
	
	this.components[id] = component;
	
	goog.events.listen(component, mide.core.Component.Events.CONNECT, this.onConnect_, null, this);
	goog.events.listen(component, mide.core.Component.Events.DISCONNECT, this.onDisconnect_, null, this);
	goog.events.listen(component, mide.core.Component.Events.OPSTART, this.onOperationStart_, null, this);
	goog.events.listen(component, mide.core.Component.Events.OPEND, this.onOperationEnd_, null, this);
	goog.events.listen(component, mide.core.Component.Events.EVENT, this.onEventTrigger_, null, this);
	goog.events.listen(component, mide.core.Component.Events.REMOVE, this.onComponentRemove_, null, this);
	this.dispatchEvent({type: mide.core.Composition.CHANGE});
};

mide.core.Composition.prototype.removeComponent = function(component){
	this.dispatchEvent({type: mide.core.Composition.CHANGE});
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
	
	delete this.connected_map[id];
	delete this.components[id];
};

/**
 * @param {Array} components
 */
mide.core.Composition.prototype.setComponents = function(components){
	for(var i = 0, l = components.length; i < l; i++) {
		this.addComponent(components[i]);
	}
};

/**
 * return  {Array} components
 */
mide.core.Composition.prototype.getComponents = function(){
	return this.components;
};


/**
 * @param {Array} connections
 */
mide.core.Composition.prototype.addConnection = function(connection){
	this.connect(connection.source, connection.event, connection.target, connection.operation);
};


/**
 * @param {Array} connections
 */
mide.core.Composition.prototype.setConnections = function(connections){
	for(var i = connections.length; i--; ) {
		var connection = connections[i];
		this.connect(connection.source, connection.event, connection.target, connection.operation);
	}
};


/**
 * return {Array} connections
 */
mide.core.Composition.prototype.getConnections = function(){
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
mide.core.Composition.prototype.isValid = function(errors) {
	var errors = {},
		valid = true;
	
	for(var id in this.components) {
		var missing_fields = this.components[id].getConfigurationDialog().getInvalidFields(),
			missing_connections = [],
			operations = this.components[id].getDescriptor().getOperations();
		
		for(var i = operations.length; i--; ) {
			var operation = operations[i],
				ref = operation.getRef();
			if(this.connected_map[id] && this.connected_map[id][ref]) {
				var missing = [],
					deps = operation.getDependencies();
				
				for(var j = deps.length; j--;) {
					if(!this.connected_map[id][deps[j]]) {
						missing.push(deps[j]);
					}
				}
				
				if (missing.length > 0) {
					missing_connections.push({operation: operations[ref], missing: missing});
					valid = false;
				}
			}
		}
		errors.missing_fields = missing_fields;
		errors.missing_connections = missing_connections;
		
		if(missing_fields.length > 0) {
			valid = false;
		}
	}
	return valid;
};


/**
 * Runs the composition. This basically executes the `autorun` method of 
 * each component if available.
 * 
 * @public
 */
mide.core.Composition.prototype.run = function() {
	for(var id in this.components) {
		this.components[id].reset();
	}
	
	for(var id in this.components) {
		this.components[id].autorun();
	}
};


/**
 * @param {string} source
 * @param {string} event
 * @param {string} target
 * @param {string} operation
 */
mide.core.Composition.prototype.connect = function(source, event, target, operation){
	if(!goog.isString(source)) {
		source = source.getId();
	}
	if(!goog.isString(target)) {
		target = target.getId();
	}
	
	var src_connections = this.connections[source] || (this.connections[source] = {}),
	    event_connections = src_connections[event] || (src_connections[event] = []);

	// don't connect twice
    if(goog.array.some(event_connections, function(c) {return c.target === target && c.op === operation;})) {
        return;
    }
    event_connections.push({target: target, op: operation});
    var connected = this.connected_map[target] || (this.connected_map[target] = {});
    connected[operation] = true;
};

/**
 * @param {string} source
 * @param {string} event
 * @param {string} target
 * @param {string} operation
 */
mide.core.Composition.prototype.disconnect = function(source, event, target, operation){
	if(!goog.isString(source)) {
		source = source.getId();
	}
	if(!goog.isString(target)) {
		target = target.getId();
	}
	
    if(this.connections[source] && this.connections[source][event]) {
        var event_connections = this.	connections[source][event];
        for(var i = event_connections.length; i--; ) {
            var connection = event_connections[i];
            if(connection.target === target && connection.op === operation) {
            	this.connected_map[target][operation] = false;
                event_connections.splice(i, 1);
                break; // there can only be one
            }
        }
    }
};


/**
 * @param {Object}
 */
mide.core.Composition.prototype.setData = function(data, value) {
	if(arguments.length == 2) {
		var d = this.data || (this.data = {});
		d[data] = value;
	}
	else {
		this.data = data;
	}
};

/**
 * @param {Object} a map of mide.core.Parameter 
 */
mide.core.Composition.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
};

/**
 * Handles component's connect events
 * 
 * @private
 */
mide.core.Composition.prototype.onConnect_ = function(e) {
	if(e.isSource) {
		this.connect(e.source, e.event, e.target, e.operation);
	}
};

/**
 * Handles component's disconnect events
 * 
 * @private
 */
mide.core.Composition.prototype.onDisconnect_ = function(e) {
	if(e.isSource) {
		this.disconnect(e.source, e.event, e.target, e.operation);
	}
};

/**
 * Handles component's operation start events
 * 
 * @private
 */
mide.core.Composition.prototype.onOperationStart_ = function(e) {
	this.pubsub.publish('operation_start', e.component, e.operation);
};

/**
 * Handles component's operation end events
 * 
 * @private
 */
mide.core.Composition.prototype.onOperationEnd_ = function(e) {
	this.pubsub.publish('operation_end', e.component, e.operation);
};

/**
 * Handles component's events
 * 
 * @private
 */
mide.core.Composition.prototype.onEventTrigger_ = function(e) {
	var srcId = goog.isString(e.source) ? e.source : e.source.getId(),
		self = this;
	
	if(this.connections[srcId] && this.connections[srcId][e.event]
     && this.connections[srcId][e.event].length > 0) {
         goog.array.forEach(this.connections[srcId][e.event], function(connection) {
        	 setTimeout(function() {
             	 //create a copy of the parameters
        		 self.components[connection.target].perform(connection.op, JSON.parse(JSON.stringify(e.parameters)));
        	 }, 10);        
         });
     }
};


/**
 * Handles component's events
 * 
 * @private
 */
mide.core.Composition.prototype.onComponentRemove_ = function(e) {
	this.removeComponent(e.component);
};