goog.provide('mide.ui.input.ProxyInput');

goog.require('mide.ui.input.TextInput');

/**
 * If <code>opt_ref</code> is provided, tries to 
 * load the definition for <code>name</code> from this
 * location and will act like this one.
 * <br>
 * If no URL is provided or if the content cannot be loaded
 * it will just be a mide.ui.input.TextInput.
 * 
 * @param {string} name fully qualified name of the element
 * @param {mide.util.OptionMap} opt_options options from the 
 *     model file
 * @param {string} URL to get the implementation from in case
 *     in does not exist
 * 
 * @extends mide.ui.input.TextInput
 * @constructor
 */
mide.ui.input.ProxyInput = function(name, opt_options, opt_ref) {
	
}