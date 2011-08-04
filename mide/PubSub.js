goog.provide('mashupIDE.PubSub');
goog.require('goog.array');

(function() {
    var connections = {},
        event_queue = {},
        components = {};
    
    function raiseEventIfQueued(src, event) {
        if(event_queue[src] && event_queue[src][event]) {
            PubSub.raiseEvent(src, event,  event_queue[src][event]);
        }
    }
    
    mashupIDE.PubSub.clear = function() {
    	connections = {};
    	event_queue = {};
    };

    mashupIDE.PubSub.connect = function(src, event, target, operation) {
    	var srcId = src.getId(),
    		src_connections = connections[srcId] || (connections[srcId] = {}),
    		event_connections = src_connections[event] || (src_connections[event] = []);

        if(goog.array.some(event_connections, function(c) {return c.target === target && c.op === operation;})) {
            return;
        }

        event_connections.push({target: target, op: operation});

        raiseEventIfQueued(src, event);
    };

    mashupIDE.PubSub.disconnect = function(src, event, target, operation) {
    	var srcId = src.getId();
        if(connections[srcId] && connections[srcId][event]) {
            var event_connections = connections[srcId][event];
            for(var i = event_connections.length; i--; ) {
                var connection = event_connections[i];
                if(connection.target === target && connection.op === operation) {
                    event_connections.splice(i, 1);
                    break; // there can be only one
                }
            }
        }
    };

    mashupIDE.PubSub.triggerEvent = function(src, event, params) {
    	var srcId = src.getId();
        if(connections[srcId] && connections[srcId][event]
           && connections[srcId][event].length > 0) {
               goog.array.forEach(connections[srcId][event], function(connection) {
               		//create a copy of params
            	   params = JSON.parse(JSON.stringify(params));
                   connection.target.perform(connection.op, params);
               });
           }
           else {
               var src_queue = event_queue[srcId] || (event_queue[srcId] = {});
               src_queue[srcId] = params;
           }
    };
    
    mashupIDE.PubSub.registerComponent = function(c) {
    	components[c.getId()] = c;
    };
}());