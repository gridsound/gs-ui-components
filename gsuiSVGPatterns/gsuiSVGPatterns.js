"use strict";

class gsuiSVGPatterns {
	static #SVGs = Object.freeze( {
		$keys: gsuiSVGPatterns.#initSVG( "SVG_Keys_" ),
		$drums: gsuiSVGPatterns.#initSVG( "SVG_Drums_" ),
		$slices: gsuiSVGPatterns.#initSVG( "SVG_Slices_" ),
		$buffer: gsuiSVGPatterns.#initSVG( "SVG_Buffer_" ),
		$bufferHD: gsuiSVGPatterns.#initSVG( "SVG_BufferHD_" ),
	} );

	static #initSVG( pref ) {
		const defs = GSUI.$createElementSVG( "defs" );
		const svg = GSUI.$createElementSVG( "svg", { class: "gsuiSVGPatterns", style: "display:none" }, defs );

		document.body.prepend( svg );
		return Object.freeze( {
			$defs: defs,
			$prefix: pref,
			$map: new Map(),
		} );
	}

	// .........................................................................
	static $clear() {
		gsuiSVGPatterns.#clearDefs( gsuiSVGPatterns.#SVGs.$keys.$map );
		gsuiSVGPatterns.#clearDefs( gsuiSVGPatterns.#SVGs.$drums.$map );
		gsuiSVGPatterns.#clearDefs( gsuiSVGPatterns.#SVGs.$slices.$map );
		gsuiSVGPatterns.#clearDefs( gsuiSVGPatterns.#SVGs.$buffer.$map );
		gsuiSVGPatterns.#clearDefs( gsuiSVGPatterns.#SVGs.$bufferHD.$map );
	}
	static #clearDefs( map ) {
		map.forEach( def => def.g.remove() );
		map.clear();
	}

	// .........................................................................
	static $setSVGViewbox( type, svg, offset, dur, bps ) {
		switch ( type ) {
			case "buffer": return gsuiSVGPatterns.#setSVGViewbox( type, svg, x * ( 48 / bps ), w * ( 48 / bps ) );
			case "bufferHD": return gsuiSVGPatterns.#setSVGViewbox( type, svg, x * 260, w * 260 );
			default: return gsuiSVGPatterns.#setSVGViewbox( type, svg, offset, dur );
		}
	}
	static #setSVGViewbox( type, svg, x, w ) {
		const h = gsuiSVGPatterns.#getList( type ).$map.get( svg.dataset.id ).h;

		GSUI.$setAttribute( svg, "viewBox", `${ x } 0 ${ w } ${ h }` );
	}
	static $createSVG( type, id ) {
		const SVG = gsuiSVGPatterns.#getList( type );
		const def = SVG.$map.get( id ) || {};
		const use = GSUI.$createElementSVG( "use" );
		const svg = GSUI.$createElementSVG( "svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${ def.w || 260 } ${ def.h || 48 }`,
			"data-id": id,
		}, use );

		use.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ SVG.$prefix }${ id }` );
		return svg;
	}
	static $add( type, id ) {
		const SVG = gsuiSVGPatterns.#getList( type );

		if ( SVG.$map.has( id ) ) {
			console.error( `gsuiSVGPatterns: ID "${ id }" already used` );
		} else {
			const g = GSUI.$createElementSVG( "g", { id: `${ SVG.$prefix }${ id }` } );

			SVG.$map.set( id, { g, w: 0, h: 0 } );
			SVG.$defs.append( g );
		}
	}
	static $delete( type, id ) {
		const map = gsuiSVGPatterns.#getList( type ).$map;

		map.get( id ).g.remove();
		map.delete( id );
	}
	static $update( type, id, data, dur, svg ) {
		if ( type === "buffer" ) {
			gsuiSVGPatterns.#update( "buffer", id, data );
			gsuiSVGPatterns.#update( "bufferHD", id, data );
		} else {
			gsuiSVGPatterns.#update( type, id, data, dur );
			gsuiSVGPatterns.$setSVGViewbox( type, svg, 0, dur )
		}
	}
	static #update( type, id, data, dur ) {
		const def = gsuiSVGPatterns.#getList( type ).$map.get( id );

		switch ( type ) {
			case "keys": return gsuiSVGPatterns.#update2( def, id, dur, 1, ...gsuiSVGPatternsKeys.$render( data ) );
			case "drums": return gsuiSVGPatterns.#update2( def, id, dur, 1, ...gsuiSVGPatternsDrums.$render( ...data ) );
			case "slices": return gsuiSVGPatterns.#update2( def, id, dur, 1, ...gsuiSVGPatternsSlices.$render( data, dur ) );
			case "buffer":
			case "bufferHD": {
				const polygon = GSUI.$createElementSVG( "polygon" );
				const w = type === "buffer" ? data.duration * 48 | 0 : 260;

				gsuiWaveform.drawBuffer( polygon, w, 48, data );
				return gsuiSVGPatterns.#update2( def, id, w, 48, polygon );
			}
		}
	}
	static #update2( def, id, w, h, ...elems ) {
		def.w = w;
		def.h = h;
		GSUI.$emptyElement( def.g );
		def.g.append( ...elems );
	}

	// .........................................................................
	static #getList( type ) {
		switch ( type ) {
			case "keys": return gsuiSVGPatterns.#SVGs.$keys;
			case "drums": return gsuiSVGPatterns.#SVGs.$drums;
			case "slices": return gsuiSVGPatterns.#SVGs.$slices;
			case "buffer": return gsuiSVGPatterns.#SVGs.$buffer;
			case "bufferHD": return gsuiSVGPatterns.#SVGs.$bufferHD;
		}
	}
}
