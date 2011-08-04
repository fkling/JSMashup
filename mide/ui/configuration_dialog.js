goog.provide('mashupIDE.ui.ConfigurationDialog');
goog.require('mashupIDE.ui.input.InputFactory');
goog.require('mashupIDE.ui.input.Dropdown');
goog.require('mashupIDE.ui.input.Autocomplete');
goog.require('mashupIDE.ui.input.Text');
goog.require('mashupIDE.ui.action.Update');
goog.require('mashupIDE.ui.action.ActionFactory');
goog.require('mashupIDE.util.OptionMap');

goog.require('goog.ui.Component');
goog.require('goog.events');
goog.require('goog.object');

/**
 * Parent container for all configuration input elements
 * 
 * @param {Array.<Object>} parameterConfig
 * @param opt_domHelper
 * @constructor
 */
mashupIDE.ui.ConfigurationDialog = function(paremterConfig, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);

	this.fields = {};
	
	var parameter, options, renderer;
	
	for(var i = 0, l = paremterConfig.length; i < l; i++) {
		parameter = paremterConfig[i];
		options = new mashupIDE.util.OptionMap();
		renderer = 'text'; // default renderer is a text box
		if(parameter.renderer) {
			options =  new mashupIDE.util.OptionMap(parameter.renderer[0].option, this.fields, function(val) {
				return val.getValue().value;
			});
			renderer = parameter.renderer[0].type; 
		}
		options.set('label', parameter.label[0]['#text']);
		options.set('name', parameter.name);
		this.fields[parameter.name] = mashupIDE.ui.input.InputFactory.get(renderer, options, (parameter.renderer && parameter.renderer[0] && parameter.renderer[0].event || []));
		
		// listen for the change event
		goog.events.listen(this.fields[parameter.name], 'change', function() {
			this.dispatchEvent({type: 'change'});
		}, false, this);
		
		this.addChild(this.fields[parameter.name], true);
	}
};

goog.inherits(mashupIDE.ui.ConfigurationDialog, goog.ui.Component);


/**
 * @type{Array.<mashupIDE.ui.BaseInput>}
 * @private
 */
mashupIDE.ui.ConfigurationDialog.prototype.fields = null;

/**
 * Returns a map of BaseInput fields
 * 
 * @return {Object.<string, mashupIDE.ui.BaseInput}
 * @public
 */
mashupIDE.ui.ConfigurationDialog.prototype.getFields = function() {
	return this.fields;
};

/**
 * Returns a map of configuration values
 * 
 * @return {Object.<string, string>}
 * @public
 */
mashupIDE.ui.ConfigurationDialog.prototype.getConfiguration = function() {
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
mashupIDE.ui.ConfigurationDialog.prototype.setConfiguration = function(config) {
	return goog.object.forEach(config, function(value, name) {
		if(name in this.fields) {
			this.fields[name].setValue(value);
		}
	}, this);
};

mashupIDE.ui.ConfigurationDialog.prototype.createDom = function() {
	this.element_ =  this.dom_.createDom('div', {'class': 'mashup-component-config'});
};