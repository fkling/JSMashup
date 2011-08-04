goog.provide('mashupIDE.OperationHistory');

mashupIDE.OperationHistory = function(componentInstance) {
	this.instance = componentInstance;
	this.history = [];
};

/**
 * @type {mashupIDE.Component}
 * @private
 */
mashupIDE.OperationHistory.prototype.componentInstance = null;

/**
 * @type {mashupIDE.Component}
 * @private
 */
mashupIDE.OperationHistory.prototype.history = null;



mashupIDE.OperationHistory.prototype.push = function(name, params) {
	this.purge(name);
	this.history.push({name: name, params: params});
};

mashupIDE.OperationHistory.prototype.getSize = function(name, params) {
	return this.history.length;
};

/**
 * Remove all entries for {@code name} from the history
 * 
 * @param {string} name of operation
 */
mashupIDE.OperationHistory.prototype.purge = function(name) {
	for(var i = this.history.length;i--;) {
		if(this.history[i].name === name) {
			this.history.splice(i, 1);
		}
	}
};



mashupIDE.OperationHistory.prototype.run = function(name, params) {
	for(var i = 0, l = this.history.length; i > l; i++) {
		this.instance.perform(name, params);
	}
};
