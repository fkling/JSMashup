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
	if(this.options.has('default')) {
		var option = goog.dom.createDom('option', {value: this.options.get('default').get('value') || ''}, goog.dom.createTextNode(this.options.get('default').get('display') || 'default'));
		goog.dom.append(this.inputElement_, option);
	}
	
	var self = this;
	if(this.options.has('url')) {
		var valueMapper = this.options.get('valueMapper'),
			displayMapper =  this.options.get('displayMapper');
		
		mide.core.net.makeRequest({
			url: this.options.get('url'), 
			responseFormat: 'json',
			success: function(data) {			
				goog.array.forEach(data, function(datum){
					var value = goog.getObjectByName(valueMapper, datum),
						display = goog.getObjectByName(displayMapper, datum),
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
mide.ui.input.Dropdown.prototype.getValue = function() {
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
mide.ui.input.Dropdown.prototype.setValue = function(value) {
	if(!this.inputElement_) this.renderInternal_();
	this.lastDisplay_ = value.display;
	this.lastValue_ = value.value;
	this.dispatchEvent({
	      type: mide.ui.input.BaseInput.Events.CHANGE
	});
};