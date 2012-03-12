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
};

goog.inherits(jsm.core.DataTypeMapper, jsm.core.ArgumentMapper);


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
    return this.config.strategy(source, event, target, operation, data);
};


/**
 * This mapping strategy simple takes the name of the 
 * data types and performs a string comparison. If 
 * more than one parameter match, the first one is chosen.
 * 
 * @public
 */
jsm.core.DataTypeMapper.SIMPLE_DATA_TYPE_COMPARISON = function(source, event, target, operation, data) {
	var outputs = source.getDescriptor().getEvent(event).getOutputs(),
		inputs = target.getDescriptor().getOperation(operation).getInputs();
	
	goog.array.forEach(inputs, function(input) {
		var output = goog.array.find(outputs, function(output)  {
			return output.type === input.type;
		});
		
		if(output && output.name in data) {
            var val = data[output.name];
            delete data[output.name];
			data[input.name] = val;
		}
	});
	
	return data;
};
