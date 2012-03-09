goog.provide('jsm.dsl.SimpleConceptHandler');

goog.require('jsm.dsl.ConceptHandler');

goog.require('goog.structs.Set');
goog.require('goog.array');
goog.require('goog.object');


/**
 * Implements a very simple logic for handling domain concepts
 *  
 */
jsm.dsl.SimpleConceptHandler = function() {};

goog.inherits(jsm.dsl.SimpleConceptHandler, jsm.dsl.ConceptHandler);

jsm.dsl.SimpleConceptHandler.prototype.isValid = function(concept) {
    return true;
};

/**
 * @param {jsm.core.Event} event
 * @param {jsm.core.Operation} operation
 * @return boolean
 */
jsm.dsl.SimpleConceptHandler.prototype.isCompatible = function(event, operation) {
   // if the operation expects more inputs than the event provides, not compatible
   if(event.getOutputs().length < operation.getInputs().length) {
       return false;
   }

   // otherwise check whether the values of the type attributes match
   var output_types = new goog.structs.Set(event.getOutputs());

   return goog.array.every(operation.getInputs(), function(input) {
       return input.type === '*' || output_types.contains(input.type);
   });
};

/**
 * @param {jsm.core.Event} event
 * @param {jsm.core.Operation} operation
 * @param {object} data
 *
 * @return object
 */

jsm.dsl.SimpleConceptHandler.prototype.convert = function(event, operation, data) {
   var outputs = event.getOutputs(),
       mapped_data = {};

   // for each input find the corresponding output by type
   goog.array.forEach(operation.getIntputs(), function(input) {
        var matching_output = goog.array.find(outputs, function(output) {
            return output.name === input.name;
        });
        if(matching_output && matching_output.name in data) {
            mapped_data[input.name] = data[matching_output.name];
            delete  data[matching_output.name];
        }
   });

   goog.extend(data, mapped_data);

   return data;
};
