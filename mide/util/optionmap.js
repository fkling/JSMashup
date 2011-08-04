goog.provide('mide.util.OptionMap');


/**
 * Provides a means to access 
 * <code><pre>
 * &lt;option name="..." value=".." /&gt;
 * &lt;option name="..."&gt;
 *     &lt;option name="..." value=".." /&gt;
 * &lt;/option&gt;
 * </pre></code> options parsed by {@link mide.parser} from a component model file. The expected input
 * is therefore
 * <code>[{name:'...', value:'...'}, {name:'...', option:[{name:'...', value:'...'}]}</code>
 * <br>
 * <br>
 * Added value is the dynamic resolution of <code>{name}</code> substrings in value strings.
 * <code>name</code> will be looked up in a provided context map and replaced by the
 * corresponding value. Optionally, the value can be extracted by a callback function.
 * 
 * 
 * @param {Array} options an array of option objects (might be nested)
 * @param {Object} opt_context a name map to look up {name} in string values
 * @param {function(?, string, Object): string=} opt_extractorFunc a function to extract the value
 * 								for <code>{name}</code> from the name map. Takes three parameters: The value
 *                              of <code>opt_context[name]</code>, <code>name</code> and 
 *                              <code>opt_context</code>
 * @constructor
 */
mide.util.OptionMap = function(options, opt_context, opt_extractorFunc) {
	
	this.optionsMap_ = {};
	this.optionsArray_ = [];
	this.context_ = opt_context || this.optionsMap_;
	this.extractorFunc_ = opt_extractorFunc || null;
	
	this.parseOptions_(options, this.context_, this.extractorFunc_);
};


/**
 * Name-value map
 * 
 * @type {Object} each value is either a string or another option map
 * @private
 */
mide.util.OptionMap.prototype.optionsMap = null;


/**
 * Keep an ordered list of the options
 * 
 * @type {Array}
 * @private
 */
mide.util.OptionMap.prototype.optionsArray_ = null;


/**
 * A name map to look up <code>{name}</code> in string values
 * 
 * @type {Object}
 * @private
 */
mide.util.OptionMap.prototype.context_ = null;

/**
 * @type {function}
 * @private
 */
mide.util.OptionMap.prototype.extractorFunc_ = null;



/**
 * Does the actual parsing.
 * 
 * @param {Array} options an array of options objects (might be nested)
 * @param {Object} opt_context a name map to look up {name} in string values
 * @param {function} opt_extractorFunc a function to extract the value
 * 								for <code>{name}</code> from the name map. Takes three parameters: The value
 *                              of <code>opt_context[name]</code>, <code>name</code> and 
 *                              <code>opt_context</code>
 *                              
 * @private
 */
mide.util.OptionMap.prototype.parseOptions_ = function(options, context, extractor_func) {
	options = options || [];
	var value;
	for(var i = options.length; i--; ) {
		if(options[i].option) {
			value = new mide.util.OptionMap(options[i].option, context, extractor_func);
		}
		else {
			value = options[i].value;
		}
		this.optionsMap_[options[i].name] = value;
		this.optionsArray_[i] = {name: options[i].name, value: value};
	}
};


/**
 * Retrieve the value for <code>name</code>. Might be a string
 * or another mide.util.OptionMap.
 * 
 * @param {string} name option name
 * @return {?string|mide.util.OptionMap} The value or <code>null</code> if not present
 * 
 * @public
 */
mide.util.OptionMap.prototype.get = function(name) {
	if(name in this.optionsMap_) {
		return this.getValue_(this.optionsMap_[name]);
	}
	return null;
};


/**
 * Internal method to get an options value. Resolves <code>{names}s</code>
 * if present.
 * 
 * @param {string} value
 * @return {string}
 * 
 * @private
 */
mide.util.OptionMap.prototype.getValue_ = function(value) {
	return  /{.*?}/.test(value) ? this.resolveDvalue_(value, this.context_, this.extractorFunc_) : value;
};


/**
 * Gets the value, resolving <code>{names}</code>s contained in <code>dvalue</code>
 * in the context of <code>context</code>.
 * 
 * @param {string} dvalue
 * @param {Object} context
 * @param {function=} opt_extractor_func
 * @return {string}
 * 
 * @private
 */
mide.util.OptionMap.prototype.resolveDvalue_ = function(dvalue, context, opt_extractor_func) {
	return dvalue.replace(/{(.*?)}/, function(str, input) {
		if(input in context) {
			return (opt_extractor_func) ? opt_extractor_func(context[input], input, context) : context[input];
		}
		return '';
	});
};

/**
 * Add a new option with name <code>name</code> and value <code>value</code>
 * 
 * @param {string} name - option name
 * @param {string} value
 * 
 * @public
 */
mide.util.OptionMap.prototype.set = function(name, value) {
	this.optionsMap_[name] = value;
	this.optionsArray_.push({name:name, value:value});	
};


/**
 * Tests for existence of <code>name</code>.
 * 
 * @param {string} name
 * @return {boolean}
 * 
 * @public
 */
mide.util.OptionMap.prototype.has = function(name) {
	return name in this.optionsMap_;
};


/**
 * Iterates over all options and executes <code>callback</code> for every option in the map.
 * 
 * @param {function} callback The function to execute for every element. Gets three parameters:
 * 					 <code>name</code>, the name of the option, <code>value</code>, the value of the option,
 * 					 <code>index</code>, the index of the option.
 * @param {Object} opt_context The object, <code>this</code> should refer to in the callback.
 * 
 * @public
 */
mide.util.OptionMap.prototype.each = function(callback, opt_context) {
	var option;
	for(var i = 0, l = this.optionsArray_.length; i < l; i++) {
		option = this.optionsArray_[i];
		callback.call(opt_context, option.name, this.getValue_(option.value), i);
	}
};
