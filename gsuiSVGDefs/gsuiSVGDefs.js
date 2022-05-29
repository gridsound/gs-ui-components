"use strict";

class gsuiSVGDefs {
	static #id = 0;
	#idPref = `gsuiSVGDefs_${ gsuiSVGDefs.#id++ }_`;
	#elDefs = GSUI.$createElementSVG( "defs" );
	#defs = new Map();
	#w = 1;
	#h = 1;

	constructor() {
		const svg = GSUI.$createElementSVG( "svg" );

		this.rootElement = svg;
		Object.freeze( this );

		svg.style.display = "none";
		svg.classList.add( "gsuiSVGDefs" );
		svg.append( this.#elDefs );
		document.body.prepend( svg );
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
			const g = GSUI.$createElementSVG( "g" );

			g.id = `${ this.#idPref }${ id }`;
			g.append( ...elems );
			this.#elDefs.append( g );
			this.#defs.set( id, { g, w, h } );
		}
	}
	update( id, w, h, ...elems ) {
		const def = this.#defs.get( id );

		def.w = w;
		def.h = h;
		GSUI.$emptyElement( def.g );
		def.g.append( ...elems );
	}
	createSVG( id ) {
		const def = this.#defs.get( id ) || {};
		const use = GSUI.$createElementSVG( "use" );
		const svg = GSUI.$createElementSVG( "svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${ def.w || this.#w } ${ def.h || this.#h }`,
		}, use );

		svg.dataset.id = id;
		use.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this.#idPref }${ id }` );
		return svg;
	}
	setSVGViewbox( svg, x, w ) {
		const h = this.#defs.get( svg.dataset.id ).h;

		GSUI.$setAttribute( svg, "viewBox", `${ x } 0 ${ w } ${ h }` );
	}
}

Object.freeze( gsuiSVGDefs );
