goog.provide('jsm.ui.input.TextInput');
goog.require('jsm.ui.input.BaseInput');

goog.require('goog.dom');

/**
 * A simple text input field.
 * 
 * @inheritDoc
 * @constructor
 * @extends jsm.ui.input.BaseInput
 */
jsm.ui.input.TextInput = function(name, label, opt_options) {
	goog.base(this, name, label, opt_options);
};

goog.inherits(jsm.ui.input.TextInput, jsm.ui.input.BaseInput);
jsm.ui.input.TextInput.Events = jsm.ui.input.BaseInput.Events;


/**
 * @override
 */
jsm.ui.input.TextInput.prototype.renderInternal_ = function() {
	if(!this.inputElement_) {
		this.inputElement_ = this.dom_.createDom('input', {name: this.options.get('name'), type: 'input'});
	
		this.eh.listen(this.inputElement_, goog.events.EventType.CHANGE, function() {
			this.dispatchEvent(jsm.ui.input.BaseInput.Events.CHANGE);
		}, false, this);
	}
	return this.inputElement_;
};

/**
 * @override
 */
jsm.ui.input.TextInput.prototype.getValue = function() {
	if(this.inputElement_) {
		return {value: this.inputElement_.value, display: ''};
	}
	return '';
};

/**
 * @override
 */
jsm.ui.input.TextInput.prototype.setValue = function(value) {
	if(!this.inputElement_) this.renderInternal_();
	value = goog.isObject(value) ? value.value : value;
	this.inputElement_.value = value;
	this.dispatchEvent({
	      type: jsm.ui.input.BaseInput.Events.CHANGE
	});
};
