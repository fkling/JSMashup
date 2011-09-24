goog.provide('jsm.core.Session');
goog.provide('jsm.config.session');

goog.require('goog.ui.IdGenerator');
goog.require('goog.object');
goog.require('goog.net.Cookies');

/**
 * @constructor
 * @private
 */
jsm.core.Session = function() {
	this.id_generator = goog.ui.IdGenerator.getInstance();
	this.session_id = this.getSessionId();
};


/**
 * @public
 */
jsm.core.Session.start = function() {
	if(!jsm.core.Session.instance) {
		jsm.core.Session.instance = new jsm.core.Session();
	}
	return jsm.core.Session.instance;
};

/**
 * @public
 */
jsm.core.Session.getInstance = function(cb) {
	return jsm.core.Session.instance;
};

/**
 * @private
 */
jsm.core.Session.instance = null;

/**
 * @private
 */
jsm.core.Session.prototype.session_id = null;


/**
 * @private
 */
jsm.core.Session.prototype.id_generator = null;

/**
 * @return {string}
 * 
 * @public
 */
jsm.core.Session.prototype.getId = function() {
	return this.session_id;
};


/**
 * @return {string}
 * 
 * @protected
 */
jsm.core.Session.prototype.getSessionId = function() {
	var cm = new goog.net.Cookies(document),
		name = "MIDE_SESSION_ID";
	if(cm.containsKey(name)) {
		return cm.get(name);
	}
	else {
		var id = Date.now();
		cm.set(name, id, -1, '/');
		return id;
	}
};
