goog.provide('jsm.core.registry.ServerRegistry');
goog.require('jsm.core.registry.BaseRegistry');
goog.require('jsm.core.ComponentDescriptor');
goog.require('jsm.core.net');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.json');
goog.require('goog.uri.utils');

/**
 * A registry implementation using a server
 * 
 * @constructor
 * @implements {jsm.core.registry.BaseRegistry}
 */
jsm.core.registry.ServerRegistry = function(options) {
	jsm.core.registry.BaseRegistry.call(this, options);
	
	this.base_url = options.base_url || '';
	this.user_id = options.user_id  || '';
	
	this.components_url = this.base_url + '/components/';
	this.compositions_url = this.base_url + '/compositions/';
	
	this.userComponents_url = options.userComponents_url || [this.base_url, this.user_id, 'components'].join('/');
	this.userCompositions_url = options.userCompositions_url || [this.base_url, this.user_id, 'compositions'].join('/');
	
	/**
	 * @type {Object}
	 * @private
	 */
	this.componentDescriptors_ = {};
	
	/**
	 * @type {Object}
	 * @private
	 */
	this.compositions = {};
	
	
	/**
	 * @type {Array}
	 * @private
	 */
	this.compositionsArray_ = [];
	
	/**
	 * @type {Array}
	 * @private
	 */
	this.userCompositionsArray_ = [];
	
	
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

goog.inherits(jsm.core.registry.ServerRegistry, jsm.core.registry.BaseRegistry);


/**
 * @override
 */
jsm.core.registry.ServerRegistry.prototype.getComponents = function(success, error) {
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
 * @override
 */
jsm.core.registry.ServerRegistry.prototype.getUserComponents = function(success, error) {
	var self = this;
	if(this.options.user_id == null) { // or undefined
		throw new Error("[jsm.core.registry.ServerRegistry] No user id was set");
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
 * @override
 */
jsm.core.registry.ServerRegistry.prototype.getComponentDescriptorById = function(id, success, error) {
	if(this.componentDescriptors_[id]) {
		success(this.componentDescriptors_[id]);
	}
	else {
		jsm.core.net.makeRequest({
			url:  this.components_url + id,
			responseFormat: 'json',
			context: this,
			success: function(response) {
				try {
					var descr = this.options.component_mapper.getDescriptor(id, response.model, response.metaData);
					this.componentDescriptors_[id] = descr;
					success(descr);
				}
				catch(e) {
					error(e);
				}
				
			},
			error: error
		});
	}
};

/**
 * @override
 */
jsm.core.registry.ServerRegistry.prototype.saveComponent = function(descriptor, metaData, success, error) {
	jsm.core.net.makeRequest({
		url:  this.components_url + descriptor.getId(),
		method: 'PUT',
		dataType: 'application/json',
		data: JSON.stringify({
			id: descriptor.getId(),
			model: this.options.component_mapper.serialize(descriptor),
			metaData: metaData
		}),
		context: this,
		success: function() {
			this.componentDescriptors_[descriptor.getId()] = descriptor;
			this.componentsArray_ = [];
			this.userComponentsArray_ = [];
			success(descriptor);
		},
		error: error
	});
};

/**
 * @override
 */
jsm.core.registry.ServerRegistry.prototype.deleteComponent = function(id, success, error) {
	var self = this;
	 
	if(id) {
		jsm.core.net.makeRequest({
			url: self.components_url + id,
			method: 'DELETE',
			success: function() {
				delete self.componentDescriptors_[id];
				self.componentsArray_ = [];
				self.userComponentsArray_ = [];
				success('Component with id ' + id + ' was delted successfully');
			},
			error: error
		});
	}
};

/**
 * @private
 */
jsm.core.registry.ServerRegistry.prototype.loadComponents_ = function(url, target, success, error) {
	var self = this;
	
	jsm.core.net.makeRequest({
		url: url,
		success: function(txt, e) {
			var components = e.target.getResponseJson();
			goog.array.sortObjectsByKey(components, 'name');
			goog.array.extend(target, components);
			success();
		},
		error: error
	});
};


jsm.core.registry.ServerRegistry.prototype.getCompositions = function(success, error) {
	var self = this;
	if(this.compositionsArray_.length == 0) {
		this.loadCompositions_(this.compositions_url, this.compositionsArray_, function(){
			success(self.compositionsArray_.slice());
		}, function(){
			if(error) error("Components couldn't be loaded.")
		});
	}
	else {
		success(this.compositionsArray_.slice());
	}
};


jsm.core.registry.ServerRegistry.prototype.getUserCompositions = function(success, error) {
	var self = this;
	if(this.userCompositionsArray_.length == 0) {
		this.loadCompositions_(this.userCompositions_url, this.userCompositionsArray_, function(){
			success(self.userCompositionsArray_.slice());
		}, function(){
			if(error) error("Components couldn't be loaded.")
		});
	}
	else {
		success(this.userCompositionsArray_.slice());
	}
};

jsm.core.registry.ServerRegistry.prototype.getComposition = function(id, success, error) {
	if(this.compositions[id]) {
		this.options.composition_mapper.getComposition(id, this.compositions[id].model, this.compositions[id].metaData, function(composition) {
			success(composition);
		});
		return;
	}
	jsm.core.net.makeRequest({
		url: this.compositions_url + id,
		method: 'GET',
		responseFormat: 'json',
		context: this,
		success: function(response) {
			var self = this;
			this.options.composition_mapper.getComposition(id, response.model, response.metaData, function(composition) {
				self.compositions[id] = {model: response.model, metaData: response.metaData};
				success(composition);
			});
		},
		error: error
	});
};


jsm.core.registry.ServerRegistry.prototype.createComposition = function(composition, data, success, error) {
	var serializedComposition = this.options.composition_mapper.serialize(composition);
	jsm.core.net.makeRequest({
		url: this.compositions_url,
		method: 'POST',
		data: goog.json.serialize({model: serializedComposition, metaData: data}),
		dataType: 'application/json',
		context: this,
		complete: function(id, e) {
			if(e.target.getStatus() === 201) {
				composition.setId(id);
				this.compositions[id] = {model: serializedComposition, metaData: data};
				this.userCompositionsArray_ = [];
				this.compositionsArray_ = [];
				success(id);
			}
			else {
				error: error
			}
			
		}
	});
};


jsm.core.registry.ServerRegistry.prototype.saveComposition = function(composition, data, success, error) {
	var serializedComposition = this.options.composition_mapper.serialize(composition),
		id = composition.getId();
	jsm.core.net.makeRequest({
		url: this.compositions_url + composition.getId(),
		method: 'PUT',
		data: goog.json.serialize({model: serializedComposition, metaData: data}),
		dataType: 'application/json',
		context: this,
		success: function(text, e) {
			this.compositions[id] = {model: serializedComposition, metaData: data};
			this.userCompositionsArray_ = [];
			this.compositionsArray_ = [];
			success(id);
		},
		error: error
	});
};


jsm.core.registry.ServerRegistry.prototype.deleteComposition = function(id, success, error) {
	var self = this;
	jsm.core.net.makeRequest({
		url: this.compositions_url + id,
		method: 'DELETE',
		success: function(text, e) {
			delete self.compositions[id];
			self.userCompositionsArray_ = [];
			self.compositionsArray_ = [];
			success('Component with id ' + id + ' was delted successfully');
		},
		error: error
	});
};

/**
 * @private
 */
jsm.core.registry.ServerRegistry.prototype.loadCompositions_ = function(url, target, success, error) {
	var self = this;
	
	jsm.core.net.makeRequest({
		url: url,
		success: function(txt, e) {
			var compositions = e.target.getResponseJson();
			goog.array.sortObjectsByKey(compositions, 'name');
			goog.array.extend(target, compositions);
			success();
		},
		error: error
	});
};
