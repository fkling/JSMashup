goog.provide('mide.mapper.JSONMapper');

goog.require('mide.mapper.CompositionMapper');

goog.require('goog.json');

/**
 * Interface to parse model files and create
 * Compositions objects.
 */
mide.mapper.JSONMapper = function() {};

goog.inherits(mide.mapper.JSONMapper, mide.mapper.CompositionMapper);

/**
 * Converts a model description into a Composition instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {Object} data
 * @return {mide.core.Composition}
 * 
 * @public
 */
mide.mapper.JSONMapper.prototype.getComposition = function(id, model, data, callback) {
	var self = this;
	if(goog.isString(model)) {
		model = goog.json.parse(model);
	}
	
	var composition = new mide.core.Composition();
	var max_instances = model.components.length,
		num_instances = 0, 
		instances = [];
	
	composition.setId(id);
	composition.setModel(goog.json.serialize(model));
	composition.setData(data);
	
	function runWhenFinished() {
		if(num_instances === max_instances) {
			composition.setComponents(instances);
			callback(composition);
		}
	};
	
	for(var i = model.connections.length; i--; ) {
		var c = model.connections[i];
		composition.addConnection(new mide.core.composition.Connection(c.source, c.event, c.target, c.operation));
	}
	
	for(var i = 0, l = model.components.length; i < l; i++ ) {
		(function(index, definition) {
			self.registry.getComponentDescriptorById(definition.component_id, function(descr) {
				instances[index] = descr.getInstance(definition.instance_id, definition.config);
				num_instances++;
				runWhenFinished();
			}, function(){
				num_instances++;
				runWhenFinished();
			});
		}(i, model.components[i]));
	}
};