goog.provide('mide.editor.AbstractView');
goog.require('goog.ui.TabPane.TabPage');

mide.editor.AbstractView = function(elem, title) {
	 goog.ui.TabPane.TabPage.call(this, elem, title);
};

goog.inherits(mide.editor.AbstractView, goog.ui.TabPane.TabPage);


mide.editor.AbstractView.prototype.update = function() {
};
