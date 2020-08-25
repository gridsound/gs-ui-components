"use strict";

const GSUI = {

	dragshield: document.createElement( "gsui-dragshield" ),
	templates: new Map(),

	dispatchEvent( el, component, eventName, ...args ) {
		el.dispatchEvent( new CustomEvent( "gsuiEvents", {
			bubbles: true,
			detail: { component, eventName, args },
		} ) );
	},

	// .........................................................................
	setTemplate( tmpId, fn ) {
		GSUI.templates.set( tmpId, fn );
	},
	getTemplate( tmpId, ...args ) {
		return GSUI.templates.get( tmpId )( ...args );
	},

	// .........................................................................
	createElement( tag, attr, ...children ) {
		return GSUI._createElement( document.createElement( tag ), attr, children );
	},
	createElementNS( tag, attr, ...children ) {
		return GSUI._createElement( document.createElementNS( "http://www.w3.org/2000/svg", tag ), attr, children );
	},
	_createElement( el, attr, children ) {
		Object.entries( attr ).forEach( ( [ p, val ] ) => {
			if ( val || val === "" ) {
				el.setAttribute( p, val );
			}
		} );
		el.append( ...children.flat( 1 ).filter( Boolean ) );
		return el;
	},
};

document.body.prepend( GSUI.dragshield );
