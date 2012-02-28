goog.provide('jsm.core.net');
goog.provide('jsm.config.net');

goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrIoPool');
goog.require('goog.uri.utils');
goog.require('goog.Uri');
goog.require('goog.events');
goog.require('goog.object');

/**
 * Default configuration.
 * @type {Object}
 */
jsm.config.net = {
	PROXY_URI: '',
	PROXY_PARAMETER: 'uri'
};

/**
 * Builds a URI that redirects to a proxy if provided to resolve
 * cross domain calls.
 *  
 * @param {string} uri The target URI
 * @param {Object} parameters A parameter map to append to the URI
 * @param {string} base A base URI (default: location.href)
 * @return {string} Resolved URI
 */
jsm.core.net.buildUri = function(uri, parameters, base) {
	base = base || location.href;
	paramters = parameters || {};
    var current_uri = goog.Uri.parse(base);
    // resolve relative urls
    var target_uri = goog.Uri.resolve(current_uri, uri);
    target_uri.setQuery(new goog.Uri.QueryData(goog.uri.utils.buildQueryDataFromMap(parameters)));
    if(!goog.uri.utils.haveSameDomain(current_uri.toString(), target_uri.toString()) && jsm.config.net.PROXY_URI) {
    	return goog.uri.utils.appendParam(jsm.config.net.PROXY_URI, jsm.config.net.PROXY_PARAMETER, target_uri.toString());
    }
    return target_uri.toString();
};

//TODO: Remove or adjust
jsm.core.net.get = function(url, callback, parameters) {
	var payload = goog.uri.utils.appendParamsFromMap(url, parameters);
	var url = goog.uri.utils.appendParamsFromMap(jsm.config.net.PROXY_URL, {url: payload});
	goog.net.XhrIo.send(url, function(e) {
		console.log(this.getResponseJson());
	    callback(this.getResponseJson());
	});
};



/**
 * Makes an Ajax request using `goog.net.XhrIoPool`.
 * <br>
 * Takes the following options:
 * <ul>
 * <li>url: The URI to make the request to (required)
 * <li>parameters: A map of parameters to be appended to the URI
 * <li>data: Any data to be sent in the request body. If it is a map,
 *     the data will be form encoded
 * <li>complete | success | error: callbacks
 * <li>context: The object `this` should refer to in the callbacks
 * <li>responseFormat: Either `text`, `xml` or `json`. If nothing provided,
 *     the callbacks get the event object
 * </ul>
 * 
 * 
 * @param {{url: string, parameters: Object, 
 *          data: (Object|string), method: string, callback: function}} options_
 */
jsm.core.net.makeRequest = function(options_) {
	var options = {
			url: '',
			parameters: {},
			data: null,
			method: 'GET',
			complete: null,
			success: null,
			error: null,
			context: null,
			responseFormat: null,
			contentType: null
	},
	headers = {};
	
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
		
		if(options.contentType) {
			headers['Content-Type'] = options.contentType;
		}
		
		// remove empty parameters
		options.parameters = goog.object.filter(options.parameters, function(value) {
			return value !== '';
		});
		
		var parser = jsm.core.net.makeRequest.parseResponse_;
		
		jsm.core.net.getXhr(function(xhr){
			var ek, sk;
			sk = goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){				
				if(options.success) options.success.call(options.context, parser(e, options.responseFormat), e);
				goog.events.removeAll(xhr, goog.net.EventType.ERROR);
			});
			
			ek = goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
				if(options.error) options.error.call(options.context, e.target.getResponseText(), e);
				goog.events.removeAll(xhr, goog.net.EventType.SUCCESS);
			});
						
			goog.events.listenOnce(xhr, goog.net.EventType.COMPLETE, function(e){
				if(options.complete) options.complete.call(options.context, e.target.getResponseText(), e);
			});
			
			goog.events.listenOnce(xhr, goog.net.EventType.READY, function(e){
				jsm.core.net.releaseXhr(xhr);
			});
			
			options.url = jsm.core.net.buildUri(options.url, options.parameters);
			xhr.send(options.url, options.method, options.data, headers);
		});
	}
	
	//var payload = goog.uri.utils.appendParamsFromMap(url, get_data);
	//var url = goog.uri.utils.appendParamsFromMap(jsm.core.net.PROXY_URL, {url: payload});
};

/**
 * Utility function to parse the response.
 * 
 * @param {Object} event The Xhr event object
 * @param {string} format
 * @return {Object|string}
 * 
 * @private
 */
jsm.core.net.makeRequest.parseResponse_ = function(event, format) {
	var response = event.target,
	    format = format ? format.toLowerCase() : '';
	if (format === 'text') {
		return response.getResponseText();
	}
	else if (format === 'xml') {
		return response.getResponseXml();
	}
	else if (format === 'json') {
		return response.getResponseJson();
	}
	else {
		return response.getResponseText();
	}
};


/**
 * @protected
 */
jsm.core.net.getXhr = function(callback) {
	if(!jsm.core.net.pool) {
		jsm.core.net.pool = new goog.net.XhrIoPool();
	}
	jsm.core.net.pool.getObject(callback);
};

/**
 * @protected
 */
jsm.core.net.releaseXhr = function(xhr) {
	if(jsm.core.net.pool) {
		jsm.core.net.pool.releaseObject(xhr);
	}
};
