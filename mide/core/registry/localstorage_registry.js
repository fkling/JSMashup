goog.provide('mide.registry.LocalstorageRegistry');
goog.require('mide.registry.BaseRegistry');
goog.require('mide.Component');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.array');

/**
 * A registry implementation using localstorage
 * 
 * @constructor
 */
mide.registry.LocalstorageRegistry = function() {
	/**
	 * @type {string}
	 * @private
	 */
	this.componentsKey_ = 'mide.components';
	
	/**
	 * @type {string}
	 * @private
	 */
	this.lastIdKey_ = 'mide.lastId';
	
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
		c_ = new mide.Component(this.componentsRaw_[i].xml, this.componentsRaw_[i].id);
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
 * @param {function(Array.<mide.Component>)} callback
 * @public
 */
mide.registry.LocalstorageRegistry.prototype.getComponents = function(callback) {
	callback(this.componentsArray_);
};

/**
 * Get component
 * 
 * @param {function(Array.<mide.Component>)} callback
 * @public
 */
mide.registry.LocalstorageRegistry.prototype.getComponent = function(id, callback) {
	callback(this.componentsMap_[id]);
};


/**
 * Save component
 * 
 * @param {mide.Component} component
 * @param {function(mide.Component)} callback called when saved complete
 * @public
 */
mide.registry.LocalstorageRegistry.prototype.saveComponent = function(component, callback) {
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
mide.registry.LocalstorageRegistry.prototype.getNextId_ = function() {
	var newId = ++this.lastId_;
	this.localstorage_.set(this.lastIdKey_, newId);
	return newId;
};