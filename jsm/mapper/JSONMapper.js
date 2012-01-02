goog.provide('jsm.mapper.JSONMapper');

goog.require('jsm.mapper.CompositionMapper');

goog.require('goog.json');
goog.require('goog.async.DeferredList');

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
 * @param {function} callback
 * 
 * @public
 */
jsm.mapper.JSONMapper.prototype.getComposition = function(id, model, data, callback) {
	var self = this;
	model = goog.json.parse(model);
	
	var composition = new jsm.core.Composition();

	composition.setId(id);
	composition.setData(model.data);
	composition.setData(data);
	
	
	
    var def = this.registry.getComponentDescriptorsByIds(goog.array.map(model.components, function(e) {
        return e.component_id;
    }));

    def.addCallback(function(descriptors) {
        var def = [];
        for(var i = 0, len = descriptors.length; i < len; i++) {
            var definition = model.components[i];
            def.push(descriptors[i].getInstance(definition.instance_id, definition.config));
        }
        var def_list = goog.async.DeferredList.gatherResults(def);
        def_list.addCallback(function(instances) {
            var instance_map = {}, instance;

            for(var i = 0, len = instances.length; i < len; i++) {
                instance = instances[i];
                instance.setData(model.components[i].data);

                if(!instance.getData('name')) {
                    instance.setData('name', instance.getDescriptor().getData('name'));
                }
                instance_map[instance.getId()] = instance;
            }

            composition.setComponents(instances);

            for(var i = model.connections.length; i--; ) {
				var c = model.connections[i];
				composition.addConnection(new jsm.core.composition.Connection(instance_map[c.source], c.event, instance_map[c.target], c.operation));
			}

            callback(composition);
        });
    }).addErrback(function(msg) {

        throw new Error(msg);
    });
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
			config: component.getConfiguration(),
            data: component.getData()
		});
	}
	
	model.connections = composition.getConnections();
	model.data = composition.getData();
	
	return goog.json.serialize(model);
};
