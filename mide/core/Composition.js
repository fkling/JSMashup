goog.provide('mide.core.Composition')

/**
 * @param {Array} components
 * @param {Array} connections
 * 
 * @constructor
 */
mide.core.Composition = function(components, connections) {
	this.components = [];
	this.connections = [];
	this.data = {};
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
 * @param {Array} connections
 */
mide.core.Composition.prototype.addConnection = function(connection){
	this.connections.push(connection);
};


/**
 * @param {Array} connections
 */
mide.core.Composition.prototype.setConnections = function(connections){
	this.connections = connections;
};

/**
 * return {Array} connections
 */
mide.core.Composition.prototype.getConnections = function(){
	return this.connections;
};

/**
 * @param {mide.core.Component} component
 */
mide.core.Composition.prototype.addComponent = function(component){
	this.components.push(component);
};

/**
 * @param {Array} components
 */
mide.core.Composition.prototype.setComponents = function(components){
	this.components = components;
};

/**
 * return  {Array} components
 */
mide.core.Composition.prototype.getComponents = function(){
	return this.components;
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