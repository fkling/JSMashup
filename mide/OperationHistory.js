goog.provide('mide.OperationHistory');

mide.OperationHistory = function(componentInstance) {
	this.instance = componentInstance;
	this.history = [];
};

/**
 * @type {mide.Component}
 * @private
 */
mide.OperationHistory.prototype.componentInstance = null;

/**
 * @type {mide.Component}
 * @private
 */
mide.OperationHistory.prototype.history = null;



mide.OperationHistory.prototype.push = function(name, params) {
	this.purge(name);
	this.history.push({name: name, params: params});
};

mide.OperationHistory.prototype.getSize = function(name, params) {
	return this.history.length;
};

/**
 * Remove all entries for {@code name} from the history
 * 
 * @param {string} name of operation
 */
mide.OperationHistory.prototype.purge = function(name) {
	for(var i = this.history.length;i--;) {
		if(this.history[i].name === name) {
			this.history.splice(i, 1);
		}
	}
};



mide.OperationHistory.prototype.run = function(name, params) {
	for(var i = 0, l = this.history.length; i > l; i++) {
		this.instance.perform(name, params);
	}
};
