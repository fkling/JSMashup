goog.provide('mide.core.registry.ServerRegistry');
goog.require('mide.core.registry.BaseRegistry');
goog.require('mide.core.ComponentDescriptor');
goog.require('mide.core.net');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.json');
goog.require('goog.uri.utils');

/**
 * A registry implementation using a server
 * 
 * @constructor
 * @implements {mide.core.registry.BaseRegistry}
 */
mide.core.registry.ServerRegistry = function(options) {
	mide.core.registry.BaseRegistry.call(this, options);
	
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
	 * @type {boolean}
	 * @private
	 */
	this.compositionsLoaded = false;
	
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this.componentsLoaded = false;
	
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

goog.inherits(mide.core.registry.ServerRegistry, mide.core.registry.BaseRegistry);


/**
 * @overwrite
 */
mide.core.registry.ServerRegistry.prototype.getComponents = function(success, error) {
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
mide.core.registry.ServerRegistry.prototype.getUserComponents = function(success, error) {
	var self = this;
	if(this.options.user_id == null) { // or undefined
		throw new Error("[mide.core.registry.ServerRegistry] No user id was set");
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
mide.core.registry.ServerRegistry.prototype.getComponentDescriptorById = function(id, success, error) {
	var self = this;
	if(this.componentDescriptors_[id]) {
		success(this.componentDescriptors_[id]);
	}
	else {
		mide.core.net.getXhr(function(xhr){			
			goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
				var xhr = evt.target;

				switch(xhr.getStatus()) {
				case 200:
					var data = xhr.getResponseJson();
					var descr = self.getDescriptor_(id, data.model, data.implementation, data.data);
					self.componentDescriptors_[id] = descr;
					success(descr);
					break;
				case 403:
				case 404:
					error(xhr.getResponseText());
				}
			  });			
			xhr.send(self.components_url + id, 'GET');
		});
	}
};

/**
 * @overwrite
 */
mide.core.registry.ServerRegistry.prototype.getComponentDescriptorByUrl = function(url, success, error) {
	
};

/**
 * @overwrite
 */
mide.core.registry.ServerRegistry.prototype.saveComponent = function(id, model, implementation, data, success, error) {
	var self = this,
		descr = this.getDescriptor_(id, model, implementation, data),
		id = descr.getId();
	 
	if(id) {
		mide.core.net.makeRequest({
			url:  self.components_url + id,
			method: 'PUT',
			data: {
				id: descr.getId(),
				model: descr.getModel(),
				implementation: descr.getImplementation(),
				data: JSON.stringify(descr.getData())
			},
			success: function() {
					self.componentDescriptors_[id] = descr;
					self.componentsArray_ = [];
					self.userComponentsArray_ = [];
				success(descr);
			},
			error: error
		});
	}
};

/**
 * @overwrite
 */
mide.core.registry.ServerRegistry.prototype.deleteComponent = function(id, success, error) {
	var self = this;
	 
	if(id) {
		mide.core.net.makeRequest({
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
mide.core.registry.ServerRegistry.prototype.loadComponents_ = function(url, target, success, error) {
	var self = this;
	
	mide.core.net.makeRequest({
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


mide.core.registry.ServerRegistry.prototype.getCompositions = function(success, error) {
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


mide.core.registry.ServerRegistry.prototype.getUserCompositions = function(success, error) {
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

mide.core.registry.ServerRegistry.prototype.getComposition = function(id, success, error) {
	var self = this;
	if(self.compositions[id]) {
		this.options.composition_mapper.getComposition(id, self.compositions[id].model, self.compositions[id].data, function(composition) {
			success(composition);
		});
		return;
	}
	mide.core.net.makeRequest({
		url: this.compositions_url + id,
		method: 'GET',
		success: function(text, e) {
			var c = e.target.getResponseJson();
			self.options.composition_mapper.getComposition(id, c.model, c.data, function(composition) {
				self.compositions[id] = c;
				success(composition);
			});
		},
		error: error
	});
};


mide.core.registry.ServerRegistry.prototype.createComposition = function(model, data, success, error) {
    var self = this;
	mide.core.net.makeRequest({
		url: this.compositions_url,
		method: 'POST',
		data: {model: model, data: goog.json.serialize(data)},
		complete: function(id, e) {
			if(e.target.getStatus() === 201) {
				self.options.composition_mapper.getComposition(id, model, data, function(composition) {
					self.compositions[id] = {id: id, model: model, data: data};
					self.userCompositionsArray_ = [];
					self.compositionsArray_ = [];
					success(id);
				});
			}
			else {
				error: error
			}
			
		}
	});
};


mide.core.registry.ServerRegistry.prototype.saveComposition = function(id, model, data, success, error) {
	var self = this;
	mide.core.net.makeRequest({
		url: this.compositions_url + id,
		method: 'PUT',
		data: {model: model, data: goog.json.serialize(data)},
		success: function(text, e) {
			self.options.composition_mapper.getComposition(id, model, data, function(composition) {
				self.compositions[id] = {id: id, model: model, data: data};
				self.userCompositionsArray_ = [];
				self.compositionsArray_ = [];
				success(id);
			});
		},
		error: error
	});
};


mide.core.registry.ServerRegistry.prototype.deleteComposition = function(id, success, error) {
	var self = this;
	mide.core.net.makeRequest({
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
mide.core.registry.ServerRegistry.prototype.loadCompositions_ = function(url, target, success, error) {
	var self = this;
	
	mide.core.net.makeRequest({
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