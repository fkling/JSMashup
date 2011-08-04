goog.provide('mashupIDE.editor.MainToolbar');
goog.require('mashupIDE.core.registry');

goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ButtonSide');
goog.require('goog.ui.Dialog');

mashupIDE.editor.MainToolbar = function(node) {
	var tb = new goog.ui.Toolbar();
	this.registry = mashupIDE.core.registry.getInstance();
	this.editor = editor;
	
	var newBtn = new goog.ui.ToolbarButton('New');	
	newBtn.setTooltip('Crate a new component');
	tb.addChild(newBtn, true);
	
	var loadBtn = new goog.ui.ToolbarButton('Load...');	
	loadBtn.setTooltip('Load previous created components');
    tb.addChild(loadBtn, true);
    
    var saveBtn = new goog.ui.ToolbarButton('Save');	
	saveBtn.setTooltip('Save component');
    tb.addChild(saveBtn, true);
    
    goog.events.listen(tb, goog.ui.Component.EventType.ACTION, function(e){
    	if(e.target === newBtn) {
    		tb.dispatchEvent({type: mashupIDE.editor.MainToolbar.Events.NEW});
    	}
    	else if(e.target === loadBtn) {
    		tb.dispatchEvent({type: mashupIDE.editor.MainToolbar.Events.SHOW_COMPONENTS_DIALOG});
    	}
    	else if(e.target === saveBtn) {
    		tb.dispatchEvent({type: mashupIDE.editor.MainToolbar.Events.SAVE});
    	}
    }, null, this);
    
    tb.render(node);
    return tb;
};

goog.object.extend(mashupIDE.editor.MainToolbar.Events || (mashupIDE.editor.MainToolbar.Events = {}), {
	NEW: 'new',
	SHOW_COMPONENTS_DIALOG: 'show',
	SAVE: 'save'
});