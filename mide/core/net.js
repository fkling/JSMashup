goog.provide('mashupIDE.core.net');
goog.provide('mashupIDE.config.net');

goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrIoPool');
goog.require('goog.uri.utils');
goog.require('goog.events');
goog.require('goog.object');

/**
 * Default configuration.
 * @type {Object}
 */
mashupIDE.config.net = {
	PROXY_URL: ''
};

mashupIDE.core.net.PROXY_URL = 'http://localhost:8080/proxy';

mashupIDE.core.net.get = function(url, callback, parameters) {
	var payload = goog.uri.utils.appendParamsFromMap(url, parameters);
	var url = goog.uri.utils.appendParamsFromMap(mashupIDE.config.net.PROXY_URL, {url: payload});
	goog.net.XhrIo.send(url, function(e) {
		console.log(this.getResponseJson());
	    callback(this.getResponseJson());
	});
};



/**
 * Makes an Ajax request using `goog.net.XhrIoPool`. The event object is passed
 * to the callback function.
 * 
 * @param {{url: string, parameters: Object, 
 *          data: (Object|string), method: string, callback: function}} options_
 */
mashupIDE.core.net.makeRequest = function(options_) {
	var options = {
			url: '',
			parameters: {},
			data: null,
			method: 'GET',
			complete: null,
			success: null,
			error: null,
			context: null
	};
	
	goog.object.extend(options, options_);
	
	if(options.url) {
		if(options.data) {
			if(goog.isObject(options.data)) {
				options.data = goog.uri.utils.buildQueryDataFromMap(options.data);
			}
			if(options.method.toUpperCase() === 'GET') {
				options.method = 'POST';
			}
		}
		
		mashupIDE.core.net.getXhr(function(xhr){
			var ek, sk;
			sk = goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){				
				if(options.success) options.success.call(options.context, e);
				goog.events.removeAll(xhr, goog.net.EventType.ERROR);
			});
			
			ek = goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
				if(options.error) options.error.call(options.context, e);
				goog.events.removeAll(xhr, goog.net.EventType.SUCCESS);
			});
						
			goog.events.listenOnce(xhr, goog.net.EventType.COMPLETE, function(e){
				if(options.complete) options.complete.call(options.context, e);
			});
			
			goog.events.listenOnce(xhr, goog.net.EventType.READY, function(e){
				mashupIDE.core.net.releaseXhr(xhr);
			});
			
			options.url = goog.uri.utils.appendParamsFromMap(options.url, options.parameters);
			xhr.send(options.url, options.method, options.data);
		});
	}
	
	//var payload = goog.uri.utils.appendParamsFromMap(url, get_data);
	//var url = goog.uri.utils.appendParamsFromMap(mashupIDE.core.net.PROXY_URL, {url: payload});
};

/**
 * @protected
 */
mashupIDE.core.net.getXhr = function(callback) {
	if(!mashupIDE.core.net.pool) {
		mashupIDE.core.net.pool = new goog.net.XhrIoPool();
	}
	mashupIDE.core.net.pool.getObject(callback);
};

/**
 * @protected
 */
mashupIDE.core.net.releaseXhr = function(xhr) {
	if(mashupIDE.core.net.pool) {
		mashupIDE.core.net.pool.releaseObject(xhr);
	}
};


/**
 * Loads the script at {@code url} and evaluates it in global scope.
 * Uses the same implementation as jQuery see 
 * {@link https://github.com/jquery/jquery/blob/master/src/ajax/script.js}
 * 
 * @param {string} url the URL to load
 * @param {function} callback
 */
mashupIDE.core.net.loadScript = function(url, callback) {
	var script = document.createElement( "script" ),
		head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

	script.async = "async";
	script.src = url;
	// Attach handlers for all browsers
	script.onload = script.onreadystatechange = function( _, isAbort ) {
		if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

			// Handle memory leak in IE
			script.onload = script.onreadystatechange = null;

			// Remove the script
			if ( head && script.parentNode ) {
				head.removeChild( script );
			}

			// Dereference the script
			script = undefined;

			// Callback if not abort
			if ( !isAbort ) {
				callback();
			}
		}
	};
	// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
	// This arises when a base node is used (#2709 and #4378).
	head.insertBefore( script, head.firstChild );
};
