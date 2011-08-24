goog.provide('mide.converter.EMDLConverter');

goog.require('mide.converter.ModelConverter');
goog.require('mide.parser')

/**
 * Converter for Extended Mashart Definition Language
 * 
 * @implements mide.converter.ModelConverter
 */
mide.converter.EMDLConverter = function() {};

/**
 * @override
 */
mide.converter.EMDLConverter.prototype.getDescriptor = function(id, model, implementation, data) {
	var events = [],
		operations = [],
		parameters = [];
	
	data = data || {};
	var root = this.parseXML(model);
	var descr = new mide.core.ComponentDescriptor();
	
	descr.setId(root.id || id || data.id);
	descr.setModel(model);
	descr.setImplementation(implementation);
	descr.setData(data);
	descr.setData('name', root.name || data.name || '');
	descr.setData('description', (root.description && root.description[0]['#text']) || data.description || '');
	
	descr.setOperations(this.getOperations(root));
	descr.setEvents(this.getEvents(root));
	descr.setParameters(this.getParameters(root));
	
	return descr;
};


/**
 * @private
 */
mide.converter.EMDLConverter.prototype.getOperations = function(root) {
	var operations = [];
	var ops, op, operation, inputs, outputs;
	
	for(ops = root.operation || []; op = ops.pop(); ) {
		inputs = [];
		outputs = [];
		operation = new mide.core.Operation();
		operation.setRef(op.ref);
		
		operation.setInputs(op.input || []);
		operation.setOutputs(op.output || []);
		operation.setDependencies(op.dependsOn ? op.dependsOn.split(/\s*,\s*/) : []);
		operation.setData('name', op.name);
		operations.push(operation);
	}
	return operations;
};


/**
 * @private
 */
mide.converter.EMDLConverter.prototype.getEvents = function(root) {
	var events = [];
	var evs, ev, event, outputs;
	
	for(evs = root.event || []; ev = evs.pop(); ) {
		outputs = [];
		event = new mide.core.Event();
		event.setRef(ev.ref);
		event.setData('name', ev.name);
		
		event.setOutputs(ev.output || []);
		events.push(event);
	}
	return events;
};


/**
 * @private
 */
mide.converter.EMDLConverter.prototype.getParameters = function(root) {
	var parameters = [];
	var paras = [], para, parameter;
	
	try {
		paras = root.configuration[0].input || [];
	}
	catch(e){}
	
	for( ; para = paras.pop(); ) {
		parameter = new mide.core.Parameter();
		parameter.setRef(para.name);
		parameter.setData('name', para.name || '');
		parameter.setDependencies(para.dependsOn ? para.dependsOn.split(/\s*,\s*/) : []);

		if(para.option) {
			parameter.setData(this.parseOptions(para.option));
		}
		
		parameters.push(parameter);
	}
	return parameters;
};

mide.converter.EMDLConverter.prototype.parseOptions = function(options) {
	var obj = {};
	for(var i = 0, l = options.length; i < l; i++) {
		var option = options[i];
		obj[option.name] = goog.isArray(option.option) ? 
				this.parseOptions(option.option) : option.value;
	}
	return obj;
};


/**
 * @private
 */
mide.converter.EMDLConverter.prototype.parseXML = function(xml) {
	return mide.parser.parse(xml);
};