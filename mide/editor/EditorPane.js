goog.provide('mide.editor.EditorPane');
goog.require('mide.editor.AbstractView');
goog.require('mide.core.Component');
goog.require('mide.editor.ComponentDialog');
goog.require('mide.editor.MainToolbar');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ButtonSide');


mide.editor.EditorPane = function(editor, sharedMemory) {
	this.sharedMemory = sharedMemory;
	this.editor = editor;
	this.componentDialog = new mide.editor.ComponentDialog();
	
	var elem = goog.dom.createElement('div');
	
	var mainToolbarNode = goog.dom.createDom('div', {'class' : 'toolbar'}), 
		xmlEditorToolbarNode = mainToolbarNode.cloneNode(), 
		jsEditorToolbarNode = mainToolbarNode.cloneNode();

	
	// set up editors
	
	var xmlEditorNode, jsEditorNode;

	xmlEditor = CodeMirror(function(elt) {
		xmlEditorNode = elt;
	}, {
		value: '<!-- Model delcaration goes here -->',
		mode: 'xml'
	});

	jsEditor = CodeMirror(function(elt) {
		jsEditorNode = elt;
	}, {
		value: '// Implementation goes here',
		mode: 'javascript'
	});
	
	// set up toolbars

	var mainToolbar = new mide.editor.MainToolbar(mainToolbarNode)/*, 
	    xmlEditorToolbar = new mide.editor.XmlEditorToolbar(xmlEditorToolbarNode, xmlEditor), 
		jsEditorToolbar = new mide.editor.JsEditorToolbar(jsEditorToolbarNode, jsEditor);*/
	
	
	goog.events.listen(mainToolbar, mide.editor.MainToolbar.Events.SAVE, function() {
		this.editor.saveComponent(xmlEditor.getValue(), jsEditor.getValue());
	}, null, this);
	
	goog.events.listen(mainToolbar, mide.editor.MainToolbar.Events.SHOW_COMPONENTS_DIALOG, function() {
		this.componentDialog.show();
	}, null, this);
	
	goog.events.listen(mainToolbar, mide.editor.MainToolbar.Events.NEW, function() {
		this.editor.createNewComponent();
	}, null, this);

	// set up dialog
	
	goog.events.listen(this.componentDialog, mide.editor.ComponentDialog.Events.COMPONENT_SELECTED, function(e) {
		this.editor.loadComponent(e.component_id);
		this.componentDialog.hide();
	}, null, this);
	
	goog.events.listen(this.editor, mide.Editor.Events.COMPONENT_LOADED, function(e) {
		xmlEditor.setValue(e.descriptor.getXml());
		jsEditor.setValue(e.descriptor.getJs());
		xmlEditor.refresh();
		jsEditor.refresh();
	}, null);
	
	goog.events.listen(this.editor, mide.Editor.Events.COMPONENT_NEW, function(e) {
		xmlEditor.setValue('');
		jsEditor.setValue('');
	}, null);
	
	goog.events.listen(this.editor, goog.ui.TabPane.Events.CHANGE, function(e) {
		xmlEditor.refresh();
		jsEditor.refresh();
	});
	
	// put everything together
	
	goog.dom.append(elem, mainToolbarNode, 'Model:', xmlEditorNode, 'Implementation:', jsEditorNode);
	
	mide.editor.AbstractView.call(this, elem, 'Editor');
	
	xmlEditor.refresh();
	jsEditor.refresh();
};

goog.inherits(mide.editor.EditorPane, mide.editor.AbstractView);