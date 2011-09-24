goog.provide('jsm.core.Parameter');


/**
 * Meta information about a parameter.
 * 
 * @constructor
 */
jsm.core.Parameter = function() {
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
jsm.core.Parameter.prototype.ref = '';

/**
 * @type Object
 * @private
 */
jsm.core.Parameter.prototype.data = null;


/**
 * @type boolean
 * @private
 */
jsm.core.Parameter.prototype.required = false;

/**
 * @param {Object} ref
 * @public
 */
jsm.core.Parameter.prototype.setRef = function(ref) {
	this.ref = ref;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Parameter.prototype.setRequired = function(required) {
	this.required = required;
};


/**
 * @param {Object} ref
 * @public
 */
jsm.core.Parameter.prototype.isRequired = function() {
	return this.required;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Parameter.prototype.getRef = function() {
	return this.ref;
};


/**
 * @param {Object} outputs
 * @public
 */
jsm.core.Parameter.prototype.setDependencies = function(deps) {
	this.dependencies = deps;
};


/**
 * @return {Object}
 * @public
 */
jsm.core.Parameter.prototype.getDependencies = function() {
	return this.dependencies;
};



/**
 * @param {Object} data
 * @public
 */
jsm.core.Parameter.prototype.setData = function(data, value) {
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
jsm.core.Parameter.prototype.getData = function(key) {
	if(goog.isString(key)) {
		return this.data[key];
	}
	return this.data;
};
