goog.provide('mide.mapper.EMDLMapper');

goog.require('mide.mapper.ComponentMapper');
goog.require('mide.parser')

goog.require('goog.array');

/**
 * Converter for Extended Mashart Definition Language
 * 
 * @implements mide.mapper.ComponentMapper
 */
mide.mapper.EMDLMapper = function() {};

/**
 * @override
 */
mide.mapper.EMDLMapper.prototype.getDescriptor = function(id, model, implementation, data) {
	var events = [],
		operations = [],
		parameters = [];
	
	data = data || {};
	var root = this.parseXML(model);
	var descr = new mide.core.ComponentDescriptor();
	
	descr.setId(root['@'].id || id);
	descr.setModel(model);
	descr.setImplementation(implementation);
	descr.setData(data);
	descr.setData('name', root['@'].name || '');
	descr.setData('description', (root.description && root.description[0]['#text']) || '');
	
	descr.setOperations(this.getOperations(root));
	descr.setEvents(this.getEvents(root));
	descr.setParameters(this.getParameters(root));
	descr.setRequests(this.getRequests(root));
	
	return descr;
};


/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.getOperations = function(root) {
	var operations = [];
	var ops, op, operation, inputs, outputs;
	
	for(ops = root.operation || []; op = ops.pop(); ) {
		inputs = [];
		outputs = [];
		operation = new mide.core.Operation();
		operation.setRef(op['@'].ref);
		
		operation.setInputs(goog.array.map(op.input || [], function(input) {
			return input['@'];
		}));
		operation.setOutputs(goog.array.map(op.output || [], function(output) {
			return output['@'];
		}));
		operation.setDependencies(op['@'].dependsOn ? op['@'].dependsOn.split(/\s*,\s*/) : []);
		operation.setData('name', op['@'].name || '');
		operation.setData('description', op.description ? op.description[0]['#text'] : '');
		operations.push(operation);
	}
	return operations;
};


/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.getEvents = function(root) {
	var events = [];
	var evs, ev, event, outputs;
	
	for(evs = root.event || []; ev = evs.pop(); ) {
		outputs = [];
		event = new mide.core.Event();
		event.setRef(ev['@'].ref);
		event.setData('name', ev['@'].name || '');
		event.setData('description', ev.description ? ev.description[0]['#text'] : '');
		
		event.setOutputs(goog.array.map(ev.output || [], function(output) {
			return output['@'];
		}));
		events.push(event);
	}
	return events;
};


/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.getParameters = function(root) {
	var parameters = [];
	var paras = [], para, parameter;
	
	if(root.configuration && (paras = root.configuration[0].input)) {	
		for( ; para = paras.pop(); ) {
			parameter = new mide.core.Parameter();
			parameter.setRef(para['@'].ref);
			parameter.setData('name', para['@'].name || '');
			parameter.setDependencies(para['@'].dependsOn ? para['@'].dependsOn.split(/\s*,\s*/) : []);
			parameter.setRequired(para['@'].required || false);
	
			if(para.option) {
				parameter.setData(this.parseOptions(para.option));
			}
			
			parameters.push(parameter);
		}
	}
	return parameters;
};

/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.getRequests = function(root) {
	var result = [];
	var requests = root.request || [], request, parameters = {}, data = null;

	for( ; request = requests.pop(); ) {
		if(request.parameters) {
			parameters = goog.array.reduce(request.parameters[0].parameter || [], function(obj, parameter){
				obj[parameter['@'].name] = parameter['@'].value;
				return obj;
			}, {});
		}
		
		if(request.data) {
			if(request.data[0].parameter) {
				data = goog.array.reduce(request.data[0].parameter || [], function(obj, parameter){
					obj[parameter['@'].name] = parameter['@'].value;
					return obj;
				}, {});
			}
			else {
				data = request.data['#text'];
			}
		}	
		
		result.push({
			url: request.url && request.url[0]['#text'] || '',
			ref: request['@'].ref,
			runsOn: request['@'].runsOn,
			triggers: request['@'].triggers,
			parameters: parameters,
			data: data,
			method: request['@'].method || 'GET'
		});
	}
	return result;
};

mide.mapper.EMDLMapper.prototype.parseOptions = function(options) {
	var obj = {};
	for(var i = 0, l = options.length; i < l; i++) {
		var option = options[i];
		obj[option['@'].name] = goog.isArray(option.option) ? 
				this.parseOptions(option.option) : option['@'].value || option['#text'] || '';
	}
	return obj;
};


/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.parseXML = function(xml) {
	return mide.parser.parse(xml);
};