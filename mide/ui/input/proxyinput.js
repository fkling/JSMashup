goog.provide('mide.ui.input.ProxyInput');

goog.require('mide.ui.input.BaseInput');
goog.require('mide.ui.input.TextInput');

goog.require('goog.object');

/**
 * If <code>opt_ref</code> is provided, tries to 
 * load the definition for <code>name</code> from this
 * location and will act like this one.
 * <br>
 * If no URL is provided or if the content cannot be loaded
 * it will just be a mide.ui.input.TextInput.
 * 
 * @param {string} fqn Fully qualified name of the element
 * @param {string} ref URL to get the implementation from in case
 *     in does not exist
 * @param {string} name @see mide.ui.input.BaseInput
 * @param {string} label @see mide.ui.input.BaseInput
 * @param {mide.util.OptionMap} opt_options @see mide.ui.input.BaseInput
 * 
 * @extends mide.ui.input.TextInput
 * @constructor
 */
mide.ui.input.ProxyInput = function(fqn, ref, name, label, opt_options) {
	 goog.base(this, name, label, opt_options);
	 this.realUIElement_ = new mide.ui.input.TextInput(this, name, label, opt_options);
	 
	 this.lid_ = goog.events.listen(this.realUIElement_, goog.object.getKeys(mide.ui.input.BaseInput.Events), function() {
	     this.raiseEvent.apply(this, arguments);
     }, null, this);
	 
	 this.fqn_ = fqn;
	 this.ref_ = ref;
}

goog.inherits(mide.ui.input.ProxyInput, mide.ui.input.TextInput);
mide.ui.input.TextInput.Events = mide.ui.input.BaseInput.Events;

/**
 * @type boolean
 * @private
 */
mide.ui.input.ProxyInput.prototype.loaded_ = false;

/**
 * @type boolean
 * @private
 */
mide.ui.input.ProxyInput.prototype.loading_ = false;

/**
 * @type number
 * @private
 */
mide.ui.input.ProxyInput.prototype.lid_ = '';



/**
 * @type string
 * @private
 */
mide.ui.input.ProxyInput.prototype.fqn_ = '';

/**
 * @type string
 * @private
 */
mide.ui.input.ProxyInput.prototype.ref_ = '';



/**
 * Holds a reference to the real implementation.
 * 
 * @type mide.ui.input.BaseInput
 * @private
 */
mide.ui.input.ProxyInput.prototype.realUIElement_ = null;

/**
 * The module manager.
 * 
 * @type mide.module.ModuleManager
 * @private
 */
mide.ui.input.ProxyInput.prototype.manager = null;

/**
 * Holds a reference to the last set value.
 * 
 * @type {string|Object}
 * @private
 */
mide.ui.input.ProxyInput.prototype.lastValue_ = null;


/**
 * Holds a reference to the real implementation.
 * 
 * @private
 */
mide.ui.input.ProxyInput.prototype.replaceUIElement_ = function() {
	var oldElement = this.realUIElement_,
     	newElement = goog.getObjectByName(this.fqn_);
	
	goog.events.unlistenByKey(this.lid_);
	this.realUIElement_ = new newElement(this.name, this.label, this.options);
	
	goog.events.listen(this.realUIElement_, goog.object.getKeys(mide.ui.input.BaseInput.Events), function() {
		 this.raiseEvent.apply(this, arguments);
	 }, null, this);
	
	if(oldElement.inputElement_) {
		goog.dom.replaceNode(this.realUIElement_.renderInternal_(), oldElement.inputElement_);
	}
	
	if(this.lastValue_) {
		this.realUIElement_.setValue(this.lastValue_);
	}
	this.loaded_ = true;
	this.loading_ = false;
};

/**
 * @param {mide.module.ModuleManager} manager
 * @public
 */
mide.ui.input.ProxyInput.prototype.setManager = function(manager) {
	this.manager_ = manager;
	if(!this.loaded && !this.loading_ && this.ref_) {
		 this.loading_ = true;
	     this.manager_.load(this.fqn_, this.ref_, goog.bind(this.replaceUIElement_, this));
	}
};


/**
 * @return mide.module.ModuleManager
 * 
 * @public
 */
mide.ui.input.ProxyInput.prototype.getManager = function() {
	return this.manager;
};


/**
 * @override
 */
mide.ui.input.ProxyInput.prototype.getValue = function() {
	return realUIElement_.getValue();
};


/**
 * @override
 */
mide.ui.input.ProxyInput.prototype.setValue = function(value) {
	this.lastValue_ = value;
	this.realUIElement_.setValue(value);
};

/**
 * @override
 */
mide.ui.input.ProxyInput.prototype.update = function() {
	this.realUIElement_.update();
};

/**
 * @override
 */
mide.ui.input.ProxyInput.prototype.renderInternal_ = function() {
	this.inputElement_ = this.realUIElement_.renderInternal_();
	return this.inputElement_;
};