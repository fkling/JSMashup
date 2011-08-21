goog.provide('mide.core.Parameter');


/**
 * Meta information about a paramter.
 * 
 * @constructor
 */
mide.core.Parameter = function() {
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
mide.core.Parameter.prototype.ref = '';

/**
 * @param {Object} ref
 * @public
 */
mide.core.Parameter.prototype.setRef = function(ref) {
	this.ref = ref;
};


/**
 * @return {Object}
 * @public
 */
mide.core.Parameter.prototype.getRef = function() {
	return this.ref;
};


/**
 * @param {Object} outputs
 * @public
 */
mide.core.Parameter.prototype.setDependencies = function(deps) {
	this.dependencies = deps;
};


/**
 * @return {Object}
 * @public
 */
mide.core.Parameter.prototype.getDependencies = function() {
	return this.dependencies;
};


/**
 * @type Object
 * @private
 */
mide.core.Parameter.prototype.metaData = null;


/**
 * @param {Object} data
 * @public
 */
mide.core.Parameter.prototype.setData = function(data, value) {
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
mide.core.Parameter.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
};