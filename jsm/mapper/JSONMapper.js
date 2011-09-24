goog.provide('jsm.mapper.JSONMapper');

goog.require('jsm.mapper.CompositionMapper');

goog.require('goog.json');

/**
 * Interface to parse model files and create
 * Compositions objects.
 */
jsm.mapper.JSONMapper = function() {};

goog.inherits(jsm.mapper.JSONMapper, jsm.mapper.CompositionMapper);

/**
 * Converts a model description into a Composition instance.
 * 
 * @param {string} id
 * @param {string} model
 * @param {Object} data
 * @return {jsm.core.Composition}
 * 
 * @public
 */
jsm.mapper.JSONMapper.prototype.getComposition = function(id, model, data, callback) {
	var self = this;
	model = goog.json.parse(model);
	
	var composition = new jsm.core.Composition();
	var max_instances = model.components.length,
		num_instances = 0, 
		instances = [],
		instanceMap = {};
	
	composition.setId(id);
	composition.setData(model.data);
	composition.setData(data);
	
	function runWhenFinished() {
		if(num_instances === max_instances) {
			composition.setComponents(instances);
			
			for(var i = model.connections.length; i--; ) {
				var c = model.connections[i];
				composition.addConnection(new jsm.core.composition.Connection(instanceMap[c.source], c.event, instanceMap[c.target], c.operation));
			}
			
			callback(composition);
		}
	};
	
	
	
	for(var i = 0, l = model.components.length; i < l; i++ ) {
		(function(index, definition) {
			self.registry.getComponentDescriptorById(definition.component_id, function(descr) {
				var instance =  descr.getInstance(definition.instance_id, definition.config);
				instances[index] = instanceMap[instance.getId()] = instance;
				num_instances++;
				runWhenFinished();
			}, function(){
				num_instances++;
				runWhenFinished();
			});
		}(i, model.components[i]));
	}
};


jsm.mapper.JSONMapper.prototype.serialize = function(composition) {
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
