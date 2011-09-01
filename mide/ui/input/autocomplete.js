goog.provide('mide.ui.input.Autocomplete');
goog.require('mide.ui.input.BaseInput');
goog.require('mide.ui.input.autocomplete.Matcher');

goog.require('goog.ui.AutoComplete');
goog.require('goog.ui.AutoComplete.Renderer');
goog.require('goog.ui.AutoComplete.InputHandler');
goog.require('goog.dom');
goog.require('goog.array');


/**
 * An autocomplete text field
 * 
 * @extends mide.ui.input.BaseInput
 * @constructor
 */
mide.ui.input.Autocomplete = function(name, label, opt_options) {
	this.lastDisplay_ = '';
	this.lastValue_ = '';
	this.data = [];
	mide.ui.input.BaseInput.call(this, name, label, opt_options);
};

goog.inherits(mide.ui.input.Autocomplete, mide.ui.input.BaseInput);
mide.ui.input.Autocomplete.Events = mide.ui.input.BaseInput.Events;

/**
 * @override
 */
mide.ui.input.Autocomplete.prototype.renderInternal_ = function() {
	if(!this.inputElement_) {
		this.inputElement_ = this.dom_.createDom('input', {
			name : this.name
		});
		var valueMapper = this.options.get('valueMapper'), 
			self = this;
	
		var renderer = new goog.ui.AutoComplete.Renderer();
		var inputhandler = new goog.ui.AutoComplete.InputHandler(null, null, false,
				300);
		var matcher = new mide.ui.input.autocomplete.Matcher(this.options.get('search_parameter'), 
				this.options.get('url'), 
				function(txt) {
			self.data = JSON.parse(txt);
			return goog.array.map(self.data, function(v) {
				return goog.getObjectByName(valueMapper, v);
			});
		});
	
		var ac = new goog.ui.AutoComplete(matcher, renderer, inputhandler);
		
		goog.events.listen(ac, goog.ui.AutoComplete.EventType.UPDATE, function(e) {
			if(e.row !== this.lastDisplay_) {
				this.lastDisplay_ = e.row;
				this.dispatchEvent({
					type: mide.ui.input.BaseInput.Events.CHANGE
				});
			}
		}, false, this);
		
		goog.events.listen(this.inputElement_, 'change', function(e) {
			if(e.target.value !== this.lastDisplay_) {
				this.lastDisplay_ = e.target.value;
				this.dispatchEvent({
					type: mide.ui.input.BaseInput.Events.CHANGE
				});
			}
		}, false, this);
	
		inputhandler.attachAutoComplete(ac);
		inputhandler.attachInputs(this.inputElement_);
	}
	return 	this.inputElement_
};

/**
 * @override
 */
mide.ui.input.Autocomplete.prototype.getValue = function() {
	var valueMapper = this.options.get('valueMapper');
	var obj = goog.array.find(this.data, function(value) {
		return this.lastDisplay_ == goog.getObjectByName(valueMapper, value);
	}, this);
	if(obj) {
		this.lastValue_ = goog.getObjectByName(this.options.get('idMapper'), obj);
	}
	return {value: this.lastValue_, display: this.lastDisplay_};
};

/**
 * @override
 */
mide.ui.input.Autocomplete.prototype.setValue = function(value) {
	if(!this.inputElement_) this.renderInternal_();
	this.lastDisplay_ = value.display;
	this.lastValue_ = value.value;
	this.inputElement_.value = this.lastDisplay_;
	this.dispatchEvent({
	      type: 'change'
	});
};