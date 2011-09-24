goog.provide('jsm.core.Operation');


/**
 * Meta information about an operation.
 * 
 * @constructor
 */
jsm.core.Operation = function() {
	this.inputs = [];
	this.outputs = [];
	this.data = {};
	this.dependencies = [];
};

/**
 * The name of the function which should be
 * called when the operation is called.
 * 
 * @type string
 * @private
 */
jsm.core.Operation.prototype.ref = '';

/**
 * @type Object
 * @private
 */
jsm.core.Operation.prototype.inputs = null;

/**
 * @type Object
 * @private
 */
jsm.core.Operation.prototype.outputs = null;

/**
 * @type Object
 * @private
 */
jsm.core.Operation.prototype.data = null;

/**
 * @type Object
 * @private
 */
jsm.core.Operation.prototype.dependencies = null;


/**
 * @type boolean
 * @private
 */
jsm.core.Operation.prototype.internal = false;

/**
 * @type boolean
 * @private
 */
jsm.core.Operation.prototype.async = false;


/**
 * @param {Object} ref
 * @public
 */
jsm.core.Operation.prototype.setRef = function(ref) {
	this.ref = ref;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Operation.prototype.getRef = function() {
	return this.ref;
};


/**
 * @param {Object} inputs
 * @public
 */
jsm.core.Operation.prototype.setInputs = function(inputs) {
	this.inputs = inputs;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Operation.prototype.getInputs = function() {
	return this.inputs;
};


/**
 * @param {Object} outputs
 * @public
 */
jsm.core.Operation.prototype.setOutputs = function(outputs) {
	this.outputs = outputs;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Operation.prototype.getOutputs = function() {
	return this.outputs;
};


/**
 * @param {Object} outputs
 * @public
 */
jsm.core.Operation.prototype.setDependencies = function(deps) {
	this.dependencies = deps;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Operation.prototype.getDependencies = function() {
	return this.dependencies;
};


/**
 * @param {boolean} internal
 * @public
 */
jsm.core.Operation.prototype.setInternal = function(internal) {
	this.internal = internal;
};


/**
 * @return {boolean}
 * @public
 */
jsm.core.Operation.prototype.isInternal = function() {
	return this.internal;
};


/**
 * @param {boolean} internal
 * @public
 */
jsm.core.Operation.prototype.setAsync = function(async) {
	this.async = async;
};


/**
 * @return {boolean}
 * @public
 */
jsm.core.Operation.prototype.isAsync = function() {
	return this.async;
};


/**
 * @param {Object} data
 * @public
 */
jsm.core.Operation.prototype.setData = function(data, value) {
	if(arguments.length == 2) {
		var d = this.data || (this.data = {});
		d[data] = value;
	}
	else {
		this.data = data;
	}
};


/**
 * @return {*}
 * @public
 */
jsm.core.Operation.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
};
