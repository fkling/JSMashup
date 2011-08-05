goog.provide('mide.ui.input.InputFactory');

mide.ui.input.InputFactory = {
	inputs_: {},
	registerInput: function(name, input) {
		this.inputs_[name] = input;
	},
	
	get: function(type, options, events) {
		var input = null;
		if(type in this.inputs_) {
			input = new this.inputs_[type](options, events);
		}
		return input;
	}
};