goog.provide('mashupIDE.editor.AbstractView');
goog.require('goog.ui.TabPane.TabPage');

mashupIDE.editor.AbstractView = function(elem, title) {
	 goog.ui.TabPane.TabPage.call(this, elem, title);
};

goog.inherits(mashupIDE.editor.AbstractView, goog.ui.TabPane.TabPage);


mashupIDE.editor.AbstractView.prototype.update = function() {
};
