goog.provide('mide.editor.ComponentDialog');

goog.require('mide.core.registry');
goog.require('goog.ui.Dialog');
goog.require('goog.dom');


mide.editor.ComponentDialog = function() {
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
	    	  this.dispatchEvent({type: mide.editor.ComponentDialog.Events.COMPONENT_SELECTED, component_id: component.id});
	      }
	}, null, this);
	
	this.dom.append(this.getContentElement(), this.listNode);
};

goog.inherits(mide.editor.ComponentDialog, goog.ui.Dialog);


/**
 * @private
 */
mide.editor.ComponentDialog.prototype.onselect = function() {};

mide.editor.ComponentDialog.prototype.show = function() {
	var self = this;
	var d = self.dom;
	mide.core.registry.getInstance().getUserComponents(function(cs) {
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

mide.editor.ComponentDialog.prototype.hide = function() {
	this.setVisible(false);
};

goog.object.extend(mide.editor.ComponentDialog.Events || (mide.editor.ComponentDialog.Events = {}), {
	COMPONENT_SELECTED: 'selected'
});