/*global goog: true, jsm: true */
/*jshint strict:false */
goog.provide('jsm.util.DataStore');

goog.require('goog.object');

/**
 * A container for additional data.
 *
 * @constructor
 */
jsm.util.DataStore = function() {
    /**
     * @type {Object}
     * @private
     */
    this.data_store_ = {};
};


/**
 * Extends the given constructor with the data store capabilities.
 * A new constructor function is returned due to the nature of data store.
 *
 * @this {jsm.util.DataStore}
 * @param {function} cstr - The constructor.
 * @return {function} The new constructor.
 */
jsm.util.DataStore.attach = function(cstr) {

    var tmp_cstr = function() {
       this.data_store_ = {};
       return cstr.apply(this, arguments);
    };

    tmp_cstr.prototype = cstr.prototype;
    tmp_cstr.prototype.setData = this.prototype.setData;
    tmp_cstr.prototype.getData = this.prototype.getData;

    return tmp_cstr;
};


/**
 *  Adds values to the datastore. Data is cloned.
 *
 *  If the first argument is an object, then all values are added
 *  to the current values.
 *  If the second argument is a boolean and set to false,
 *  existing keys are not overridden (default to true).
 *  If the third argument is a boolean, existing keys are purged.
 *
 *  If the first parameter is a string, it is treated as
 *  the key for the new value. The value is determined by
 *  the second argument.
 *  If the argument is a function, its return value will be
 *  used as value. Inside the function, this refers to the
 *  DataStore.
 *  A third argument determines whether an existing key should
 *  be overridden (default to true).
 *
 *  @extern
 */
jsm.util.DataStore.prototype.setData = function() {
    var data, purge = false, override = true;

    if (goog.isObject(arguments[0])) {
        data = arguments[0];
        override = arguments[1] !== false;
        purge = arguments[2] === true;
    }
    else if (goog.isString(arguments[0])) {
        data = {};
        data[arguments[0]] = goog.isFunction(arguments[1]) ? arguments[1].call(this) : arguments[1];
        override = arguments[2] !== false;
    }

    if (data) {
        if (purge) {
            this.data_store_ = goog.object.unsafeClone(data);
        }
        else {
            for (var key in data) {
                if (data.hasOwnProperty(key) && (!this.data_store_.hasOwnProperty(key) || override)) {
                    this.data_store_[key] = data[key];
                }
            }
        }
    }
};

/**
 * Returns a copy of a value or all values from the data store.
 *
 * If no arguments are passed, all values are returned.
 *
 * If one arguments is passed, the value of the provided key is
 * returned and null if it does not exits.
 *
 * If three arguments are passed, the third argument will be
 * returned if the key does not exist.
 *
 * @return {*} The value.
 * @extern
 */
jsm.util.DataStore.prototype.getData = function() {

    if (arguments.length === 0) {
        return goog.object.unsafeClone(this.data_store_);
    }
    var key = arguments[0];

    return key in this.data_store_ ?
        goog.object.unsafeClone(this.data_store_[key]) :
        (arguments.length > 1 ? arguments[1] : null);
};
