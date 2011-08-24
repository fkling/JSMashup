goog.provide('mide.core.composition.Connection');

/**
 * @param {mide.code.Component} source
 * @param {string} operation
 * @param {mide.code.Component} target
 * @param {string} source
 */
mide.core.composition.Connection = function(source, event, target, operation) {
	this.source = source;
	this.operation = operation;
	this.target = target;
	this.event = event;
};