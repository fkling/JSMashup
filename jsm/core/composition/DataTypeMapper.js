goog.provide('jsm.core.DataTypeMapper');

goog.require('goog.object');
goog.require('goog.array');

/**
 * This class maps the data based on the data type of
 * the parameters. 
 * 
 * The default strategy is a simple string comparison
 * of the data type names.
 * 
 * @extends jsm.core.DataTypeMapper
 * @constructor
 */
jsm.core.DataTypeMapper = function(config) {
	this.config = config || {};
	if(!this.config.strategy) {
		this.config.strategy = jsm.core.DataTypeMapper.SIMPLE_DATA_TYPE_COMPARISON;
	}
	
	this.mappings = {};
};


/**
 * Holds the mappings.
 * 
 * @private
 */
jsm.core.DataTypeMapper.prototype.mappings = null;


/**
 * Creates a unique string from the source, event, target and operation;
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * @return {string}
 * 
 * @private
 */
jsm.core.DataTypeMapper.prototype.getHash_ = function(source, event, target, operation) {
	return [source.getId(), event, target.getId(), operation].join(';');
};


/**
 * Sets up a mapping for this particular connection.
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * 
 * @return {boolean} returns true if every input parameter could be mapped
 * 		to an output parameter, else false.
 * 
 * @public
 */
jsm.core.DataTypeMapper.prototype.createMapping = function(source, event, target, operation) {
	var hash = this.getHash_(source, event, target, operation);
	
	// don't map twice
	if(this.mappings[hash]) {
		return;
	} 
	
	var mapping = this.config.strategy(source, event, target, operation);
	this.mappings[hash] = mapping;
	
	return goog.object.getCount(mapping) === target.getDescriptor().getOperation(operation).getInputs().length;
};


/**
 * Removes a mapping for this particular connection.
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * 
 * @public
 */
jsm.core.DataTypeMapper.prototype.removeMapping = function(source, event, target, operation) {
	var hash = this.getHash_(source, event, target, operation);
	
	delete this.mappings[hash];
};


/**
 * Removes a mapping for this particular connection.
 * 
 * @param {jsm.core.Component} source
 * @param {string} source
 * @param {jsm.core.Component} target
 * @param {string} operation
 * @param {Object} data
 * 
 * @return {Object} the mapped data
 * 
 * @public
 */
jsm.core.DataTypeMapper.prototype.map = function(source, event, target, operation, data) {
	var mapping = this.mappings[this.getHash_(source, event, target, operation)] || {};
	
	// push to temporary object first to not override possible 
	// existing keys
	var tmp_data = {}, replaced = [];
	
	for(var source in mapping) {
		if(source in data) {
			var target = mapping[source];
			tmp_data[target] = data[source];
			replaced.push(source);
		}
	}
	
	goog.object.extend(data, tmp_data);
	
	// remove replaced keys
	for(var i = replaced.length; i--; ) {
		delete data[replaced[i]];
	}
	
	return data;
};


/**
 * This mapping strategy simple takes the name of the 
 * data types and performs a string comparison. If 
 * more than one parameter match, the first one is chosen.
 * 
 * @public
 */
jsm.core.DataTypeMapper.SIMPLE_DATA_TYPE_COMPARISON = function(source, event, target, operation) {
	var outputs = source.getDescriptor().getEvent(event).getOutputs(),
		inputs = target.getDescriptor().getOperation(operation).getInputs(),
		mapping = {}, ga = goog.array;
	
	ga.forEach(inputs, function(input) {
		var output = ga.find(outputs, function(output)  {
			return output.type === input.type;
		});
		
		if(output) {
			mapping[input.name] = output.name;
		}
	});
	
	return mapping;
};
