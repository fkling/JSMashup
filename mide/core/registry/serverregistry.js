goog.provide('mashupIDE.core.registry.ServerRegistry');
goog.require('mashupIDE.core.registry.BaseRegistry');
goog.require('mashupIDE.core.ComponentDescriptor');
goog.require('mashupIDE.core.net');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.uri.utils');

/**
 * A registry implementation using localstorage
 * 
 * @constructor
 * @implements {mashupIDE.core.registry.BaseRegistry}
 */
mashupIDE.core.registry.ServerRegistry = function(options) {
	mashupIDE.core.registry.BaseRegistry.call(this, options);
	
	this.base_url = '';
	
	/**
	 * @type {Object}
	 * @private
	 */
	this.componentDescriptors_ = {};
	
	/**
	 * @type {Array}
	 * @private
	 */
	this.componentsArray_ = [];
	
	/**
	 * @type {Array}
	 * @private
	 */
	this.userComponentsArray_ = [];
};

goog.inherits(mashupIDE.core.registry.ServerRegistry, mashupIDE.core.registry.BaseRegistry);


/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.load = function(options, success, error) {
	goog.object.extend(this.options, options || {});
	
	var self = this;
	
	this.base_url = this.options.base_url || '';
	this.components_url = this.base_url + '/components';
	
	if(this.options.user_id) {
		this.userComponents_url = [this.base_url, this.options.user_id, 'components'].join('/');
	}
	
	if(this.options.config_url) {
		mashupIDE.core.net.makeRequest({
			url: this.options.config_url,
			success: function(event) {
				self.configure(event.target.getResponseText());
				success(self);
			},
			error: function(event) {
				error("Registry could not load successfully:" + event.target.getLastError());
			}
		});
	}
	else {
		success(this);
	}
};

/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.configure = function(config, success, error) {
	//TODO: Implement configuration file parsing
};


/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.getComponents = function(success, error) {
	var self = this;
	if(this.componentsArray_.length == 0) {
		this.loadComponents_(this.components_url, this.componentsArray_, function(){
			success(self.componentsArray_.slice());
		}, function(){
			if(error) error("Components couldn't be loaded.")
		});
	}
	else {
		success(this.componentsArray_.slice());
	}
};

/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.getUserComponents = function(success, error) {
	var self = this;
	if(this.options.user_id == null) { // or undefined
		throw new Error("[mashupIDE.core.registry.ServerRegistry] No user id was set");
	}
	if(this.userComponentsArray_.length == 0) {
		this.loadComponents_(this.userComponents_url, this.userComponentsArray_, function(){
			success(self.userComponentsArray_.slice());
		}, function() {
			if(error) error("User components couldn't be loaded.");
		});
	}
	else {
		success(this.userComponentsArray_.slice());
	}
};

/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.getComponentDescriptorById = function(id, success, error) {
	var self = this;
	if(this.componentDescriptors_[id]) {
		success(this.componentDescriptors_[id]);
	}
	else {
		mashupIDE.core.net.getXhr(function(xhr){			
			goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
				var xhr = evt.target;

				switch(xhr.getStatus()) {
				case 200:
					var comp = xhr.getResponseJson();
					var descr = new mashupIDE.core.ComponentDescriptor();
					descr.setId(id);
					descr.setXml(comp.model);
					descr.setJs(comp.impl);

					self.componentDescriptors_[id] = descr;
					success(descr);
					break;
				case 403:
				case 404:
					error(xhr.getResponseText());
				}
			  });			
			xhr.send(self.components_url + '/' + id, 'GET');
		});
	}
};

/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};

/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.saveComponent = function(descriptor, success, error) {
	var url, 
		id = descriptor.getId(),
		self = this;
	 
	if(id) {
		url =  self.components_url + '/' + id
		mashupIDE.core.net.getXhr(function(xhr){
			goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
				var xhr = evt.target;

				switch(xhr.getStatus()) {
				case 204:
				case 209:
					if(!(id in self.componentDescriptors_)) {
						self.componentDescriptors_[id] = descriptor;
						self.componentsArray_.push(descriptor);
					}
					success(descriptor);
					break;
				case 409:
					error(xhr.getResponseText());
				}
			});
			xhr.send(url, 'PUT', goog.uri.utils.buildQueryDataFromMap({
				model: descriptor.getXml() || '', 
				impl: descriptor.getJs() || ''}));
		});
	}
};

/**
 * @overwrite
 */
mashupIDE.core.registry.ServerRegistry.prototype.deleteComponent = function(descriptor, success, error) {
	var url, 
		id = descriptor.getId(),
		self = this;
	 
	if(id && self.componentDescriptors_[id]) {
		url =  this.base_url + descriptor.getId();
		mashupIDE.core.net.getXhr(function(xhr){
			goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
				var xhr = evt.target;

				switch(xhr.getStatus()) {
				case 204:
					delete self.componentDescriptors_[id];
					self.componentsArray_.splice(self.componentsArray_.indexOf(descriptor), 1);
					success('Component with id ' + id + ' was delted successfully');
					break;
				case 403:
					error(xhr.getResponseText());
				}
			});
			xhr.send(url, 'DELETE');
		});
	}
};

/**
 * @private
 */
mashupIDE.core.registry.ServerRegistry.prototype.loadComponents_ = function(url, target, success, error) {
	var self = this;
	
	mashupIDE.core.net.makeRequest({
		url: url,
		success: function(e) {
			var components = e.target.getResponseJson();
			goog.array.sortObjectsByKey(components, 'name');
			goog.array.extend(target, components);
			success();
		},
		error: error
	});
};

mashupIDE.core.registry.ServerRegistry.getInstance = function() {
	if(!mashupIDE.core.registry.ServerRegistry.instance) {
		mashupIDE.core.registry.ServerRegistry.instance = new mashupIDE.core.registry.ServerRegistry();
	}
	return mashupIDE.core.registry.ServerRegistry.instance;
};