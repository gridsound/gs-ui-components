"use strict";

class gsuiWaveforms {
	constructor() {
		const root = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );

		this.rootElement = root;
		this._waves = new Map();
		this._elDefs = document.createElementNS( "http://www.w3.org/2000/svg", "defs" );
		this._pxPerSec = 24;
		this._pxHeight = 64;
		Object.seal( this );

		root.style.display = "none";
		root.classList.add( "gsuiWaveforms" );
		root.append( this._elDefs );
		document.body.prepend( root );
	}

	setPxPerSecond( px ) {
		this._pxPerSec = px | 0;
	}
	setPxHeight( px ) {
		this._pxHeight = px | 0;
	}
	empty() {
		this._waves.forEach( w => w.polygon.remove() );
		this._waves.clear();
	}
	delete( id ) {
		this._waves.get( id ).polygon.remove();
		this._waves.delete( id );
	}
	add( id, buf ) {
		const polygon = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" ),
			w = buf.duration * this._pxPerSec | 0,
			h = this._pxHeight;

		polygon.id = `gsuiWaveforms_${ id }`;
		gsuiWaveform.drawBuffer( polygon, w, h, buf );
		this._elDefs.append( polygon );
		this._waves.set( id, {
			polygon, w, h,
			duration: buf.duration,
		} );
	}
	createSVG( id ) {
		const wave = this._waves.get( id );

		if ( wave ) {
			const svg = document.createElementNS( "http://www.w3.org/2000/svg", "svg" ),
				use = document.createElementNS( "http://www.w3.org/2000/svg", "use" );

			use.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#gsuiWaveforms_${ id }` );
			svg.setAttribute( "viewBox", `0 0 ${ wave.w } ${ wave.h }` );
			svg.setAttribute( "preserveAspectRatio", "none" );
			svg.append( use );
			return svg;
		}
	}
}
