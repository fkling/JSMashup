goog.provide('mide.ui.action.Update');
goog.require('mide.ui.action.BaseAction');
goog.require('mide.ui.action.ActionFactory');

/**
 * @param {mide.OptionMap} options
 * @constructor
 */
mide.ui.action.Update = function(options) {
	mide.ui.action.BaseAction.call(this, options);
};

goog.inherits(mide.ui.action.Update, mide.ui.action.BaseAction);

/**
 * @override
 */
mide.ui.action.Update.prototype.perform = function() {
	var target = this.options_.get('target'),
		fields = this.configDialog_.getFields();
	if(target in fields) {
		fields[target].update();
	}
};

mide.ui.action.ActionFactory.register('update', mide.ui.action.Update);