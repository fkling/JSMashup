/*global goog: true, jsm: true */
/*jshint strict:false dot:false*/
goog.provide('jsm.core.Event');


/**
 * Meta information about an operation.
 * 
 * @constructor
 */
jsm.core.Event = function() {
	this.outputs_ = [];
};

jsm.core.Event = jsm.util.DataStore.attach(jsm.core.Event);

/**
 * The name of the function which should be
 * called when the operation is called.
 * 
 * @type string
 * @private
 */
jsm.core.Event.prototype.ref_ = '';

/**
 * @type Array
 * @private
 */
jsm.core.Event.prototype.outputs_ = null;


/**
 * @param {string} ref
 * @public
 */
jsm.core.Event.prototype.setRef = function(ref) {
	this.ref_ = ref;
};


/**
 * @return {string}
 * @public
 */
jsm.core.Event.prototype.getRef = function() {
	return this.ref_;
};


/**
 * @param {Array} outputs
 * @public
 */
jsm.core.Event.prototype.setOutputs = function(outputs) {
	this.outputs_ = outputs;
};


/**
 * @return {Array}
 * @public
 */
jsm.core.Event.prototype.getOutputs = function() {
	return this.outputs_;
};
