"use strict";

const GSUI = {

	dragshield: document.createElement( "gsui-dragshield" ),

	// .........................................................................
	dispatchEvent( el, component, eventName, ...args ) {
		el.dispatchEvent( new CustomEvent( "gsuiEvents", {
			bubbles: true,
			detail: { component, eventName, args },
		} ) );
	},

	// .........................................................................
	_templates: new Map(),
	setTemplate( tmpId, fn ) {
		GSUI._templates.set( tmpId, fn );
	},
	getTemplate( tmpId, ...args ) {
		return GSUI._templates.get( tmpId )( ...args );
	},

	// .........................................................................
	createElement( tag, attr, ...children ) {
		return GSUI._createElement( document.createElement( tag ), attr, children );
	},
	createElementNS( tag, attr, ...children ) {
		return GSUI._createElement( document.createElementNS( "http://www.w3.org/2000/svg", tag ), attr, children );
	},
	_createElement( el, attr, children ) {
		if ( attr ) {
			Object.entries( attr ).forEach( ( [ p, val ] ) => {
				if ( val || val === "" ) {
					el.setAttribute( p, val );
				}
			} );
		}
		el.append( ...children.flat( 1 ).filter( Boolean ) );
		return el;
	},

	// .........................................................................
	observeSizeOf( el, fn ) {
		if ( !GSUI._resizeMap.has( el ) ) {
			GSUI._resizeObs.observe( el );
			GSUI._resizeMap.set( el, fn );
		}
	},
	unobserveSizeOf( el ) {
		GSUI._resizeObs.unobserve( el );
		GSUI._resizeMap.delete( el );
	},
	_resizeMap: new Map(),
	_resizeObsCallback( entries ) {
		entries.forEach( e => GSUI._resizeMap.get( e.target )( e.width, e.height ) );
	},
};

GSUI._resizeObs = new ResizeObserver( GSUI._resizeObsCallback );

document.body.prepend( GSUI.dragshield );
