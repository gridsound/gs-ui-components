"use strict";

window.SVGURL = "http://www.w3.org/2000/svg";

function gsuiRectMatrix() {
	var root = document.createElementNS( SVGURL, "svg" );

	this.rootElement = root;
	root.setAttribute( "preserveAspectRatio", "none" );
	root.classList.add( "gsuiRectMatrix" );
}

gsuiRectMatrix.prototype = {
	remove() {
		this.empty();
		this.rootElement.remove();
	},
	empty() {
		var root = this.rootElement;

		while ( root.childNodes.length ) {
			root.lastChild.remove();
		}
	},
	setResolution( w, h ) {
		this.width = w;
		this.height = h;
		this.rootElement.setAttribute( "viewBox", "0 0 " + w + " " + h );
	},
	render( data, offset, duration ) {
		var rect,
			rectX,
			rectW,
			secW,
			w = this.width,
			h = this.height,
			rowH = h / data.nbRows,
			root = this.rootElement;

		offset = offset || 0;
		duration = duration || data.duration;
		secW = w / duration;
		this.empty();
		data.samples.forEach( function( smp ) {
			rectX = ( smp.when - offset ) * secW;
			rectW = smp.duration * secW;
			if ( rectX + rectW > 0 && rectX < w ) {
				rect = document.createElementNS( SVGURL, "rect" );
				rect.setAttribute( "x", rectX + "px" );
				rect.setAttribute( "width", rectW + "px" );
				rect.setAttribute( "y", smp.row * rowH + "px" );
				rect.setAttribute( "height", rowH + "px" );
				root.append( rect );
			}
		} );
	}
};
