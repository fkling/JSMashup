goog.provide('mashupIDE.ui.input.autocomplete.Matcher');
goog.require('mashupIDE.core.net');

goog.require('goog.ui.AutoComplete.RemoteArrayMatcher');
goog.require('goog.uri.utils');


mashupIDE.ui.input.autocomplete.Matcher = function(tokenName, url, op_extractor, opt_noSimilar) {
	this.tokenName_ = tokenName;
	this.extractor = op_extractor;
	goog.ui.AutoComplete.RemoteArrayMatcher.call(this, url, opt_noSimilar);
};

goog.inherits(mashupIDE.ui.input.autocomplete.Matcher, goog.ui.AutoComplete.RemoteArrayMatcher);


mashupIDE.ui.input.autocomplete.Matcher.prototype.extractor = null;

/**
 * @override
 */
mashupIDE.ui.input.autocomplete.Matcher.prototype.buildUrl = function(uri, token) {
	var url_param = goog.uri.utils.appendParam(uri, this.tokenName_, token);
	return goog.uri.utils.appendParam(mashupIDE.config.net.PROXY_URL, 'url', url_param);
};

/**
 * @override
 */
mashupIDE.ui.input.autocomplete.Matcher.prototype.parseResponseText = function(responseText) {
	if(this.extractor) {
		return this.extractor(responseText);
	}
	return mashupIDE.ui.input.autocomplete.Matcher.superclass_.parseResponseText(responseText);
};