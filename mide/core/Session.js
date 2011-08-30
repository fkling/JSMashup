goog.provide('mide.core.Session');
goog.provide('mide.config.session');

goog.require('goog.ui.IdGenerator');
goog.require('goog.object');
goog.require('goog.net.Cookies');

/**
 * @constructor
 * @private
 */
mide.core.Session = function() {
	this.id_generator = goog.ui.IdGenerator.getInstance();
	this.session_id = this.getSessionId();
};


/**
 * @public
 */
mide.core.Session.start = function() {
	if(!mide.core.Session.instance) {
		mide.core.Session.instance = new mide.core.Session();
	}
	return mide.core.Session.instance;
};

/**
 * @public
 */
mide.core.Session.getInstance = function(cb) {
	return mide.core.Session.instance;
};

/**
 * @private
 */
mide.core.Session.instance = null;

/**
 * @private
 */
mide.core.Session.prototype.session_id = null;


/**
 * @private
 */
mide.core.Session.prototype.id_generator = null;

/**
 * @return {string}
 * 
 * @public
 */
mide.core.Session.prototype.getId = function() {
	return this.session_id;
};


/**
 * @return {string}
 * 
 * @protected
 */
mide.core.Session.prototype.getSessionId = function() {
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