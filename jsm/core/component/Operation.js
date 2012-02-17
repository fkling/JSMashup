goog.provide('jsm.core.Operation');

goog.require('jsm.util.DataStore');

/**
 * Holds the configuration of an operation.
 * The following options are available:
 *
 *  - ref: The name of the function which implements this operation.
 *         Used internally.
 *
 *  - inputs: A list of object of the form
 *            {
 *                name: {string} The name of input parameter,
 *                type: {string} A data type which can be used by the
 *                               application for validation and conversion
 *                collection: {boolean} Whether or not the value is an array
 *            }
 *
 *  - dependencies: An array of refs to other operations. These operations must
 *                  have been executed before this one.
 *
 *  - triggers: The ref of the event which is triggerd
 *              by this operation (if any)
 *
 *  - data: An object with additional information, used by the application
 *
 *
 * @constructor
 */
jsm.core.Operation = function() {
    this.inputs_ = [];
    this.dependencies_ = [];
};

jsm.core.Operation = jsm.util.DataStore.attach(jsm.core.Operation);

/**
 * The name of the function which should be
 * called when the operation is called.
 *
 * @type string
 * @private
 */
jsm.core.Operation.prototype.ref_ = '';


/**
 * A list of inputs the operation accepts.
 *
 * @type Array
 * @private
 */
jsm.core.Operation.prototype.inputs_ = null;


/**
 * Refs of other operations which have to be
 * run before this one.
 *
 * @type Array
 * @private
 */
jsm.core.Operation.prototype.dependencies_ = null;


/**
 * Refs of the event which gets triggerd by this operation.
 *
 * @type string
 * @private
 */
jsm.core.Operation.prototype.triggers_ = null;


/**
 * Additional data
 *
 * @type Object
 * @private
 */
jsm.core.Operation.prototype.data_ = null;


/**
 * Set the ref name.
 *
 * @param {string} ref - The name of the function.
 */
jsm.core.Operation.prototype.setRef = function(ref) {
    this.ref_ = ref;
};


/**
 * Get the ref name.
 *
 * @return {string} The function name.
 */
jsm.core.Operation.prototype.getRef = function() {
    return this.ref_;
};


/**
 * Set information about input parameters
 *
 * @param {Array} inputs - An array of input parameter objects.
 */
jsm.core.Operation.prototype.setInputs = function(inputs) {
    this.inputs_ = inputs;
};


/**
 * Get information about input parameters.
 *
 * @return {Array} The information about input parameters.
 */
jsm.core.Operation.prototype.getInputs = function() {
    return this.inputs_;
};


/**
 * Sets the dependencies.
 *
 * @param {Array} deps - An array of ref names.
 */
jsm.core.Operation.prototype.setDependencies = function(deps) {
    this.dependencies_ = deps;
};


/**
 * Get dependencies.
 *
 * @return {Array} the dependencies.
 */
jsm.core.Operation.prototype.getDependencies = function() {
    return this.dependencies_;
};

/**
 * @param {string} event - Name of the event.
 */
jsm.core.Operation.prototype.setTrigger = function(event) {
    this.triggers_ = event;
};


/**
 * @return {string} the name of the event which should be triggered.
 */
jsm.core.Operation.prototype.getTrigger = function() {
    return this.triggers_;
};
