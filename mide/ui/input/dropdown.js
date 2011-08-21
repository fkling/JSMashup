goog.provide('mide.ui.input.Dropdown');
goog.require('mide.ui.input.BaseInput');

goog.require('goog.dom');

/**
 * Implements a dropdown field.
 * 
 * @inheritDoc
 * @extends mide.ui.input.BaseInput
 * @constructor
 */
mide.ui.input.Dropdown = function(name, label, opt_options) {
	goog.base(this, name, label, opt_options);
};

goog.inherits(mide.ui.input.Dropdown, mide.ui.input.BaseInput);
mide.ui.input.Dropdown.Events = mide.ui.input.BaseInput.Events;

/**
 * @override
 */
mide.ui.input.Dropdown.prototype.renderInternal_ = function() {
	if(!this.inputElement_) {
		this.inputElement_ = this.dom_.createDom('select', {name: this.name});
		this.eh.listen(this.inputElement_, goog.events.EventType.CHANGE, function() {
			this.dispatchEvent(mide.ui.input.BaseInput.Events.CHANGE);
		}, false, this);
	}
	return this.inputElement_;
};

/**
 * @override
 */
mide.ui.input.Dropdown.prototype.update = function() {
	goog.dom.removeChildren(this.inputElement_);
	goog.dom.append(this.inputElement_, goog.dom.createDom('option', {value: 0}, goog.dom.createTextNode('Updating...')));
	
	var self = this;
	if(this.options.has('url')) {
		var valueMapper = this.options.get('valueMapper'),
			displayMapper =  this.options.get('displayMapper');
		
		mide.core.net.makeRequest({
			url: this.options.get('url'), 
			responseFormat: 'json',
			success: function(data) {
				goog.dom.removeChildren(self.inputElement_);
				goog.array.forEach(data, function(datum){
					var value = goog.getObjectByName(valueMapper, datum),
						display = goog.getObjectByName(displayMapper, datum),
					    option = goog.dom.createDom('option', {value: value}, goog.dom.createTextNode(display));
					if(value == this.lastValue_) {
						option.setAttribute('selected', 'selected');
					}			
					goog.dom.append(self.inputElement_, option);
				});
				
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
mide.ui.input.Dropdown.prototype.getValue = function() {
	return {
		value: this.inputElement_.value, 
		display: this.inputElement_.options[this.inputElement_.selectedIndex]
	};
};

/**
 * @override
 */
mide.ui.input.Dropdown.prototype.setValue = function(value) {
	if(!this.inputElement_) this.renderInternal_();
	this.lastDisplay_ = value.display;
	this.lastValue_ = value.value;
	this.dispatchEvent({
	      type: mide.ui.input.BaseInput.Events.CHANGE
	});
};