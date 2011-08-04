goog.provide('mashupIDE.WiringEditor');
goog.require('mashupIDE.core.Component');
goog.require('mashupIDE.core.Session');
goog.require('mashupIDE.core.registry.ServerRegistry');


mashupIDE.WiringEditor = function(options) {
	mashupIDE.WiringEditor.superclass.constructor.call(this, options);
	mashupIDE.WiringEditor.instance_ = this;
};

	YAHOO.lang.extend(mashupIDE.WiringEditor, WireIt.WiringEditor, {
	   /**
	    * Add the "run" button
	    */
	   renderButtons: function() {
		   var self = this;
		   mashupIDE.WiringEditor.superclass.renderButtons.call(this);

			// Add the run button to the toolbar
	      var toolbar = YAHOO.util.Dom.get('toolbar');
	      var runButton = new YAHOO.widget.Button({ label:"Run", id:"WiringEditor-runButton", container: toolbar });
	      runButton.on("click", function() {
	    	  mashupIDE.Session.getInstance().loadComposition(self.getValue());
	    	  mashupIDE.Session.getInstance().runComposition();
	      }, null, true);
	   }
	});

	
mashupIDE.WiringEditor.instance_ = null;

mashupIDE.WiringEditor.loadComponents = function(cb) {
    var demoLanguage = {

            // Set a unique name for the language
            languageName: "meltingpotDemo",
            
            adapter: mashupIDE.WiringEditor.adapters.MyAdapter,

            // inputEx fields for pipes properties
            propertiesFields: [
                // default fields (the "name" field is required by the WiringEditor):
                {"type": "string", inputParams: {"name": "name", label: "Title", typeInvite: "Enter a title" } },
                {"type": "text", inputParams: {"name": "description", label: "Description", cols: 30} },

                // Additional fields
                {"type": "boolean", inputParams: {"name": "isTest", value: true, label: "Test"}},
                {"type": "select", inputParams: {"name": "category", label: "Category", selectValues: ["Demo", "Test", "Other"]} }
            ],

            // List of node types definition
            modules: [{
                "name": "InOut test",
                "container": {
                    "xtype":"InOutContainer", 
                    "inputs": ["text1", "text2", "option1"],
                    "outputs": ["result", "error"]
                }
            }

            ]
        };
    
	mashupIDE.registry.ServerRegistry.getInstance().getComponents(function(cs){
        for(var id in cs) {
            var component = cs[id],
            module = {
                name: component.getName(),
                container: {
                    xtype: "ComponentContainer",
                    componentId: component.getId()
                }
            };
            demoLanguage.modules.push(module);
        }
        editor = new mashupIDE.WiringEditor(demoLanguage);
	});
	
};


	
mashupIDE.WiringEditor.getComponent = function(id, cb) {
	mashupIDE.registry.ServerRegistry.getInstance().getComponent(id, function(c){
		cb(c);
	});
};