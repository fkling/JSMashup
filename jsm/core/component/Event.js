goog.provide('jsm.core.Event');


/**
 * Meta information about an operation.
 * 
 * @constructor
 */
jsm.core.Event = function() {
	this.outputs = {};
	this.metaData = {};
};

/**
 * The name of the function which should be
 * called when the operation is called.
 * 
 * @type string
 * @private
 */
jsm.core.Event.prototype.ref = '';

/**
 * @type Object
 * @private
 */
jsm.core.Event.prototype.outputs = null;

/**
 * @type Object
 * @private
 */
jsm.core.Event.prototype.data = null;


/**
 * @param {Object} ref
 * @public
 */
jsm.core.Event.prototype.setRef = function(ref) {
	this.ref = ref;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Event.prototype.getRef = function() {
	return this.ref;
};


/**
 * @param {Object} outputs
 * @public
 */
jsm.core.Event.prototype.setOutputs = function(outputs) {
	this.outputs = outputs;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Event.prototype.getOutputs = function() {
	return this.outputs;
};


/**
 * @param {Object} data
 * @public
 */
jsm.core.Event.prototype.setData = function(data, value) {
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
jsm.core.Event.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
};
