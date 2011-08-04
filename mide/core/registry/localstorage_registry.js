goog.provide('mashupIDE.registry.LocalstorageRegistry');
goog.require('mashupIDE.registry.BaseRegistry');
goog.require('mashupIDE.Component');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.array');

/**
 * A registry implementation using localstorage
 * 
 * @constructor
 */
mashupIDE.registry.LocalstorageRegistry = function() {
	/**
	 * @type {string}
	 * @private
	 */
	this.componentsKey_ = 'mashupIDE.components';
	
	/**
	 * @type {string}
	 * @private
	 */
	this.lastIdKey_ = 'mashupIDE.lastId';
	
	/**
	 * @type {string}
	 * @private
	 */
	this.localstorage_ = new goog.storage.mechanism.HTML5LocalStorage();
	
	
	/**
	 * @type {Object}
	 * @private
	 */
	this.componentsMap_ = {};
	
	/**
	 * @type {Array}
	 * @private
	 */
	this.componentsArray_ = [];
	
	// initialize internal data structures
	this.componentsRaw_ = JSON.parse(this.localstorage_.get(this.componentsKey_)) || [];
    var c_;
	for(var i = 0, l = this.componentsRaw_.length; i < l; i++) {
		c_ = new mashupIDE.Component(this.componentsRaw_[i].xml, this.componentsRaw_[i].id);
		this.componentsArray_.push(c_);
		this.componentsMap_[this.componentsRaw_[i].id] = c_;
	}
	
	/**
	 * @type {number}
	 * @private
	 */
	this.lastId_ = +this.localstorage_.get(this.lastIdKey_) || 1;
};

/**
 * Get all components
 * 
 * @param {function(Array.<mashupIDE.Component>)} callback
 * @public
 */
mashupIDE.registry.LocalstorageRegistry.prototype.getComponents = function(callback) {
	callback(this.componentsArray_);
};

/**
 * Get component
 * 
 * @param {function(Array.<mashupIDE.Component>)} callback
 * @public
 */
mashupIDE.registry.LocalstorageRegistry.prototype.getComponent = function(id, callback) {
	callback(this.componentsMap_[id]);
};


/**
 * Save component
 * 
 * @param {mashupIDE.Component} component
 * @param {function(mashupIDE.Component)} callback called when saved complete
 * @public
 */
mashupIDE.registry.LocalstorageRegistry.prototype.saveComponent = function(component, callback) {
	var id, xml;
	if(!component.id) { // save new instance
		id = this.getNextId_();
		component.id = id;
		this.componentsArray_.push(component);
		this.componentsMap_[id] = component;
		this.componentsRaw_.push({id: component.id, xml: component.xml});
	}
	else {
		var c_ = goog.array.find(this.componentsRaw_, function(v) {
			return v.id == component.id;
		});
		c_.xml = component.xml;
	}
	this.localstorage_.set(this.componentsKey_, JSON.stringify(this.componentsRaw_));
	callback(component);
};

/**
 * @return {number} ID for a new component
 * @private
 */
mashupIDE.registry.LocalstorageRegistry.prototype.getNextId_ = function() {
	var newId = ++this.lastId_;
	this.localstorage_.set(this.lastIdKey_, newId);
	return newId;
};