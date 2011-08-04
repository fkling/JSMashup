goog.provide('mide.ServiceCallConverter');
goog.require('mide.core.net');

goog.require('goog.dom');

mide.ServiceCallConverter = function(config) {
	this.config = config || {};
	this.data = {};
	this.output = goog.dom.createElement('div');
};

mide.ServiceCallConverter.prototype.setComponentInstance = function(component) {
	this.component = component;
};

mide.ServiceCallConverter.prototype.perform = function(operation, params, next) {
	var self = this,
		config = this.config[operation];
	this.data[operation] = {};
	
	var controlData = params.controlData;
	if(controlData && controlData.cacheKey) {
		this.data[operation].cacheKey = controlData.cacheKey;
	}
	else {
		this.data[operation].cacheKey = mide.Session.getInstance().getId() + this.component.getId();
	}
	
	if(config && config.url) {
		mide.core.net.makeRequest(config.url, {key: this.data[operation].cacheKey, data: 'yes', fetch: 10}, null, function(response) {
			self.output.innerHTML = JSON.stringify(response);
			self.data[operation].cacheKey = response.cacheKey;
			self.data[operation].dataObject = response.dataObject;
			if(config.passthrough) {
				next(response.dataObject);
			}
		});
	}
	else {
		next(params.dataObject);
	}
};

mide.ServiceCallConverter.prototype.triggerEvent = function(event, params, next) {
	var data = this.data[event] || this.data[event+'Output'] || this.data[event.replace('Output', '')] || {};
	params = {
			controlData: {cacheKey: data.cacheKey},
			dataObject: data.overwriteResult ? data.dataObject : params
	};
	this.output.innerHTML = JSON.stringify(params);
	next(params);
};


mide.ServiceCallConverter.prototype.makeRequest = function(name, url, getParams, postParams, next) {
	var config = this.config[name];
	
	
	if(config && config.url) {
		this.data[name] = {};
		this.data[name].cacheKey =  mide.Session.getInstance().getId() + this.component.getId();
		
		url = config.url;
		getParams.key = this.data[name].cacheKey;
		getParams.data = 'yes';
		getParams.fetch = 10;		
	}
	next(name, url, getParams, postParams);
};

mide.ServiceCallConverter.prototype.makeResponse = function(name, response) {
		this.output.innerHTML = JSON.stringify(response);
		this.data[name].cacheKey = response.cacheKey;
		this.data[name].dataObject = response.dataObject;
		
		return response.dataObject;
};

mide.ServiceCallConverter.prototype.getContentNode = function() {
	return this.output;
};
