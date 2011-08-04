goog.provide('mide.ui.input.Text');
goog.require('mide.ui.input.BaseInput');
goog.require('mide.ui.input.InputFactory');

goog.require('goog.dom');

/**
 * Implements a text field
 * 
 * @inheritDoc
 */
mide.ui.input.Text = function(options, events, opt_domHelper) {
	mide.ui.input.BaseInput.call(this, options, events, opt_domHelper);
};

goog.inherits(mide.ui.input.Text, mide.ui.input.BaseInput);

/**
 * @override
 */
mide.ui.input.Text.prototype.createInputNode = function() {
	this.input = this.dom_.createDom('input', {name: this.options.get('name'), type: 'input'});
	this.eh.listen(this.input, goog.events.EventType.CHANGE, function() {
		this.dispatchEvent('change');
	}, false, this);
	//this.update();
};

/**
 * @override
 */
mide.ui.input.Text.prototype.update = function() {

};

/**
 * @override
 */
mide.ui.input.Text.prototype.getValue = function() {
	return {value: this.input.value, display: ''};
};

/**
 * @override
 */
mide.ui.input.Text.prototype.setValue = function(value) {
	if(!this.input) this.createInputNode();
	this.input.value = value.value;
	this.dispatchEvent({
	      type: 'change'
	});
};



mide.ui.input.InputFactory.registerInput('text', mide.ui.input.Text);