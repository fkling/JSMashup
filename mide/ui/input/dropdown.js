goog.provide('mashupIDE.ui.input.Dropdown');
goog.require('mashupIDE.ui.input.BaseInput');
goog.require('mashupIDE.ui.input.InputFactory');

goog.require('goog.dom');

/**
 * Implements a dropdown field
 * 
 * @inheritDoc
 */
mashupIDE.ui.input.Dropdown = function(options, events, opt_domHelper) {
	mashupIDE.ui.input.BaseInput.call(this, options, events, opt_domHelper);
};

goog.inherits(mashupIDE.ui.input.Dropdown, mashupIDE.ui.input.BaseInput);

/**
 * @override
 */
mashupIDE.ui.input.Dropdown.prototype.createInputNode = function() {
	this.input = this.dom_.createDom('select', {name: this.options.get('name')});
	this.eh.listen(this.input, goog.events.EventType.CHANGE, function() {
		this.dispatchEvent('change');
	}, false, this);
	//this.update();
};

/**
 * @override
 */
mashupIDE.ui.input.Dropdown.prototype.update = function() {
	goog.dom.removeChildren(this.input);
	goog.dom.append(this.input, goog.dom.createDom('option', {value: 0}, goog.dom.createTextNode('Updating...')));
	
	var self = this;
	if(this.options.has('url')) {
		var valueMapper = this.options.get('valueMapper'),
			idMapper =  this.options.get('idMapper');
		mashupIDE.net.get(this.options.get('url'), function(data) {
			goog.dom.removeChildren(self.input);
			goog.array.forEach(data, function(datum){
				var option = goog.dom.createDom('option', {value: datum[idMapper]}, goog.dom.createTextNode(datum[valueMapper]));
				if(datum[idMapper] == this.lastValue_) {
					option.setAttribute('selected', 'selected');
				}			
				goog.dom.append(self.input, option);
			});
			
		});
	}
	else if(this.options.has('items')) {
		this.options.get('items').each(function(name, value){
			goog.dom.append(this.input, goog.dom.createDom('option', {value: value}, goog.dom.createTextNode(name)));
		}, this);
	}
};

/**
 * @override
 */
mashupIDE.ui.input.Dropdown.prototype.getValue = function() {
	return {value: this.input.value, display: ''};
};

/**
 * @override
 */
mashupIDE.ui.input.Dropdown.prototype.setValue = function(value) {
	if(!this.input) this.createInputNode();
	this.lastDisplay_ = value.display;
	this.lastValue_ = value.value;
	this.dispatchEvent({
	      type: 'change'
	});
};



mashupIDE.ui.input.InputFactory.registerInput('dropdown', mashupIDE.ui.input.Dropdown);