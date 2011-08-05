goog.provide('mide.ui.input.TextInput');
goog.require('mide.ui.input.BaseInput');

goog.require('goog.dom');

/**
 * Implements a text field
 * 
 * @inheritDoc
 * @constructor
 * @extends mide.ui.input.BaseInput
 */
mide.ui.input.TextInputInput = function(options, events, opt_domHelper) {
	mide.ui.input.BaseInput.call(this, options, events, opt_domHelper);
};

goog.inherits(mide.ui.input.TextInput, mide.ui.input.BaseInput);

/**
 * @override
 */
mide.ui.input.TextInput.prototype.createInputNode = function() {
	this.input = this.dom_.createDom('input', {name: this.options.get('name'), type: 'input'});
	this.eh.listen(this.input, goog.events.EventType.CHANGE, function() {
		this.dispatchEvent('change');
	}, false, this);
	//this.update();
};

/**
 * @override
 */
mide.ui.input.TextInput.prototype.update = function() {

};

/**
 * @override
 */
mide.ui.input.TextInput.prototype.getValue = function() {
	return {value: this.input.value, display: ''};
};

/**
 * @override
 */
mide.ui.input.TextInput.prototype.setValue = function(value) {
	if(!this.input) this.createInputNode();
	this.input.value = value.value;
	this.dispatchEvent({
	      type: 'change'
	});
};