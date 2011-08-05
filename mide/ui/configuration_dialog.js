goog.provide('mide.ui.ConfigurationDialog');
goog.require('mide.ui.input.InputFactory');
goog.require('mide.ui.input.Dropdown');
goog.require('mide.ui.input.Autocomplete');
goog.require('mide.ui.input.TextInput');
goog.require('mide.ui.action.Update');
goog.require('mide.ui.action.ActionFactory');
goog.require('mide.util.OptionMap');

goog.require('goog.ui.Component');
goog.require('goog.events');
goog.require('goog.object');

/**
 * Parent container for all configuration input elements
 * 
 * @param {Array.<Object>} parameterConfig
 * @constructor
 */
mide.ui.ConfigurationDialog = function(paremterConfig) {
	goog.ui.Component.call(this);

	this.fields = {};
	
	var parameter, options, renderer;
	
	for(var i = 0, l = paremterConfig.length; i < l; i++) {
		parameter = paremterConfig[i];
		options = new mide.util.OptionMap();
		renderer = 'text'; // default renderer is a text box
		if(parameter.renderer) {
			options =  new mide.util.OptionMap(parameter.renderer[0].option, this.fields, function(val) {
				return val.getValue().value;
			});
			renderer = parameter.renderer[0].type; 
		}
		options.set('label', parameter.label[0]['#text']);
		options.set('name', parameter.name);
		this.fields[parameter.name] = mide.ui.input.InputFactory.get(renderer, options, (parameter.renderer && parameter.renderer[0] && parameter.renderer[0].event || []));
		
		// listen for the change event
		goog.events.listen(this.fields[parameter.name], 'change', function() {
			this.dispatchEvent({type: 'change'});
		}, false, this);
		
		this.addChild(this.fields[parameter.name], true);
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
 * @return {Object.<string, string>}
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
 * @param {Object.<string, string>} config
 * @public
 */
mide.ui.ConfigurationDialog.prototype.setConfiguration = function(config) {
	return goog.object.forEach(config, function(value, name) {
		if(name in this.fields) {
			this.fields[name].setValue(value);
		}
	}, this);
};

mide.ui.ConfigurationDialog.prototype.createDom = function() {
	this.element_ =  this.dom_.createDom('div', {'class': 'mashup-component-config'});
};