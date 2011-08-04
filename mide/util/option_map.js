goog.provide('mide.util.OptionMap');


/**
 * Provides a means to access <code><option name="..." value=".." /></code> options
 * from a component XML configuration file. 
 * 
 * Added value is the dynamic resulution of <code>{name}</code> substrings in value strings.
 * <code>name</code> will be looked up in a provided context map and replaced by the
 * corresponsing value. Optionally, the value can be exctracted by a function.
 * 
 * 
 * @param {Array.<Object>} options an array of options objects (might be nested)
 * @param {Object.<string, ?>=} opt_context a name map to look up {name} in string values
 * @param {function(?, string, Object): string=} opt_extractorFunc a function to extract the value
 * 								for {name} from the name map. Takes three parameters: The value
 *                              of <code>opt_context[name]</code>, <code>name</code> and 
 *                              <code>opt_context</code>
 * @constructor
 */
mide.util.OptionMap = function(options, opt_context, opt_extractorFunc) {
	
	/**
	 * Name-value map
	 * 
	 * @type {Object.<string, (string|mide.util.OptionMap)>}
	 * @private
	 */
	this.optionsMap_ = {};
	
	/**
	 * Keep an orderd list of the options
	 * 
	 * @type {Array.<{name: string, value}>}
	 * @private
	 */
	this.optionsArray_ = [];
	
	/**
	 * A name map to look up {name} in string values
	 * 
	 * @type {Object.<string, ?>}
	 * @private
	 */
	this.context_ = opt_context || this.optionsMap_;
	
	/**
	 * @type {function(?, string, Object): string}
	 * @private
	 */
	this.extractorFunc_ = opt_extractorFunc || null;
	
	this.parseOptions_(options, this.context_, this.extractorFunc_);
};

/**
 * 
 * @param {Array.<Object>} options an array of options objects (might be nested)
 * @param {Object.<string, ?>} opt_context a name map to look up {name} in string values
 * @param {function(?, string, Object): string} opt_extractorFunc a function to extract the value
 * 								for {name} from the name map. Takes three parameters: The value
 *                              of <code>opt_context[name]</code>, <code>name</code> and 
 *                              <code>opt_context</code>
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
 * 
 * @param {string} dvalue
 * @param {Object.<string, ?>} context
 * @param {function=} opt_extractor_func
 * @private
 */
mide.util.OptionMap.prototype.resolveDvalue_ = function(dvalue, context, opt_extractor_func) {
	return dvalue.replace(/{(.*?)}/, function(str, input) {
		if(input in context) {
			return (opt_extractor_func) ? opt_extractor_func(context[input], input, context) : context[input];
		}
		return str;
	});
};

/**
 * @param {string} name - option name
 * @return {string} the value
 * @public
 */
mide.util.OptionMap.prototype.get = function(name) {
	if(name in this.optionsMap_) {
		return this.getValue_(this.optionsMap_[name]);
	}
	return null;
};

/**
 * @param {string} name - option name
 * @param {string} value
 * @public
 */
mide.util.OptionMap.prototype.set = function(name, value) {
	this.optionsMap_[name] = value;
	this.optionsArray_.push({name:name, value:value});	
};

/**
 * @param {string} name - option name
 * @public
 */
mide.util.OptionMap.prototype.has = function(name) {
	return name in this.optionsMap_;
};

/**
 * @param {string} value
 * @return {string}
 * @private
 */
mide.util.OptionMap.prototype.getValue_ = function(value) {
	return  /{.*?}/.test(value) ? this.resolveDvalue_(value, this.context_, this.extractorFunc_) : value;
};



/**
 * Executes `callback` for every option in the map.
 * 
 * @param {function(string, string, Object.<string, ?>, number} function to execute for every elemtn
 * @public
 */
mide.util.OptionMap.prototype.each = function(callback, context) {
	var option;
	for(var i = 0, l = this.optionsArray_.length; i < l; i++) {
		option = this.optionsArray_[i];
		callback.call(context, option.name, this.getValue_(option.value), i);
	}
};
