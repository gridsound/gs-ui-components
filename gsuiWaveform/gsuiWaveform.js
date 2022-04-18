"use strict";

class gsuiWaveform {
	constructor( el ) {
		const svg = el || GSUI.createElemSVG( "svg" );
		const poly = svg.querySelector( "polygon" );

		this.rootElement = svg;
		this.polygon = poly;
		this.width =
		this.height = 0;
		Object.seal( this );

		GSUI.setAttr( svg, "preserveAspectRatio", "none" );
		svg.classList.add( "gsuiWaveform" );
		if ( !poly ) {
			this.polygon = GSUI.createElemSVG( "polygon" );
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
		GSUI.setAttr( this.rootElement, "viewBox", `0 0 ${ w } ${ h }` );
	}
	drawBuffer( buf, offset, duration ) {
		gsuiWaveform.drawBuffer( this.polygon, this.width, this.height, buf, offset, duration );
	}
}
