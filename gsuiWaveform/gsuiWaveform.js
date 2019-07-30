"use strict";

class gsuiWaveform {
	constructor( svg ) {
		this.rootElement = svg || document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
		this.rootElement.setAttribute( "preserveAspectRatio", "none" );
		this.rootElement.classList.add( "gsuiWaveform" );
		this.polygon = this.rootElement.querySelector( "polygon" );
		if ( !this.polygon ) {
			this.polygon = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
			this.rootElement.append( this.polygon );
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
