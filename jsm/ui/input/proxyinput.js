goog.provide('jsm.ui.input.ProxyInput');

goog.require('jsm.ui.input.BaseInput');
goog.require('jsm.ui.input.TextInput');

goog.require('goog.object');

/**
 * If <code>opt_ref</code> is provided, tries to 
 * load the definition for <code>name</code> from this
 * location and will act like this one.
 * <br>
 * If no URL is provided or if the content cannot be loaded
 * it will just be a jsm.ui.input.TextInput.
 * 
 * @param {string} fqn Fully qualified name of the element
 * @param {string} ref URL to get the implementation from in case
 *     in does not exist
 * @param {string} name @see jsm.ui.input.BaseInput
 * @param {string} label @see jsm.ui.input.BaseInput
 * @param {jsm.util.OptionMap} opt_options @see jsm.ui.input.BaseInput
 * 
 * @extends jsm.ui.input.TextInput
 * @constructor
 */
jsm.ui.input.ProxyInput = function(fqn, ref, name, label, opt_options) {
	 goog.base(this, name, label, opt_options);
	 this.realUIElement_ = new jsm.ui.input.TextInput(this, name, label, opt_options);
	 
	 this.lid_ = goog.events.listen(this.realUIElement_, goog.object.getKeys(jsm.ui.input.BaseInput.Events), function() {
	     this.raiseEvent.apply(this, arguments);
     }, null, this);
	 
	 this.fqn_ = fqn;
	 this.ref_ = ref;
}

goog.inherits(jsm.ui.input.ProxyInput, jsm.ui.input.TextInput);
jsm.ui.input.TextInput.Events = jsm.ui.input.BaseInput.Events;

/**
 * @type boolean
 * @private
 */
jsm.ui.input.ProxyInput.prototype.loaded_ = false;

/**
 * @type boolean
 * @private
 */
jsm.ui.input.ProxyInput.prototype.loading_ = false;

/**
 * @type number
 * @private
 */
jsm.ui.input.ProxyInput.prototype.lid_ = '';



/**
 * @type string
 * @private
 */
jsm.ui.input.ProxyInput.prototype.fqn_ = '';

/**
 * @type string
 * @private
 */
jsm.ui.input.ProxyInput.prototype.ref_ = '';



/**
 * Holds a reference to the real implementation.
 * 
 * @type jsm.ui.input.BaseInput
 * @private
 */
jsm.ui.input.ProxyInput.prototype.realUIElement_ = null;

/**
 * The module manager.
 * 
 * @type jsm.module.ModuleManager
 * @private
 */
jsm.ui.input.ProxyInput.prototype.manager = null;

/**
 * Holds a reference to the last set value.
 * 
 * @type {string|Object}
 * @private
 */
jsm.ui.input.ProxyInput.prototype.lastValue_ = null;


/**
 * Holds a reference to the real implementation.
 * 
 * @private
 */
jsm.ui.input.ProxyInput.prototype.replaceUIElement_ = function() {
	var oldElement = this.realUIElement_,
     	newElement = goog.getObjectByName(this.fqn_);
	
	goog.events.unlistenByKey(this.lid_);
	this.realUIElement_ = new newElement(this.name, this.label, this.options);
	
	goog.events.listen(this.realUIElement_, goog.object.getKeys(jsm.ui.input.BaseInput.Events), function() {
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
 * @param {jsm.module.ModuleManager} manager
 * @public
 */
jsm.ui.input.ProxyInput.prototype.setManager = function(manager) {
	this.manager_ = manager;
	if(!this.loaded && !this.loading_ && this.ref_) {
		 this.loading_ = true;
	     this.manager_.load(this.fqn_, this.ref_, goog.bind(this.replaceUIElement_, this));
	}
};


/**
 * @return jsm.module.ModuleManager
 * 
 * @public
 */
jsm.ui.input.ProxyInput.prototype.getManager = function() {
	return this.manager;
};


/**
 * @override
 */
jsm.ui.input.ProxyInput.prototype.getValue = function() {
	return realUIElement_.getValue();
};


/**
 * @override
 */
jsm.ui.input.ProxyInput.prototype.setValue = function(value) {
	this.lastValue_ = value;
	this.realUIElement_.setValue(value);
};

/**
 * @override
 */
jsm.ui.input.ProxyInput.prototype.update = function() {
	this.realUIElement_.update();
};

/**
 * @override
 */
jsm.ui.input.ProxyInput.prototype.renderInternal_ = function() {
	this.inputElement_ = this.realUIElement_.renderInternal_();
	return this.inputElement_;
};
