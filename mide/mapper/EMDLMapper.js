goog.provide('mide.mapper.EMDLMapper');

goog.require('mide.mapper.ComponentMapper');
goog.require('mide.parser')

goog.require('goog.array');
goog.require('goog.dom.xml');

/**
 * Converter for Extended Mashart Definition Language
 * 
 * @implements mide.mapper.ComponentMapper
 */
mide.mapper.EMDLMapper = function(config) {
	this.config = config;
	
	// cross-browser XML serializer
	if( !window.XMLSerializer ){
		window.XMLSerializer = function(){};
		window.XMLSerializer.prototype.serializeToString = function( XMLObject ){
			return XMLObject.xml || '';
		};
	}
};

/**
 * @override
 */
mide.mapper.EMDLMapper.prototype.getDescriptor = function(id, serialized, data) {
	var decoded = JSON.parse(serialized);
	
	return this.fillDescriptor_(new mide.core.ComponentDescriptor(), decoded.model, decoded.implementation, data);
};


/**
 * @override
 */
mide.mapper.EMDLMapper.prototype.getInstance = function(descriptor, opt_id, opt_config) {
	var instance = new mide.core.Component(descriptor, opt_id, opt_config);
	
	var f = new Function("exports", descriptor.getData('implementation'));
	f(instance);
	if(this.config.processorProvider) {
		instance.setProcessorManager(this.config.processorProvider.getProcessorManager(instance));
	}
	return instance;
};

/**
 * @override
 */
mide.mapper.EMDLMapper.prototype.serialize = function(descriptor) {
	return JSON.stringify({
		model: descriptor.getData('model'),
		implementation: descriptor.getData('implementation')
	});
};

/**
 * @override
 */
mide.mapper.EMDLMapper.prototype.validate = function(descriptor, valid, invalid) {
	var data = descriptor.getData();
		model = data.model,
		implementation = data.implementation,
		errors = [];
	
	try {
		var doc = goog.dom.xml.loadXml(model),
			component = doc.getElementsByTagName('component')[0];
		
		// update model
		if(!data.id && !component.hasAttribute('id')) {
			error.push('The component needs a full qualified name as ID.');
		}
		else {
			doc = this.updateXmlWithData_(doc, data);
			// update descriptor
			this.fillDescriptor_(descriptor, (new XMLSerializer()).serializeToString(doc), implementation);
		}
	}
	catch(e) {
		errors.push('Parse error:' + e);
	}
	
	if(errors.length > 0) {
		invalid(errors);
	}
	else {
		valid(descriptor);
	}
};

/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.updateXmlWithData_ = function(doc, data) {
	var component = doc.getElementsByTagName('component')[0];
	
	// update the XML
	if(data.id) {
		component.setAttribute('id', data.id);
	}
	
	if(data.name) {
		component.setAttribute('name', data.name);
	}
	
	if(data.description) {
		// find description tag
		var description = component.firstChild;
		
		while(description && description.nodeName.toLowerCase() !== 'description') {
			description = description.nextSibling;
		}
		
		if(description) {
			// clear it
			while(description.firstChild) {
				description.firstChild.parentNode.removeChild(description.firstChild);
			}
		}
		else {
			// create new element
			description = doc.createElement('description');
			var before = doc.firstChild;
			component.insertBefore(doc.createTextNode('\n'), before);
			component.insertBefore(description, before);
		}
		description.appendChild(doc.createTextNode(data.description));
	}
	
	return doc;
};


/**
 * @private
 */
mide.mapper.EMDLMapper.prototype.fillDescriptor_ = function(descriptor, model, implementation, data) {
	var events = [],
		operations = [],
		parameters = [];
		root = this.parseXML(model);
		
	data = data || {};
	
	descriptor.setMapper(this);
	
	descriptor.setId(root['@'].id);
	descriptor.setData(data);
	descriptor.setData('name', root['@'].name || data.name || '');
	descriptor.setData('description', (root.description && root.description[0]['#text']) || data.description || '');
	descriptor.setData('implementation', implementation || '');
	descriptor.setData('model', model || '');
	
	descriptor.setOperations(this.getOperations(root));
	descriptor.setEvents(this.getEvents(root));
	descriptor.setParameters(this.getParameters(root));
	descriptor.setRequests(this.getRequests(root));
	
	return descriptor;
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
	
	if(paras = root.config) {	
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