goog.provide('jsm.parser');
goog.require('goog.dom.xml');

jsm.parser.parse = function(xmlString) {
	var doc = goog.dom.xml.loadXml(xmlString);
	return jsm.parser.parseNode_(doc.firstChild);
};

jsm.parser.parseNode_ = function(node) {
	var obj = {
			'#text': '',
			'@': {}
	};
	if(node.attributes) {
		for(var i = node.attributes.length; i--; ) {
			obj['@'][node.attributes[i].name] = node.attributes[i].value;
		}
	}
	
	for(var child = node.firstChild; child; child = child.nextSibling) {
		if(child.nodeType === 1) {
			if(!(child.nodeName in obj)) {
				obj[child.nodeName] = [];
			}
			obj[child.nodeName].push(jsm.parser.parseNode_(child));
		}
		else if(child.nodeType === 3) {
			if(child.nodeValue.replace(/s+/g, '') !== '') {
				obj['#text'] += child.nodeValue;
			}		
		}
	}
	obj['#text'] = obj['#text'];
	return obj;
};
