goog.provide('mashupIDE.editor.PreviewPane');
goog.require('mashupIDE.editor.AbstractView');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.TabPane');

mashupIDE.editor.PreviewPane = function(editor) {
	var elem = goog.dom.createDom('div', {id: 'preview'});
	
	
	goog.events.listen(editor, mashupIDE.Editor.Events.COMPONENT_LOADED, function(e) {
		console.log(e);
	}, null);
	
	goog.events.listen(editor, mashupIDE.Editor.Events.COMPONENT_NEW, function(e) {
		console.log(e);
	}, null);
	
	goog.events.listen(editor, goog.ui.TabPane.Events.CHANGE, function(e) {
		console.log('Tab changed');
		console.log(e);
	});
	
	mashupIDE.editor.AbstractView.call(this, elem, 'Preview');
};

goog.inherits(mashupIDE.editor.PreviewPane, mashupIDE.editor.AbstractView);