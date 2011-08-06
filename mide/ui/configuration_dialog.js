goog.provide('mide.ui.ConfigurationDialog');

goog.require('mide.ui.input.InputFactory');
goog.require('mide.ui.input.BaseInput');
goog.require('mide.util.OptionMap');

goog.require('goog.ui.Component');
goog.require('goog.events');
goog.require('goog.object');

/**
 * Parent container for all configuration input elements.
 * 
 * @param {Array} parameterConfig A array of configuration objects as returned
 *     by the parser.
 * @constructor
 */
mide.ui.ConfigurationDialog = function(inputConfig) {
	goog.ui.Component.call(this);

	this.fields = {};
	
	var parameter, options, renderer, ref, label, name;
	
	for(var i = 0, l = inputConfig.length; i < l; i++) {
		input = inputConfig[i];
		options = new mide.util.OptionMap();
		renderer = 'mide.ui.input.TextInput'; // default renderer is a text box
		if(input.renderer) {
			options =  new mide.util.OptionMap(input.renderer[0].option, this.fields, function(obj) {
				var value = obj.getValue();
				return goog.isObject(value) ? value.value : value;
			});
			renderer = input.renderer[0].type; 
			ref = input.renderer[0].ref; 
		}
		label = input.label[0]['#text'];
		name = input.name;
		this.fields[name] = mide.ui.input.InputFactory.get(renderer, label, name, options, ref);
		
		// listen for the change event
		goog.events.listen(this.fields[name], mide.ui.input.BaseInput.Events.CHANGE, function() {
			this.dispatchEvent({type: mide.ui.input.BaseInput.Events.CHANGE});
		}, false, this);
	}
};

goog.inherits(mide.ui.ConfigurationDialog, goog.ui.Component);


/**
 * @type{Array.<mide.ui.BaseInput>}
 * @private
 */
mide.ui.ConfigurationDialog.prototype.fields = null;

/**
 * Returns a map of BaseInput fields
 * 
 * @return {Object.<string, mide.ui.BaseInput}
 * @public
 */
mide.ui.ConfigurationDialog.prototype.getFields = function() {
	return this.fields;
};

/**
 * Returns a map of configuration values
 * 
 * @return {Object}
 * @public
 */
mide.ui.ConfigurationDialog.prototype.getConfiguration = function() {
	return goog.object.map(this.fields, function(input) {
		return input.getValue();
	});
};

/**
 * Sets a map of configuration values
 * 
 * @param {Object} configuration map
 * @public
 */
mide.ui.ConfigurationDialog.prototype.setConfiguration = function(config) {
	return goog.object.forEach(config, function(value, name) {
		if(name in this.fields) {
			this.fields[name].setValue(value);
		}
	}, this);
};

/**
 * @override
 */
mide.ui.ConfigurationDialog.prototype.createDom = function() {
	if(!this.element_) {
		this.element_ =  this.dom_.createDom('div', {'class': 'mide.configuration_dialog'});
		for(var name in fields) {
			this.dom_.appendChild(this.element_, this.fields[name].render());
		}
	}
};