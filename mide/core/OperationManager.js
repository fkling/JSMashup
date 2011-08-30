goog.provide('mide.core.OperationManager');

goog.require('goog.array');

mide.core.OperationManager = function(component, operations) {
	this.dependenciesMap = {};
	this.operations = {};
	this.lastValue = {};
	this.operationFinished = {};
	this.history = [];
	this.component = component;
	
	
	for(var i = operations.length;i--;) {
		var operation = operations[i],
			ref = operation.getRef();
		this.operations[ref] = operation;
		
		// Creates a dependency map. Each entry consists of two arrays:
		// The first array contains the names, the entry depends on
		// The second array contains the names, the entry is an dependency of (reverse dependency)
		var depsMap = this.dependenciesMap[ref] || (this.dependenciesMap[ref] = [[], []]);
		var dependencies = operation.getDependencies()
		for(var j = dependencies.length; j--;) {
			var dep_ref = dependencies[j];
			depsMap[0].push(dep_ref);
			if(!this.dependenciesMap[dep_ref]) {
				this.dependenciesMap[dep_ref] = [[],[]];
			}
			this.dependenciesMap[dep_ref][1].push(ref);		
		}
	}
	
	this.dependencyQueue_ = [];
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
	delete this.lastValue[operation];
	
	// resolve dependencies
	var reverse_deps = this.dependenciesMap[operation] && this.dependenciesMap[operation][1] || [];
	for(var i = reverse_deps.length; i--; ) {
		if(!goog.array.contains(this.dependencyQueue_, reverse_deps[i])) {
			this.dependencyQueue_.push(reverse_deps[i]);
		}
	}
	this.resolveDependencyQueue_();
};

/**
 * 
 * @private
 */
mide.core.OperationManager.prototype.resolveDependencyQueue_ = function() {
	// make a async call
	var self = this;
	setTimeout(function() {
		var next_op = self.dependencyQueue_.shift();
		if(next_op && self.lastValue[next_op]) {
			self.component.perform(next_op, self.lastValue[next_op] || {});
		}
	}, 0)
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