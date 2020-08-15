"use strict";

const GSUI = {

	dragshield: document.createElement( "gsui-dragshield" ),

	dispatchEvent( el, component, eventName, ...args ) {
		el.dispatchEvent( new CustomEvent( "gsuiEvents", {
			bubbles: true,
			detail: { component, eventName, args },
		} ) );
	},

	createElement( tag, props, ...children ) {
		return GSUI._createElement( document.createElement( tag ), props, children );
	},
	createElementNS( tag, props, ...children ) {
		return GSUI._createElement( document.createElementNS( "http://www.w3.org/2000/svg", tag ), props, children );
	},
	_createElement( el, props, children ) {
		Object.entries( props ).forEach( ( [ p, val ] ) => {
			if ( val || val === "" ) {
				el.setAttribute( p, val );
			}
		} );
		el.append( ...children.flat( 1 ).filter( Boolean ) );
		return el;
	},
};

document.body.prepend( GSUI.dragshield );
