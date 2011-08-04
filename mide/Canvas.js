goog.provide('mashupIDE.Canvas');
goog.require('goog.dom');


/**
 * @constructor
 */
mashupIDE.Canvas = function(op_parent) {
	
};

mashupIDE.Canvas.instance_ = null;

mashupIDE.Canvas.getInstance = function() {
	return mashupIDE.Canvas.instance_ || (mashupIDE.Canvas.instance_ = new mashupIDE.Canvas());
};

mashupIDE.Canvas.prototype.loadComposition = function(containers, wires) {
	this.containers_ = containers;
	this.wires_ = wires;
};

mashupIDE.Canvas.prototype.show = function() {
	if(!this.container_) {
		!this.createContainer();
	}
	this.container_.style.display = "block";
	
	
	if(this.layer_) {
		goog.dom.removeNode(this.layer_);
	}
	this.layer_ = goog.dom.createDom('div', {'class': 'mashup_layer'});
	
	this.container_.appendChild(this.layer_);
	
	var layer = new WireIt.Layer({parentEl: this.layer_});
	for(var i = 0, l = this.containers_.length; i < l; i++) {
		layer.addContainer(this.containers_[i]);
	}
	for(var i = 0, l = this.wires_.length; i < l; i++ ) {
		layer.addWire(this.wires_[i]);
	}
};

mashupIDE.Canvas.prototype.createContainer = function() {
	var container = this.container_ = goog.dom.createDom('div', {'id': 'mashup_canvas'});
	var closeButton = goog.dom.createDom('div', {'class':'close'}, goog.dom.createTextNode("X"));
    goog.events.listen(closeButton, 'click', function() {
    	container.style.display = 'none';
    });
    container.appendChild(closeButton);
    document.body.appendChild(container);
};