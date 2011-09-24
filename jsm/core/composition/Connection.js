goog.provide('jsm.core.composition.Connection');

/**
 * @param {jsm.code.Component} source
 * @param {string} operation
 * @param {jsm.code.Component} target
 * @param {string} source
 */
jsm.core.composition.Connection = function(source, event, target, operation) {
	this.source = source;
	this.operation = operation;
	this.target = target;
	this.event = event;
};
