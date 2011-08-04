goog.provide('mashupIDE.parser');
goog.require('goog.dom.xml');

mashupIDE.parser.parse = function(xmlString) {
	var doc = goog.dom.xml.loadXml(xmlString);
	return mashupIDE.parser.parseNode_(doc.firstChild);
};

mashupIDE.parser.parseNode_ = function(node) {
	var obj = {
			'#text': ''
	};
	if(node.attributes) {
		for(var i = node.attributes.length; i--; ) {
			obj[node.attributes[i].name] = node.attributes[i].value;
		}
	}
	
	for(var child = node.firstChild; child; child = child.nextSibling) {
		if(child.nodeType === 1) {
			if(!(child.nodeName in obj)) {
				obj[child.nodeName] = [];
			}
			obj[child.nodeName].push(mashupIDE.parser.parseNode_(child));
		}
		else if(child.nodeType) {
			obj['#text'] += child.nodeValue;
		}
	}
	return obj;
};