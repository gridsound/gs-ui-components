"use strict";

window.gsUIComponents = function( element, data ) {
	for ( var k in gsUIComponents ) {
		if ( element.classList.contains( k ) ) {
			gsUIComponents[ k ]( element, data );
			return element;
		}
	}
};
