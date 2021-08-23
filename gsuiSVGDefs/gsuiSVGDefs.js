"use strict";

class gsuiSVGDefs {
	static #id = 0
	#idPref = `gsuiSVGDefs_${ gsuiSVGDefs.#id++ }_`
	#elDefs = gsuiSVGDefs.create( "defs" )
	#defs = new Map()
	#w = 0
	#h = 0

	constructor() {
		const svg = gsuiSVGDefs.create( "svg" );

		this.rootElement = svg;
		this.optResolution = 0;
		Object.seal( this );

		svg.style.display = "none";
		svg.classList.add( "gsuiSVGDefs" );
		svg.append( this.#elDefs );
		document.body.prepend( svg );
	}

	static create( elem ) {
		return document.createElementNS( "http://www.w3.org/2000/svg", elem );
	}

	setDefaultViewbox( w, h ) {
		this.#w = w;
		this.#h = h;
	}
	empty() {
		this.#defs.forEach( def => def.g.remove() );
		this.#defs.clear();
	}
	delete( id ) {
		this.#defs.get( id ).g.remove();
		this.#defs.delete( id );
	}
	add( id, w = 0, h = 0, ...elems ) {
		if ( this.#defs.has( id ) ) {
			console.error( `gsuiSVGDefs: ID "${ id }" already used` );
		} else {
			const g = gsuiSVGDefs.create( "g" );

			g.id = `${ this.#idPref }${ id }`;
			g.append( ...elems );
			this.#elDefs.append( g );
			this.#defs.set( id, { g, w, h } );
		}
	}
	update( id, w, h, ...elems ) {
		const def = this.#defs.get( id ),
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
			def = this.#defs.get( id ) || {},
			viewBox = `0 0 ${ def.w || this.#w } ${ def.h || this.#h }`;

		svg.dataset.id = id;
		use.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this.#idPref }${ id }` );
		svg.setAttribute( "viewBox", viewBox );
		svg.setAttribute( "preserveAspectRatio", "none" );
		svg.append( use );
		return svg;
	}
	setSVGViewbox( svg, x, w ) {
		const h = this.#defs.get( svg.dataset.id ).h;

		svg.setAttribute( "viewBox", `${ x } 0 ${ w } ${ h }` );
	}
}
