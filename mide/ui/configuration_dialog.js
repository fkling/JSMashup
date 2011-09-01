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
mide.ui.ConfigurationDialog = function(parameters) {
	goog.ui.Component.call(this);

	this.parameters = {};
	this.fields = {};
	this.dependencies = {};
	
	var parameter, field, ref;
	
	for(var i = 0, l = parameters.length; i < l; i++) {
		parameter = parameters[i];
		field = this.getField_(parameter);
		ref = parameter.getRef();
		
		// calculate reverse dependencies
		var deps = parameter.getDependencies();
		for(var j = deps.length; j--;) {
			var rdeps = this.dependencies[deps[j]] || (this.dependencies[deps[j]] = []);
			rdeps.push(ref);
		};
		
		// listen for the change event
		goog.events.listen(field, mide.ui.input.BaseInput.Events.CHANGE, this.onFieldValueChange_, false, this);
		this.fields[ref] = field;
		this.parameters[ref] = parameter;
	}
};

goog.inherits(mide.ui.ConfigurationDialog, goog.ui.Component);

/**
 * 
 * @public
 */
mide.ui.ConfigurationDialog.prototype.getInvalidFields = function() {
	var invalid = [];
	for(var ref in this.parameters) {
		if(this.parameters[ref].isRequired() && this.fields[ref].isEmpty()) {
			invalid.push(ref);
		}
	}
	return invalid;
};


/**
 * 
 * @private
 */
mide.ui.ConfigurationDialog.prototype.getField_ = function(parameter) {
	var rendererConfig = new mide.util.OptionMap(),
		renderer = 'mide.ui.input.TextInput'; // default renderer is a text box
		options = parameter.getData();
		
	if(options.renderer) {
		rendererConfig =  new mide.util.OptionMap(options.renderer, this.fields, function(field) {
			var value = field.getValue();
			return goog.isObject(value) ? value.value : value;
		});
		renderer = options.renderer.type;  
	}
	
	return mide.ui.input.InputFactory.getInstance().get(renderer, parameter.getRef(), options.label, rendererConfig);
};


/**
 * 
 * @private
 */
mide.ui.ConfigurationDialog.prototype.onFieldValueChange_ = function(event) {
	this.dispatchEvent({type: mide.ui.input.BaseInput.Events.CHANGE});
	
	// update dependent fields
	var rdeps = this.dependencies[event.target.getName()] || [];
	
	for(var i = rdeps.length; i--; ) {
		this.fields[rdeps[i]].update();
	}
};


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
 * Get a map of values
 * 
 * @param {Object} value map
 * @public
 */
mide.ui.ConfigurationDialog.prototype.getValues = function() {
	return goog.object.map(this.fields, function(input) {
		return input.getValue().value;
	});
};

/**
 * @override
 */
mide.ui.ConfigurationDialog.prototype.createDom = function() {
	if(!this.element_) {
		this.element_ =  this.dom_.createDom('div', {'class': 'mide.configuration_dialog'});
		for(var name in this.fields) {
			this.dom_.appendChild(this.element_, this.fields[name].render());
		}
	}
};