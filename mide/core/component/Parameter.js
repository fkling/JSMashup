goog.provide('mide.core.Parameter');


/**
 * Meta information about a parameter.
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
 * @type Object
 * @private
 */
mide.core.Parameter.prototype.data = null;


/**
 * @type boolean
 * @private
 */
mide.core.Parameter.prototype.required = false;

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
mide.core.Parameter.prototype.setRequired = function(required) {
	this.required = required;
};


/**
 * @param {Object} ref
 * @public
 */
mide.core.Parameter.prototype.isRequired = function() {
	return this.required;
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