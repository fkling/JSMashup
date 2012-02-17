goog.provide('jsm.mapper.EMDLMapper');

goog.require('jsm.mapper.ComponentMapper');
goog.require('jsm.parser')

goog.require('goog.array');
goog.require('goog.dom.xml');

/**
 * Converter for Extended Mashart Definition Language
 * 
 * @implements jsm.mapper.ComponentMapper
 */
jsm.mapper.EMDLMapper = function(config) {
	this.config = config;
    this.dpreg_ =  jsm.processor.DataProcessorRegistry.getInstance();
	
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
jsm.mapper.EMDLMapper.prototype.getDescriptor = function(id, serialized, data) {
	var decoded = JSON.parse(serialized),
        model = this.parseXML(decoded.model);

    // register possible data processors defined in the model
    this.registerDataProcessors(id, model);

	return this.fillDescriptor_(new jsm.core.ComponentDescriptor(), decoded.model, decoded.implementation, data);
};


/**
 * @override
 */
jsm.mapper.EMDLMapper.prototype.getInstance = function(descriptor, opt_id, opt_config) {
	var instance = new jsm.core.Component(descriptor, opt_id);
	
	var f = new Function("exports", descriptor.getData('implementation')),
        fn = {};
    f(fn);
	instance.fn = fn;
    instance.setData('name', descriptor.getData('name'));
    instance.setConfiguration(opt_config);
	return instance;
};

/**
 * @override
 */
jsm.mapper.EMDLMapper.prototype.serialize = function(descriptor) {
	return JSON.stringify({
		model: descriptor.getData('model'),
		implementation: descriptor.getData('implementation')
	});
};

/**
 * @override
 */
jsm.mapper.EMDLMapper.prototype.validate = function(descriptor, valid, invalid) {
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
 * Updates the XML document with data from other fields.
 *
 * @param {XMLDocument} doc - the XML document
 * @param {Object} data - a data object
 *
 * @private
 */
jsm.mapper.EMDLMapper.prototype.updateXmlWithData_ = function(doc, data) {
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
 * Fills the descriptor with the data in the model.
 *
 * @param {jsm.core.ComponentDescriptor} descriptor - the descriptor to set up
 * @param {XMLDocument} model - the XML model
 * @param {string} implementation - a JavaScript string
 * @param {Object} data - additional information
 *
 * @private
 */
jsm.mapper.EMDLMapper.prototype.fillDescriptor_ = function(descriptor, model, implementation, data) {
	var events = [],
		operations = [],
		parameters = [],
        root = this.parseXML(model);
		
	data = data || {};
	
	descriptor.setMapper(this);
	
	descriptor.setId(root['@'].id);
	descriptor.setData(data);
	descriptor.setData('name', root['@'].name || data.name || '');
	descriptor.setData('description', (root.description && root.description[0]['#text']) || data.description || '');
	descriptor.setData('implementation', implementation || '');
	descriptor.setData('model', model || '');
    descriptor.setData('configTemplate', root.configTemplate && root.configTemplate[0]['#text'] || '');
	
	descriptor.setOperations(this.getOperations(root));
	descriptor.setEvents(this.getEvents(root));
	descriptor.setParameters(this.getParameters(root));
	descriptor.setRequests(this.getRequests(root));
	
	return descriptor;
};

/**
 * @private
 */
jsm.mapper.EMDLMapper.prototype.getOperations = function(root) {
	var operations = [];
	var ops, op, operation, inputs, outputs;
	
	for(ops = root.operation || []; op = ops.pop(); ) {
		inputs = [];
		outputs = [];
		operation = new jsm.core.Operation();
		operation.setRef(op['@'].ref);
		
		operation.setInputs(goog.array.map(op.input || [], function(input) {
			return input['@'];
		}));
        operation.setTrigger(op['@'].triggers || '');
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
jsm.mapper.EMDLMapper.prototype.getEvents = function(root) {
	var events = [];
	var evs, ev, event, outputs;
	
	for(evs = root.event || []; ev = evs.pop(); ) {
		outputs = [];
		event = new jsm.core.Event();
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
jsm.mapper.EMDLMapper.prototype.getParameters = function(root) {
	var parameters = [];
	var paras = [], para, parameter;
	
	if(paras = root.config) {	
		for( ; para = paras.pop(); ) {
			parameter = new jsm.core.Parameter();
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
jsm.mapper.EMDLMapper.prototype.getRequests = function(root) {
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
			triggers: request['@'].triggers,
			parameters: parameters,
			data: data,
			method: request['@'].method || 'GET'
		});
	}
	return result;
};


/**
 * @private
 */
jsm.mapper.EMDLMapper.prototype.parseOptions = function(options) {
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
jsm.mapper.EMDLMapper.prototype.registerDataProcessors = function(cid, model) {
   var processors = model.processor || [];

   for(var i = 0, len = processors.length; i < len; i++) {
      if((processors[i]['@'].cls || '').length > 0) { // only if cls is a non empty value
          var processor = {
              cls: processors[i]['@'].cls,
              url: processors[i]['@'].url
          };

          if(processors[i]['#text']) {
              // try to parse config as JSON
              try {
                  processor.config = goog.json.parse(processors[i]['#text']);
              }
              catch(e) {
                  processor.config = {};
              }
          }
          else {
              processor.config = {};
          }
          this.dpreg_.addDataProcessorConfiguration(cid, processor);
      }
   }
};

/**
 * @private
 */
jsm.mapper.EMDLMapper.prototype.parseXML = function(xml) {
	return jsm.parser.parse(xml);
};
