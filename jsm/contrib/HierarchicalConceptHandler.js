/*global goog:true, jsm: true*/
"use strict";

goog.provide('jsm.dsl.HierarchicalConceptHandler');

goog.require('jsm.dsl.ConceptHandler');
goog.require('jsm.contrib.TypeParser');

goog.require('goog.structs.Set');
goog.require('goog.array');
goog.require('goog.object');


/**
 * Implements a very simple logic for handling domain concepts
 *  
 */
jsm.dsl.HierarchicalConceptHandler = function(hierarchy, conversionRules) {
    this.hierarchy_ = {};

    // map hierarchy to a simpler structure, lookup will be faster
    goog.array.forEach(hierarchy.concepts, function(concept) {
        this.hierarchy_[concept.name] = {
            parent: concept.parent,
            name: concept.name
        };
    }, this);

    this.conversionRules_ = conversionRules;
};

goog.inherits(jsm.dsl.HierarchicalConceptHandler, jsm.dsl.ConceptHandler);

/**
 * Tries to parse the given string into an object. Returns null if it fails.
 *
 * @private
 */
jsm.dsl.HierarchicalConceptHandler.prototype.parseConcept_ = function(concept) {
    try {
      return jsm.contrib.TypeParser.parse(concept)[0];
    }
    catch(e) {
        console.log(e.toString());
      return null;
    }  
};

/**
 * @inherit
 */

jsm.dsl.HierarchicalConceptHandler.prototype.isValid = function(concept) {
    return this.isInHierarchy_(concept);
};


jsm.dsl.HierarchicalConceptHandler.prototype.isInHierarchy_ = function(concept) {
    var concepts_ = this.parseConcept_(concept);

    // parsing faild, the type concept string does not have the right format
    if(!goog.isDef(concepts_)) {
        return false;
    }

    // for concept extracted from the string, test whether it is in the hieararchy
    //for(var c in concepts_) {
        if(!(c.name in this.hierarchy_)) {
            return false;
        }
    //}
    return true;
};



/**
 * @param {jsm.core.Event} event
 * @param {jsm.core.Operation} operation
 * @return boolean
 */
jsm.dsl.HierarchicalConceptHandler.prototype.isCompatible = function(event, operation) {
   // if the operation expects more inputs than the event provides, not compatible
   if(event.getOutputs().length < operation.getInputs().length) {
       return false;
   }

   var outputs = event.getOutputs();

   return goog.array.every(operation.getInputs(), function(input) {
       if(input.type === '*') {
           return true;
       }
       return goog.array.some(outputs, function(output) {
           return this.typesAreCompatible_(output.type, input.type) || this.conversionRuleExists_(output.type, input.type);
       }, this);
   }, this);
};

jsm.dsl.HierarchicalConceptHandler.prototype.typesAreCompatible_ = function(typeA, typeB) {
    var conceptA = goog.isString(typeA) ? this.parseConcept_(typeA) : typeA[0],
        conceptB = goog.isString(typeB) ? this.parseConcept_(typeB) : typeB[0];

    // one of the concepts could be parsed
    if(!conceptA || !conceptB) {
        return false;
    }

    // if conceptA is not the same or an descandent of conceptB, they are not compatible
    if(!this.isOrIsDescendantOf(conceptA.name, conceptB.name)) {
        return false;
    }

    // compare provided attributes. conceptA must provide all that conceptB expects
    return goog.array.every(conceptB.attributes, function(attributeB) {
        return goog.array.some(conceptA.attributes, function(attributeA) {
            // attribtues match if the name is the same and both don't specify a value
            // or the values match as well
            return attributeB.name === attributeA.name && (!attributeB.value  || attributeA.value && this.typesAreCompatible_(attributeA.value, attributeB.value));
        }, this);
    },this);
};

jsm.dsl.HierarchicalConceptHandler.prototype.isOrIsDescendantOf= function(conceptNameA, conceptNameB) {
    var concept = this.hierarchy_[conceptNameA];

    // traverse up the hierarchy
    while(concept && concept.name != conceptNameB) {
        concept = this.hierarchy_[concept.parent];
    }
    return !!concept;
};

jsm.dsl.HierarchicalConceptHandler.prototype.conversionRuleExists_ = function(typeA, typeB) {
    return !!this.getConversionRule_(typeA, typeB);
};


jsm.dsl.HierarchicalConceptHandler.prototype.getConversionRule_ = function(typeA, typeB) {
    var from_concept_index, to_concept_index;

    // find index of first compatible concept
    from_concept_index = goog.array.findIndex(this.conversionRules_, function(from) {
        return this.typesAreCompatible_(typeA, from.type);
    }, this);

    // find index of first compatible concept
    to_concept_index  = goog.array.findIndex((this.conversionRules_[from_concept_index] || {}).to || [], function(to) {
        return this.typesAreCompatible_(typeB, to.type);
    }, this);

    return from_concept_index > -1 && to_concept_index > -1 ? this.conversionRules_[from_concept_index].to[to_concept_index].rule : null;
};


/**
 * @param {jsm.core.Event} event
 * @param {jsm.core.Operation} operation
 * @param {object} data
 *
 * @return object
 */

jsm.dsl.HierarchicalConceptHandler.prototype.convert = function(event, operation, data) {
   var outputs = event.getOutputs(),
       mapped_data = {};



   goog.array.forEach(operation.getInputs(), function(input) {

       // first, try to find a matching output type or a conversion rule
        var rule;

        var matching_output = goog.array.find(outputs, function(output) {
            return output.name in data && this.typesAreCompatible_(output.type, input.type);
        }, this) || goog.array.find(outputs, function(output) {
            return  output.name in data && (rule = this.getConversionRule_(output.type, input.type));
        }, this);


        if(matching_output) {
            mapped_data[input.name] = rule ? rule(data[matching_output.name]) : data[matching_output.name];
            delete  data[matching_output.name];
        }
   }, this);

   goog.object.extend(data, mapped_data);

   return data;
};
