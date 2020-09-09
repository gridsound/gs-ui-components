"use strict";

const GSUI = {

	noop() {},
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
	_resizeMap: new Map(),
	observeSizeOf( el, fn ) {
		if ( GSUI._resizeMap.has( el ) ) {
			GSUI._resizeMap.get( el ).push( fn );
		} else {
			GSUI._resizeMap.set( el, [ fn ] );
		}
		GSUI._resizeObs.observe( el );
	},
	unobserveSizeOf( el, fn ) {
		const fns = GSUI._resizeMap.get( el ),
			fnInd = fns.indexOf( fn );

		GSUI._resizeObs.unobserve( el );
		if ( fnInd > -1 ) {
			fns.splice( fnInd, 1 );
			if ( fns.length === 0 ) {
				GSUI._resizeMap.delete( el );
			}
		}
	},
	_resizeObsCallback( entries ) {
		entries.forEach( e => GSUI._resizeMap.get( e.target )
			.forEach( fn => fn( e.contentRect.width, e.contentRect.height ) ) );
	},

	// .........................................................................
	unselectText() {
		window.getSelection().removeAllRanges();
	},
};

GSUI._resizeObs = new ResizeObserver( GSUI._resizeObsCallback );

document.body.prepend( GSUI.dragshield );
