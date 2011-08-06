goog.provide('mide.ui.input.InputFactory');

goog.require('mide.ui.input.ProxyInput');
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
 * @param {string} name The fully qualified name
 * @param {mide.util.OptionMap} opt_options Configuration options from
 *     the model file
 * @param {string} opt_ref A URL to the definition
 * @return {mide.ui.input.BaseInput}
 * 
 * @public
 */
mide.ui.input.InputFactory.prototype.get = function(name, opt_options, opt_ref) {
    var Input = goog.getObjectByName(name);
    if(Input) {
    	return new Input(opt_options);
    }
    var proxy = new mide.ui.input.ProxyInput(name, opt_ref, opt_options);
    proxy.setManager(mide.module.ModuleManager.getInstance());
    
    return proxy;
};

goog.addSingletonGetter(mide.ui.input.InputFactory);