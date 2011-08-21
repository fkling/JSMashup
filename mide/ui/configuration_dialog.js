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

	this.fields = {};
	this.dependencies = {};
	var IF = mide.ui.input.InputFactory.getInstance();
	var parameter, options, renderer, ref, rendererConfig;
	
	for(var i = 0, l = parameters.length; i < l; i++) {
		parameter = parameters[i];
		rendererConfig = new mide.util.OptionMap();
		renderer = 'mide.ui.input.TextInput'; // default renderer is a text box
		options = parameter.getData();
		if(options.renderer) {
			rendererConfig =  new mide.util.OptionMap(options.renderer, this.fields, function(obj) {
				var value = obj.getValue();
				return goog.isObject(value) ? value.value : value;
			});
			renderer = options.renderer.type;  
		}
		this.fields[parameter.getRef()] = IF.get(renderer, parameter.getRef(), options.label, rendererConfig);
		
		var deps = parameter.getDependencies();
		for(var j = deps.length; j--;) {
			var rdeps = this.dependencies[deps[j]] || (this.dependencies[deps[j]] = []);
			rdeps.push(parameter.getRef());
		};
		
		// listen for the change event
		goog.events.listen(this.fields[parameter.getRef()], mide.ui.input.BaseInput.Events.CHANGE, function(event) {
			this.dispatchEvent({type: mide.ui.input.BaseInput.Events.CHANGE});
			var rdeps = this.dependencies[event.target.getName()];
			for(var i = rdeps.length; i--; ) {
				this.fields[rdeps[i]].update();
			}
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
		for(var name in this.fields) {
			this.dom_.appendChild(this.element_, this.fields[name].render());
		}
	}
};