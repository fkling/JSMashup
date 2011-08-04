goog.provide('mide.ui.input.autocomplete.Matcher');
goog.require('mide.core.net');

goog.require('goog.ui.AutoComplete.RemoteArrayMatcher');
goog.require('goog.uri.utils');


mide.ui.input.autocomplete.Matcher = function(tokenName, url, op_extractor, opt_noSimilar) {
	this.tokenName_ = tokenName;
	this.extractor = op_extractor;
	goog.ui.AutoComplete.RemoteArrayMatcher.call(this, url, opt_noSimilar);
};

goog.inherits(mide.ui.input.autocomplete.Matcher, goog.ui.AutoComplete.RemoteArrayMatcher);


mide.ui.input.autocomplete.Matcher.prototype.extractor = null;

/**
 * @override
 */
mide.ui.input.autocomplete.Matcher.prototype.buildUrl = function(uri, token) {
	var url_param = goog.uri.utils.appendParam(uri, this.tokenName_, token);
	return goog.uri.utils.appendParam(mide.config.net.PROXY_URL, 'url', url_param);
};

/**
 * @override
 */
mide.ui.input.autocomplete.Matcher.prototype.parseResponseText = function(responseText) {
	if(this.extractor) {
		return this.extractor(responseText);
	}
	return mide.ui.input.autocomplete.Matcher.superclass_.parseResponseText(responseText);
};