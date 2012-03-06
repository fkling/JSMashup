goog.provide('jsm.ui.input.Dropdown');
goog.require('jsm.ui.input.BaseInput');

goog.require('goog.dom');

/**
 * Implements a dropdown field.
 * 
 * @inheritDoc
 * @extends jsm.ui.input.BaseInput
 * @constructor
 */
jsm.ui.input.Dropdown = function(name, label, opt_options) {
	goog.base(this, name, label, opt_options);
};

goog.inherits(jsm.ui.input.Dropdown, jsm.ui.input.BaseInput);
jsm.ui.input.Dropdown.Events = jsm.ui.input.BaseInput.Events;

/**
 * @override
 */
jsm.ui.input.Dropdown.prototype.renderInternal_ = function() {
	if(!this.inputElement_) {
		this.inputElement_ = this.dom_.createDom('select', {name: this.name});
		this.eh.listen(this.inputElement_, goog.events.EventType.CHANGE, function() {
			this.dispatchEvent(jsm.ui.input.BaseInput.Events.CHANGE);
		}, false, this);
	}
	return this.inputElement_;
};

/**
 * @override
 */
jsm.ui.input.Dropdown.prototype.update = function() {
	goog.dom.removeChildren(this.inputElement_);
	goog.dom.append(this.inputElement_, goog.dom.createDom('option', {value: 0}, goog.dom.createTextNode('Updating...')));
	if(this.options.has('default')) {
		var option = goog.dom.createDom('option', {value: this.options.get('default').value || ''}, goog.dom.createTextNode(this.options.get('default').display || 'default'));
		goog.dom.append(this.inputElement_, option);
	}
	
	var self = this;
	if(this.options.has('url')) {
		
		jsm.core.net.makeRequest({
			url: this.options.get('url'), 
			responseFormat: 'json',
			success: function(data) {			
				goog.array.forEach(data, function(datum){
					var value = self.options.get('value', datum, null),
						display =  self.options.get('display', datum, null)
					    option = goog.dom.createDom('option', {value: value}, goog.dom.createTextNode(display));
					if(value == self.lastValue_) {
						option.setAttribute('selected', 'selected');
					}			
					goog.dom.append(self.inputElement_, option);
				});
			},
			complete: function() {
				goog.dom.removeNode(goog.dom.getFirstElementChild(self.inputElement_));
			}
		});
	}
	else if(this.options.has('items')) {
		this.options.get('items').each(function(name, value){
			goog.dom.append(this.inputElement_, goog.dom.createDom('option', {value: value}, goog.dom.createTextNode(name)));
		}, this);
	}
};

/**
 * @override
 */
jsm.ui.input.Dropdown.prototype.getValue = function() {
	var value = this.inputElement_.value,
		display = '';
	if(this.inputElement_.options.length > 0) {
		display = this.inputElement_.options[this.inputElement_.selectedIndex].innerHTML;
	}
	return {
		value: value, 
		display: display
	};
};

/**
 * @override
 */
jsm.ui.input.Dropdown.prototype.setValue = function(value) {
	if(!this.inputElement_) this.renderInternal_();
	this.lastDisplay_ = value.display;
	this.lastValue_ = value.value;
	this.dispatchEvent({
	      type: jsm.ui.input.BaseInput.Events.CHANGE
	});
};
