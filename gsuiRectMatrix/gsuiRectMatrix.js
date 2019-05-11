"use strict";

window.SVGURL = "http://www.w3.org/2000/svg";

function gsuiRectMatrix() {
	const root = document.createElementNS( SVGURL, "svg" );

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
		const root = this.rootElement;

		while ( root.childNodes.length ) {
			root.lastChild.remove();
		}
	},
	setResolution( w, h ) {
		this.width = w;
		this.height = h;
		this.rootElement.setAttribute( "viewBox", `0 0 ${ w } ${ h }` );
	},
	render( data, offset, duration ) {
		const root = this.rootElement,
			w = this.width,
			h = this.height,
			off = offset || 0,
			dur = duration || data.duration,
			secW = w / dur,
			rowH = h / data.nbRows;

		this.empty();
		data.samples.forEach( smp => {
			const rectX = ( smp.when - off ) * secW,
				rectW = smp.duration * secW;

			if ( rectX + rectW > 0 && rectX < w ) {
				const rect = document.createElementNS( SVGURL, "rect" );

				rect.setAttribute( "x", `${ rectX }px` );
				rect.setAttribute( "y", `${ smp.row * rowH }px` );
				rect.setAttribute( "width", `${ rectW }px` );
				rect.setAttribute( "height", `${ rowH }px` );
				root.append( rect );
			}
		} );
	}
};
