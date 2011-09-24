goog.provide('jsm.ui.input.InputFactory');

goog.require('jsm.ui.input.ProxyInput');
goog.require('jsm.ui.input.Autocomplete');
goog.require('jsm.ui.input.Dropdown');
goog.require('jsm.ui.input.TextInput');
goog.require('jsm.module.ModuleManager');

goog.require('goog.dom');

/**
 * Input factory to get the get an input element
 * via its fully qualified name. If it does not exist, 
 * a jsm.ui.input.InputProxy will be returned.
 * <br><br>
 * If in addition a URL is provided, the input element's 
 * definition will be loaded from this location. All dependencies
 * the definition needs must be included in this file.
 * <br><br>
 * <b>Singleton</b> Get the instance via getInstance.
 * 
 * @constructor
 */
jsm.ui.input.InputFactory = function(){};

/**
 * Get input field with name <code>name</code>.
 * 
 * @param {string} fqn The fully qualified name
 * @param {string} name The configuration name of the input
 * @param {string} label  The label of the input
 * @param {jsm.util.OptionMap} opt_options Configuration options from
 *     the model file
 * @param {string} opt_ref A URL to the definition
 * @return {jsm.ui.input.BaseInput}
 * 
 * @public
 */
jsm.ui.input.InputFactory.prototype.get = function(fqn, name, label, opt_options, opt_ref) {
    var Input = goog.getObjectByName(fqn);
    if(Input) {
    	return new Input(name, label, opt_options);
    }
    return new jsm.ui.input.TextInput(name, label, opt_options);
    /*
    var proxy = new jsm.ui.input.ProxyInput(fqn, opt_ref, name, label, opt_options);
    proxy.setManager(jsm.module.ModuleManager.getInstance());
    
    return proxy;
    */
};

goog.addSingletonGetter(jsm.ui.input.InputFactory);
