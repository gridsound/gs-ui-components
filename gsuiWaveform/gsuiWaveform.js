"use strict";

class gsuiWaveform {
	constructor( el ) {
		const svg = el || document.createElementNS( "http://www.w3.org/2000/svg", "svg" ),
			poly = svg.querySelector( "polygon" );

		this.rootElement = svg;
		this.polygon = poly;
		this.width =
		this.height = 0;
		Object.seal( this );

		svg.setAttribute( "preserveAspectRatio", "none" );
		svg.classList.add( "gsuiWaveform" );
		if ( !poly ) {
			this.polygon = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
			svg.append( this.polygon );
		}
	}

	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		this.polygon.removeAttribute( "points" );
	}
	setResolution( w, h ) {
		this.width = w;
		this.height = h;
		this.rootElement.setAttribute( "viewBox", `0 0 ${ w } ${ h }` );
	}
	drawBuffer( buf, offset, duration ) {
		gsuiWaveform.drawBuffer( this.polygon, this.width, this.height, buf, offset, duration );
	}
}
