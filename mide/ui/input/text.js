goog.provide('mashupIDE.ui.input.Text');
goog.require('mashupIDE.ui.input.BaseInput');
goog.require('mashupIDE.ui.input.InputFactory');

goog.require('goog.dom');

/**
 * Implements a text field
 * 
 * @inheritDoc
 */
mashupIDE.ui.input.Text = function(options, events, opt_domHelper) {
	mashupIDE.ui.input.BaseInput.call(this, options, events, opt_domHelper);
};

goog.inherits(mashupIDE.ui.input.Text, mashupIDE.ui.input.BaseInput);

/**
 * @override
 */
mashupIDE.ui.input.Text.prototype.createInputNode = function() {
	this.input = this.dom_.createDom('input', {name: this.options.get('name'), type: 'input'});
	this.eh.listen(this.input, goog.events.EventType.CHANGE, function() {
		this.dispatchEvent('change');
	}, false, this);
	//this.update();
};

/**
 * @override
 */
mashupIDE.ui.input.Text.prototype.update = function() {

};

/**
 * @override
 */
mashupIDE.ui.input.Text.prototype.getValue = function() {
	return {value: this.input.value, display: ''};
};

/**
 * @override
 */
mashupIDE.ui.input.Text.prototype.setValue = function(value) {
	if(!this.input) this.createInputNode();
	this.input.value = value.value;
	this.dispatchEvent({
	      type: 'change'
	});
};



mashupIDE.ui.input.InputFactory.registerInput('text', mashupIDE.ui.input.Text);