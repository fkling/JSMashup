goog.provide('org.reseval.processor.DomainConceptMapper');

goog.require('jsm.processor.DataProcessor')

goog.require('goog.array');

/**
 * 
 * @constructor
 */
org.reseval.processor.DomainConceptMapper = function(config) {
	goog.base(this, config);

    this.config.wildcard = config.wildcard || '*';
};

goog.inherits(org.reseval.processor.DomainConceptMapper, jsm.processor.DataProcessor);

/**
 * Sets the instance this processor belongs to. Attaches
 * event handlers to keep track of the component's state.
 * 
 * @param {jsm.core.Component} component
 * 
 * @public
 */
org.reseval.processor.DomainConceptMapper.prototype.setComponent = function(component) {
	goog.base(this, 'setComponent', component);
	
	component.subscribe(jsm.core.Component.Events.CONNECT, this.onConnect_, this);
};

/**
 * 
 * @private
 */
org.reseval.processor.DomainConceptMapper.prototype.onConnect_ = function(source, event, target, operation, isSource) {
	// if this component is the source, then we have to validate the data
	if(isSource) {
		var operation = target.getDescriptor().getOperation(operation);
		
		var event = source.getDescriptor().getEvent(event);
		
		if(operation && event) {
			var inputs = operation.getInputs(),
				outputs = event.getOutputs(),
				notFound = false;
			
			goog.array.forEach(inputs, function(input){
                var self = this;
				var output = input.type == self.config.wildcard || goog.array.find(outputs, function(output){
					return input.type === output.type;
				});
				if(!output) {
					notFound = true;
				}
			}, this);
		}
		if(notFound) {
			alert("The components don't seem to be compatible. The composition will probably not work.")
		}
	}
};
