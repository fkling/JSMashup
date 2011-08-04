goog.provide('mide.ui.action.BaseAction');


/**
 * @param {mide.OptionMap} options
 * @constructor
 */
mide.ui.action.BaseAction = function(options) {
	this.options_ = options;
};

/**
 * Has to be implemented by child classes.
 * 
 * @protected
 */
mide.ui.action.BaseAction.prototype.perform = function() {};

/**
 * @param {Comonent} component
 * 
 * @public
 */
mide.ui.action.BaseAction.prototype.setConfigurationDialog = function(configDialog) {
	this.configDialog_ = configDialog;
};