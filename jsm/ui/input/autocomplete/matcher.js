goog.provide('jsm.ui.input.autocomplete.Matcher');
goog.require('jsm.core.net');

goog.require('goog.ui.AutoComplete.RemoteArrayMatcher');
goog.require('goog.uri.utils');

/**
 * Autocomplete matcher class which takes a callback function
 * to parse the response. Also uses <code>jsm.core.net</code>
 * to determine the correct URL.
 * 
 * @param {string} tokenName The search parameter name in the URI
 * @param {function} parser Callback function to parse the server response.
 *     Gets the response text as parameter
 * @param {string} url
 * @param {boolean} opt_noSimilar
 * 
 * @constructor
 * @extends goog.ui.AutoComplete.RemoteArrayMatcher
 */
jsm.ui.input.autocomplete.Matcher = function(tokenName, url, parser, opt_noSimilar) {
	this.tokenName_ = tokenName;
	this.parser_ = parser;
	goog.base(this, url, opt_noSimilar);
};

goog.inherits(jsm.ui.input.autocomplete.Matcher, goog.ui.AutoComplete.RemoteArrayMatcher);

/**
 * The parser function
 * 
 * @type function
 * @private
 */
jsm.ui.input.autocomplete.Matcher.prototype.parser_ = null;

/**
 * The search parameter name in the URI
 * 
 * @type function
 * @private
 */
jsm.ui.input.autocomplete.Matcher.prototype.tokenName_ = null;

/**
 * @override
 */
jsm.ui.input.autocomplete.Matcher.prototype.buildUrl = function(uri, token) {
	var params = {};
	params[this.tokenName_] = token;
	
	return jsm.core.net.buildUri(uri, params);
};

/**
 * @override
 */
jsm.ui.input.autocomplete.Matcher.prototype.parseResponseText = function(responseText) {
	if(this.parser_) {
		return this.parser_(responseText);
	}
	return jsm.ui.input.autocomplete.Matcher.superclass_.parseResponseText(responseText);
};
