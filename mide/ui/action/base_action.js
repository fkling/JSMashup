goog.provide('mashupIDE.ui.action.BaseAction');


/**
 * @param {mashupIDE.OptionMap} options
 * @constructor
 */
mashupIDE.ui.action.BaseAction = function(options) {
	this.options_ = options;
};

/**
 * Has to be implemented by child classes.
 * 
 * @protected
 */
mashupIDE.ui.action.BaseAction.prototype.perform = function() {};

/**
 * @param {Comonent} component
 * 
 * @public
 */
mashupIDE.ui.action.BaseAction.prototype.setConfigurationDialog = function(configDialog) {
	this.configDialog_ = configDialog;
};