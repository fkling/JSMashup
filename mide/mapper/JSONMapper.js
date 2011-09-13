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
	model = goog.json.parse(model);
	
	var composition = new mide.core.Composition();
	var max_instances = model.components.length,
		num_instances = 0, 
		instances = [];
	
	composition.setId(id);
	composition.setData(data);
	composition.setData(model.data);
	
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


mide.mapper.JSONMapper.prototype.serialize = function(composition) {
	var model = {
			components: [],
			connections: [],
			data: {}
	};
	
	
	var components = composition.getComponents();
	
	
	for( i = 0 ; i < components.length ; i++) {
		var component =  components[i];
		model.components.push({
			instance_id:  component.getId(),
			component_id: component.getDescriptor().getId(),
			config: component.getConfiguration()
		});
	}
	
	model.connections = composition.getConnections();
	model.data = composition.getData();
	
	return goog.json.serialize(model);
};