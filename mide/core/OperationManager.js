goog.provide('mide.core.OperationManager');

goog.require('goog.array');

mide.core.OperationManager = function(operations) {
	this.dependenciesMap = {};
	this.operations = {};
	this.lastValue = {};
	this.operationFinished = {};
	this.history = [];
	
	
	for(var i = operations.length;i--;) {
		var operation = operations[i],
			ref = operation.getRef();
		this.operations[ref] = operation;
		
		var depsMap = this.dependenciesMap[ref] || (this.dependenciesMap[ref] = [[], []]);
		var dependencies = operation.getDependencies()
		for(var j = dependencies.length; j--;) {
			var dep_ref = dependencies[j];
			depsMap[0].push(dep_ref);
			if(!this.dependenciesMap[dep_ref]) {
				this.dependenciesMap[dep_ref] = [[],[]];
			}
			this.dependenciesMap[dep_ref][1].push(x);		
		}
	}
};


/**
 * @type Object
 * @private
 */
mide.core.OperationManager.prototype.dependenciesMap = null;


/**
 * @type Object
 * @private
 */
mide.core.OperationManager.prototype.operations = null;


/**
 * @type Object
 * @private
 */
mide.core.OperationManager.prototype.lastValue = null;


/**
 * @type Object
 * @private
 */
mide.core.OperationManager.prototype.operationFinished = null;


/**
 * @type Array
 * @private
 */
mide.core.OperationManager.prototype.history = null;


/**
 * @type mide.core.Component
 * @private
 */
mide.core.OperationManager.prototype.component = null;


/**
 * @param {mide.core.Component} component
 * 
 * @public
 */
mide.core.OperationManager.prototype.setComponent = function(component) {
	this.component = component;
};

/**
 * @param {string} operation
 * 
 * @public
 */
mide.core.OperationManager.prototype.hasOperation = function(operation) {
	return !!this.operations[operation];
};


/**
 * @param {string} operation
 * 
 * @public
 */
mide.core.OperationManager.prototype.getOperation = function(operation) {
	return this.operations[operation] || null;
};


/**
 * @param {string} operation
 * @return boolean
 * 
 * @public
 */
mide.core.OperationManager.prototype.hasUnresolvedDependencies = function(operation) {
	var deps = this.dependenciesMap[operation][0];
	for(var i = deps.length;i--;) {
		if(!this.operationFinished[deps[i]]) {
			return true;
		}
	}
	return false;
};


/**
 * @param {string} operation
 * @return boolean
 * 
 * @public
 */
mide.core.OperationManager.prototype.resolve = function(operation) {
	this.operationFinished[operation] = true;
};


/**
 * @param {string} operation
 * @param {Object} params
 * 
 * @public
 */
mide.core.OperationManager.prototype.record = function(operation, params) {
	this.purge(operation);
	
	this.lastValue[operation] = params;
	this.history.push(operation);
};

/**
 * @param {string} operation
 * 
 * @private
 */
mide.core.OperationManager.prototype.purge = function(operation) {
	this.lastValue[operation] = null;
	goog.array.remove(this.history, operation);
};


mide.core.OperationManager.prototype.getOperations = function(){
		return this.operations;
};