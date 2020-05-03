"use strict";

class gsuiSVGDefs {
	constructor() {
		const svg = gsuiSVGDefs.create( "svg" );

		this.rootElement = svg;
		this._defs = new Map();
		this._idPref = `gsuiSVGDefs_${ gsuiSVGDefs._id++ }_`;
		this._elDefs = gsuiSVGDefs.create( "defs" );
		this._optResolution = 0;
		this._w =
		this._h = 0;
		Object.seal( this );

		svg.style.display = "none";
		svg.classList.add( "gsuiSVGDefs" );
		svg.append( this._elDefs );
		document.body.prepend( svg );
	}

	static create( elem ) {
		return document.createElementNS( "http://www.w3.org/2000/svg", elem );
	}

	setDefaultViewbox( w, h ) {
		this._w = w;
		this._h = h;
	}
	empty() {
		this._defs.forEach( def => def.g.remove() );
		this._defs.clear();
	}
	delete( id ) {
		this._defs.get( id ).g.remove();
		this._defs.delete( id );
	}
	add( id, w = 0, h = 0, ...elems ) {
		if ( this._defs.has( id ) ) {
			console.error( `gsuiSVGDefs: ID "${ id }" already used` );
		} else {
			const g = gsuiSVGDefs.create( "g" );

			g.id = `${ this._idPref }${ id }`;
			g.append( ...elems );
			this._elDefs.append( g );
			this._defs.set( id, { g, w, h } );
		}
	}
	update( id, w, h, ...elems ) {
		const def = this._defs.get( id ),
			g = def.g;

		def.w = w;
		def.h = h;
		while ( g.lastChild ) {
			g.lastChild.remove();
		}
		g.append( ...elems );
	}
	createSVG( id ) {
		const svg = gsuiSVGDefs.create( "svg" ),
			use = gsuiSVGDefs.create( "use" ),
			def = this._defs.get( id ) || {},
			viewBox = `0 0 ${ def.w || this._w } ${ def.h || this._h }`;

		svg.dataset.id = id;
		use.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this._idPref }${ id }` );
		svg.setAttribute( "viewBox", viewBox );
		svg.setAttribute( "preserveAspectRatio", "none" );
		svg.append( use );
		return svg;
	}
	setSVGViewbox( svg, x, w ) {
		const h = this._defs.get( svg.dataset.id ).h;

		svg.setAttribute( "viewBox", `${ x } 0 ${ w } ${ h }` );
	}
}

gsuiSVGDefs._id = 0;
