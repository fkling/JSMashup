goog.provide('jsm.ui.ConfigurationDialog');

goog.require('jsm.ui.input.InputFactory');
goog.require('jsm.ui.input.BaseInput');
goog.require('jsm.util.OptionMap');

goog.require('goog.ui.Component');
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Parent container for all configuration input elements.
 * 
 * @param {Array} parameterConfig A array of configuration objects as returned
 *     by the parser.
 * @constructor
 */
jsm.ui.ConfigurationDialog = function(parameters, template) {
	goog.ui.Component.call(this);

	this.parameters = {};
	this.fields = {};
	this.dependencies = {};
    this.template = template;
	
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
		goog.events.listen(field, jsm.ui.input.BaseInput.Events.CHANGE, this.onFieldValueChange_, false, this);
		this.fields[ref] = field;
		this.parameters[ref] = parameter;
	}
};

goog.inherits(jsm.ui.ConfigurationDialog, goog.ui.Component);

/**
 * 
 * @public
 */
jsm.ui.ConfigurationDialog.prototype.getInvalidFields = function() {
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
jsm.ui.ConfigurationDialog.prototype.getField_ = function(parameter) {
	var rendererConfig = new jsm.util.OptionMap(),
		renderer = 'jsm.ui.input.TextInput'; // default renderer is a text box
		options = parameter.getData();
		
	if(options.renderer) {
		rendererConfig =  new jsm.util.OptionMap(options.renderer, this.fields, function(field) {
			var value = field.getValue();
			return goog.isObject(value) ? value.value : value;
		});
		renderer = options.renderer.type;  
	}
	
	return jsm.ui.input.InputFactory.getInstance().get(renderer, parameter.getRef(), options.label, rendererConfig);
};


/**
 * 
 * @private
 */
jsm.ui.ConfigurationDialog.prototype.onFieldValueChange_ = function(event) {
	this.dispatchEvent({type: jsm.ui.input.BaseInput.Events.CHANGE});
	
	// update dependent fields
	var rdeps = this.dependencies[event.target.getName()] || [];
	
	for(var i = rdeps.length; i--; ) {
		this.fields[rdeps[i]].update();
	}
};


/**
 * @type{Array.<jsm.ui.BaseInput>}
 * @private
 */
jsm.ui.ConfigurationDialog.prototype.fields = null;

/**
 * Returns a map of BaseInput fields
 * 
 * @return {Object.<string, jsm.ui.BaseInput}
 * @public
 */
jsm.ui.ConfigurationDialog.prototype.getFields = function() {
	return this.fields;
};

/**
 * Returns a map of configuration values
 * 
 * @return {Object}
 * @public
 */
jsm.ui.ConfigurationDialog.prototype.getConfiguration = function() {
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
jsm.ui.ConfigurationDialog.prototype.setConfiguration = function(config) {
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
jsm.ui.ConfigurationDialog.prototype.getValues = function() {
	return goog.object.map(this.fields, function(input) {
		return input.getValue().value;
	});
};

/**
 * @override
 */
jsm.ui.ConfigurationDialog.prototype.createDom = function() {
	if(!this.element_) {
        if(goog.object.getKeys(this.fields).length > 0) {
            if(this.template) {
                this.element_ = this.prepareTemplate_();
                this.element_.className = 'jsm.configuration_dialog';
            }
            else {
                this.element_ =  this.dom_.createDom('div', {'class': 'jsm.configuration_dialog'});
                for(var name in this.fields) {
                    this.dom_.appendChild(this.element_, this.fields[name].render());
                }
            }
        }
	}
};

jsm.ui.ConfigurationDialog.prototype.prepareTemplate_ = function() {
    var tmp = document.createElement('div');
    if(typeof this.template === 'string') {
        this.template = this.template.replace(/\{\s*(\S+)\s*\}/g, function(match,  name) {
            return '<span class="jsm_placeholder" data-name="' + name + '"></span>';
        });
        tmp.innerHTML = this.template;
    }
    else {
        tmp.appendChild(this.template);
    }

    var placeholders = goog.dom.getElementsByClass('jsm_placeholder', tmp);
    for(var i = 0, l = placeholders.length; i < l; i++) {
        var p = placeholders[i];
        p.parentNode.replaceChild(this.fields[p.getAttribute('data-name')].render(), p);
    }
    return tmp;
};
