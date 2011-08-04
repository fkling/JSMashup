goog.provide('mide.editor.PreviewPane');
goog.require('mide.editor.AbstractView');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.TabPane');

mide.editor.PreviewPane = function(editor) {
	var elem = goog.dom.createDom('div', {id: 'preview'});
	
	
	goog.events.listen(editor, mide.Editor.Events.COMPONENT_LOADED, function(e) {
		console.log(e);
	}, null);
	
	goog.events.listen(editor, mide.Editor.Events.COMPONENT_NEW, function(e) {
		console.log(e);
	}, null);
	
	goog.events.listen(editor, goog.ui.TabPane.Events.CHANGE, function(e) {
		console.log('Tab changed');
		console.log(e);
	});
	
	mide.editor.AbstractView.call(this, elem, 'Preview');
};

goog.inherits(mide.editor.PreviewPane, mide.editor.AbstractView);