goog.provide('mashupIDE.editor.ComponentDialog');

goog.require('mashupIDE.core.registry');
goog.require('goog.ui.Dialog');
goog.require('goog.dom');


mashupIDE.editor.ComponentDialog = function() {
	goog.ui.Dialog.call(this);
	this.dom = goog.dom;
	
	this.setDraggable(false);
	this.setModal(true);
	this.setTitle('Select a component...');
	this.setButtonSet(null);
	
	this.listNode = this.dom.createDom('div', {class: 'component-list'});
	
	goog.events.listen(this.listNode, goog.events.EventType.CLICK, function(e) {
	      var component = goog.dom.classes.has(e.target, 'component') ? e.target :
	    	  this.dom.getAncestorByClass(e.target, 'component');
	      
	      if(component) {
	    	  this.dispatchEvent({type: mashupIDE.editor.ComponentDialog.Events.COMPONENT_SELECTED, component_id: component.id});
	      }
	}, null, this);
	
	this.dom.append(this.getContentElement(), this.listNode);
};

goog.inherits(mashupIDE.editor.ComponentDialog, goog.ui.Dialog);


/**
 * @private
 */
mashupIDE.editor.ComponentDialog.prototype.onselect = function() {};

mashupIDE.editor.ComponentDialog.prototype.show = function() {
	var self = this;
	var d = self.dom;
	mashupIDE.core.registry.getInstance().getUserComponents(function(cs) {
		d.removeChildren(self.listNode);
		goog.array.forEach(cs, function(v) {
			d.append(self.listNode, d.createDom('div', {class: 'component', id: v.id}, 
					d.createDom('h3', null, d.createTextNode(v.name)),
					d.createDom('p', null, d.createTextNode(v.description))
			));
		});
		self.setVisible(true);
	});
};

mashupIDE.editor.ComponentDialog.prototype.hide = function() {
	this.setVisible(false);
};

goog.object.extend(mashupIDE.editor.ComponentDialog.Events || (mashupIDE.editor.ComponentDialog.Events = {}), {
	COMPONENT_SELECTED: 'selected'
});