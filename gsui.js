"use strict";

const GSUI = {

	dragshield: document.createElement( "gsui-dragshield" ),

	dispatchEvent( el, component, eventName, ...args ) {
		el.dispatchEvent( new CustomEvent( "gsuiEvents", {
			bubbles: true,
			detail: { component, eventName, args },
		} ) );
	},

	createElement( tag, props, children ) {
		const el = document.createElement( tag );

		Object.entries( props ).forEach( ( [ p, val ] ) => {
			if ( val || val === "" ) {
				el.setAttribute( p, val );
			}
		} );
		if ( Array.isArray( children ) ) {
			el.append( ...children.filter( Boolean ) );
		} else if ( children ) {
			el.append( children );
		}
		return el;
	},
};

document.body.prepend( GSUI.dragshield );
