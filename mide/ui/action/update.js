goog.provide('mashupIDE.ui.action.Update');
goog.require('mashupIDE.ui.action.BaseAction');
goog.require('mashupIDE.ui.action.ActionFactory');

/**
 * @param {mashupIDE.OptionMap} options
 * @constructor
 */
mashupIDE.ui.action.Update = function(options) {
	mashupIDE.ui.action.BaseAction.call(this, options);
};

goog.inherits(mashupIDE.ui.action.Update, mashupIDE.ui.action.BaseAction);

/**
 * @override
 */
mashupIDE.ui.action.Update.prototype.perform = function() {
	var target = this.options_.get('target'),
		fields = this.configDialog_.getFields();
	if(target in fields) {
		fields[target].update();
	}
};

mashupIDE.ui.action.ActionFactory.register('update', mashupIDE.ui.action.Update);