goog.provide('mide.ui.input.BaseInput');
goog.require('goog.ui.Component');

/**
 * @param {mide.OptionMap}
 *            options
 * @param opt_domHelper
 * @constructor
 */
mide.ui.input.BaseInput = function(options, events, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);

	this.options = options;
	this.events = events;
	this.eh = new goog.events.EventHandler(this);
};

goog.inherits(mide.ui.input.BaseInput, goog.ui.Component);

/**
 * @type {Element}
 * @protected
 */
mide.ui.input.BaseInput.prototype.label = null;

/**
 * @type {Element}
 * @protected
 */
mide.ui.input.BaseInput.prototype.input = null;

/**
 * @type {Array}
 * @protected
 */
mide.ui.input.BaseInput.prototype.options = null;

/**
 * @type {Array}
 * @private
 */
mide.ui.input.BaseInput.prototype.events = null;

/**
 * @type {goog.events.EventHandler}
 * @protected
 */
mide.ui.input.BaseInput.prototype.eh = null;

/**
 * @override
 */
mide.ui.input.BaseInput.prototype.createDom = function() {
	var elem = this.element_ = this.dom_.createElement('div');
	
	this.label = this.dom_.createDom('label', 
			{'for': this.options.get('name')}, 
			this.dom_.createTextNode(this.options.get('label'))
	);
	this.createInputNode();
	this.dom_.append(elem, this.label, this.input);

};

/**
 * @override
 */
mide.ui.input.BaseInput.prototype.enterDocument = function() {
	mide.ui.input.BaseInput.superClass_.enterDocument.call(this);
	for ( var i = 0, l = this.events.length; i < l; i++) {
		this.attachEventHandler(this.events[i]);
	}
};

/**
 * @param {Array} events
 * @private
 */
mide.ui.input.BaseInput.prototype.attachEventHandler = function(event) {
	this.eh.listen(this, goog.events.EventType[event.type], function(event) {
		var act, action;
		for (var j = 0, k = event.action.length; j < k; j++) {
			act = event.action[j];
			action = mide.ui.action.ActionFactory.get(act.name, new mide.util.OptionMap(act.option));
			action.setConfigurationDialog(this.getParent());
			action.perform();
			this.dispatchEvent({type: event.type});
		}
	}, false, this);
};



/**
 * Must be implemented by the child class and must assign a DOM
 * element to this.input.
 * 
 * @protected
 */
mide.ui.input.BaseInput.prototype.createInputNode = function() {

};

/**
 * Called when an input element should update its display or values. Does
 * nothing by default.
 * 
 * @protected
 */
mide.ui.input.BaseInput.prototype.update = function() {
};

/**
 * Called to get the current value of the UI component.
 * 
 * @protected
 */
mide.ui.input.BaseInput.prototype.getValue = function() {
};

/**
 * Called to set the current value of the UI component.
 * 
 * @protected
 */
mide.ui.input.BaseInput.prototype.setValue = function() {
};