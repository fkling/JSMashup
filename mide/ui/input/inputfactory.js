goog.provide('mide.ui.input.InputFactory');

goog.require('mide.ui.input.ProxyInput');
goog.require('mide.ui.input.Autocomplete');
goog.require('mide.ui.input.Dropdown');
goog.require('mide.module.ModuleManager');

goog.require('goog.dom');

/**
 * Input factory to get the get an input element
 * via its fully qualified name. If it does not exist, 
 * a mide.ui.input.InputProxy will be returned.
 * <br><br>
 * If in addition a URL is provided, the input element's 
 * definition will be loaded from this location. All dependencies
 * the definition needs must be included in this file.
 * <br><br>
 * <b>Singleton</b> Get the instance via getInstance.
 * 
 * @constructor
 */
mide.ui.input.InputFactory = function(){};

/**
 * Get input field with name <code>name</code>.
 * 
 * @param {string} fqn The fully qualified name
 * @param {string} name The configuration name of the input
 * @param {string} label  The label of the input
 * @param {mide.util.OptionMap} opt_options Configuration options from
 *     the model file
 * @param {string} opt_ref A URL to the definition
 * @return {mide.ui.input.BaseInput}
 * 
 * @public
 */
mide.ui.input.InputFactory.prototype.get = function(fqn, name, label, opt_options, opt_ref) {
    var Input = goog.getObjectByName(fqn);
    if(Input) {
    	return new Input(name, label, opt_options);
    }
    var proxy = new mide.ui.input.ProxyInput(fqn, opt_ref, name, label, opt_options);
    proxy.setManager(mide.module.ModuleManager.getInstance());
    
    return proxy;
};

goog.addSingletonGetter(mide.ui.input.InputFactory);