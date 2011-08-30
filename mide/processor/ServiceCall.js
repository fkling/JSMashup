goog.provide('org.reseval.processor.ServiceCall');
goog.require('mide.core.net');
goog.require('mide.core.Session');
goog.require('mide.core.Composition');

goog.require('goog.dom');
goog.require('goog.events');

org.reseval.processor.ServiceCall = function(config) {
	this.config = config || {};
	this.data = {};
	this.output = goog.dom.createElement('div');
	
	this.n = 0;
};

org.reseval.processor.ServiceCall.prototype.setComponentInstance = function(component) {
	this.component = component;
	
	goog.events.listen(this.component.getComposition(), mide.core.Composition.Events.CHANGE, function() {
		this.n++;
	}, null, this);
};

org.reseval.processor.ServiceCall.prototype.perform = function(operation, params, next) {
	var self = this,
		config = this.config[operation];
	this.data[operation] = {};
	
	var controlData = params.controlData;
	if(controlData && controlData.cacheKey) {
		this.data[operation].cacheKey = controlData.cacheKey;
	}
	else {
		this.data[operation].cacheKey = mide.core.Session.getInstance().getId() + this.component.getId() + this.n;
	}
	
	if(config && config.url) {
		mide.core.net.makeRequest({
			url: config.url, 
			parameters: {key: this.data[operation].cacheKey, data: 'yes', fetch: 10},
			responseFormat: 'json',
			complete: function(response) {
				self.output.innerHTML = JSON.stringify(response);
				self.data[operation].cacheKey = response.cacheKey;
				self.data[operation].dataObject = response.dataObject;
				if(config.passthrough) {
					next(response.dataObject);
				}
			}
		});
	}
	else {
		next(params.dataObject);
	}
};

org.reseval.processor.ServiceCall.prototype.triggerEvent = function(event, params, next) {
	var data = this.data[event] || this.data[event+'Output'] || this.data[event.replace('Output', '')] || {};
	params = {
			controlData: {cacheKey: data.cacheKey},
			dataObject: data.overwriteResult ? data.dataObject : params
	};
	this.output.innerHTML = JSON.stringify(params);
	next(params);
};


org.reseval.processor.ServiceCall.prototype.makeRequest = function(name, url, getParams, postParams, next) {
	var config = this.config[name];
	getParams = getParams || {};
	
	if(config && config.url) {
		this.data[name] = {};
		if(config.useKeyFrom) {
			this.data[name].cacheKey = this.data[config.useKeyFrom].cacheKey;
		}
		else {
			this.data[name].cacheKey =  mide.core.Session.getInstance().getId() + this.component.getId() + this.n;
		}
		
		url = config.url;
		getParams.key = this.data[name].cacheKey;
		getParams.data = 'yes';
		getParams.fetch = 10;
	}
	next(name, url, getParams, postParams);
};

org.reseval.processor.ServiceCall.prototype.makeResponse = function(name, response) {
		this.output.innerHTML = response;
		response = JSON.parse(response);
		if(response.cacheKey) {
			this.data[name].cacheKey = response.cacheKey;
		}
		this.data[name].dataObject = response.dataObject;
		
		return JSON.stringify(response.dataObject);
};

org.reseval.processor.ServiceCall.prototype.getContentNode = function() {
	return this.output;
};
