goog.provide('mashupIDE.Editor');

goog.require('mashupIDE.editor.EditorPane');
goog.require('mashupIDE.editor.PreviewPane');
goog.require('mashupIDE.core.ComponentDescriptor');
goog.require('mashupIDE.core.Session');
goog.require('mashupIDE.core.registry.ServerRegistry');

goog.require('goog.ui.Component');


/**
 * @constructor
 */
mashupIDE.Editor = function() {
	goog.ui.Component.call(this);
	
	var self = this;
	this.session = mashupIDE.core.Session.start();
	this.registry = mashupIDE.core.registry.getInstance();
};

goog.inherits(mashupIDE.Editor, goog.ui.Component);

/**
 * @type {mashupIDE.core.Registry}
 */
mashupIDE.Editor.prototype.registry = null;

/**
 * @type {mashupIDE.core.Session}
 */
mashupIDE.Editor.prototype.session = null;


/**
 * @public
 */
mashupIDE.Editor.prototype.enterDocument = function() {
	var self = this;
	this.registry.load(null, function() {
		var sharedMemory = {};
		self.tabs = new goog.ui.TabPane(self.element_);
		self.tabs.addPage(new mashupIDE.editor.EditorPane(self, sharedMemory));
		self.tabs.addPage(new mashupIDE.editor.PreviewPane(self, sharedMemory));
		
		goog.events.listen(self.tabs, goog.ui.TabPane.Events.CHANGE, function(e) {
			this.dispatchEvent(e);
		}, null, self);
		self.dispatchEvent({type: goog.ui.TabPane.Events.CHANGE});
		
	}, function() {
		alert('Oooops');
	});
};

/**
 * @public
 */
mashupIDE.Editor.prototype.saveComponent = function(xml, javascript) {
	try {
		var descr = new mashupIDE.core.ComponentDescriptor();
		descr.setXml(xml);
		descr.setJs(javascript);
		
		this.registry.saveComponent(descr, function(response) {
			self.dispatchEvent({type: mashupIDE.Editor.Events.COMPONENT_SAVED, descriptor: descr});
			alert('Saved succesfully');
		},function(response){
			alert('Save failed');
		});
	}
	catch(e) {
		alert(e);
	}
};

/**
 * @public
 */
mashupIDE.Editor.prototype.loadComponent = function(id) {
	var self = this;
	this.registry.getComponentDescriptorById(id, function(descriptor) {
		self.dispatchEvent({type: mashupIDE.Editor.Events.COMPONENT_LOADED, descriptor: descriptor});
	},function(response){
		alert('Couldn\'t find ' + id);
	});
};

/**
 * @public
 */
mashupIDE.Editor.prototype.createNewComponent = function(id) {
	this.dispatchEvent({type: mashupIDE.Editor.Events.COMPONENT_NEW});
};

goog.object.extend(mashupIDE.Editor.Events || (mashupIDE.Editor.Events = {}), { 
	COMPONENT_LOADED: 'component_loaded',
	COMPONENT_SAVED: 'component_saved',
	COMPONENT_NEW: 'component_new'
});
