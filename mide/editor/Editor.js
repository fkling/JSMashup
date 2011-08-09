goog.provide('mide.Editor');

goog.require('mide.editor.EditorPane');
goog.require('mide.editor.PreviewPane');
goog.require('mide.core.ComponentDescriptor');
goog.require('mide.core.Session');
goog.require('mide.core.registry.ServerRegistry');

goog.require('goog.ui.Component');


/**
 * @constructor
 */
mide.Editor = function() {
	goog.ui.Component.call(this);
	
	var self = this;
	this.session = mide.core.Session.start();
	this.registry = mide.core.registry.getInstance();
};

goog.inherits(mide.Editor, goog.ui.Component);

/**
 * @type {mide.core.Registry}
 */
mide.Editor.prototype.registry = null;

/**
 * @type {mide.core.Session}
 */
mide.Editor.prototype.session = null;


/**
 * @public
 */
mide.Editor.prototype.enterDocument = function() {
	var self = this;
	this.registry.load(null, function() {
		var sharedMemory = {};
		self.tabs = new goog.ui.TabPane(self.element_);
		self.tabs.addPage(new mide.editor.EditorPane(self, sharedMemory));
		self.tabs.addPage(new mide.editor.PreviewPane(self, sharedMemory));
		
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
mide.Editor.prototype.saveComponent = function(xml, javascript) {
	try {
		var descr = new mide.core.ComponentDescriptor();
		descr.setXml(xml);
		descr.setJs(javascript);
		
		this.registry.saveComponent(descr, function(response) {
			self.dispatchEvent({type: mide.Editor.Events.COMPONENT_SAVED, descriptor: descr});
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
mide.Editor.prototype.loadComponent = function(id) {
	var self = this;
	this.registry.getComponentDescriptorById(id, function(descriptor) {
		self.dispatchEvent({type: mide.Editor.Events.COMPONENT_LOADED, descriptor: descriptor});
	},function(response){
		alert('Couldn\'t find ' + id);
	});
};

/**
 * @public
 */
mide.Editor.prototype.createNewComponent = function(id) {
	this.dispatchEvent({type: mide.Editor.Events.COMPONENT_NEW});
};

goog.object.extend(mide.Editor.Events || (mide.Editor.Events = {}), { 
	COMPONENT_LOADED: 'component_loaded',
	COMPONENT_SAVED: 'component_saved',
	COMPONENT_NEW: 'component_new'
});
