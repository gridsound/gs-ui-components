"use strict";

class gsuiSVGDefs {
	constructor() {
		const svg = gsuiSVGDefs.create( "svg" );

		this.rootElement = svg;
		this._defs = new Map();
		this._elDefs = gsuiSVGDefs.create( "defs" );
		Object.freeze( this );

		svg.style.display = "none";
		svg.classList.add( "gsuiSVGDefs" );
		svg.append( this._elDefs );
		document.body.prepend( svg );
	}

	static create( elem ) {
		return document.createElementNS( "http://www.w3.org/2000/svg", elem );
	}

	empty() {
		this._defs.forEach( def => def.g.remove() );
		this._defs.clear();
	}
	delete( id ) {
		this._defs.get( id ).g.remove();
		this._defs.delete( id );
	}
	add( id, w, h, ...elems ) {
		const g = gsuiSVGDefs.create( "g" );

		g.id = `gsuiSVGDefs_${ id }`;
		g.append( ...elems );
		this._elDefs.append( g );
		this._defs.set( id, { g, w, h } );
	}
	createSVG( id ) {
		const def = this._defs.get( id );

		if ( def ) {
			const svg = gsuiSVGDefs.create( "svg" ),
				use = gsuiSVGDefs.create( "use" );

			svg.dataset.id = id;
			use.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#gsuiSVGDefs_${ id }` );
			svg.setAttribute( "viewBox", `0 0 ${ def.w } ${ def.h }` );
			svg.setAttribute( "preserveAspectRatio", "none" );
			svg.append( use );
			return svg;
		}
	}
	setSVGViewbox( svg, x, w ) {
		const h = this._defs.get( svg.dataset.id ).h;

		svg.setAttribute( "viewBox", `${ x } 0 ${ w } ${ h }` );
	}
}
