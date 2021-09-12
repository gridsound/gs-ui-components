"use strict";

class gsuiBeatlines extends HTMLElement {
	static get observedAttributes() {
		return [ "vertical", "timedivision", "pxperbeat", "coloredbeats" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "vertical":
				case "timedivision":
				case "coloredbeats":
					this.style.backgroundImage = gsuiBeatlines.#background(
						this.hasAttribute( "vertical" ) ? 180 : 90,
						...( this.getAttribute( "timedivision" ) || "4/4" ).split( "/" ),
						this.hasAttribute( "coloredbeats" ) );
					break;
				case "pxperbeat":
					this.style.fontSize = `${ val }px`;
					this.style.opacity = Math.min( val / 48, 1 );
					break;
			}
		}
	}

	// .........................................................................
	static #background( deg, bPM, sPB, colored ) {
		return `
			${ gsuiBeatlines.#repeat( deg, ".5px", "rgba(0,0,0,.15)", 1 / sPB ) },
			${ gsuiBeatlines.#repeat( deg, ".5px", "rgba(0,0,0,.25)", 1 ) },
			${ gsuiBeatlines.#repeat( deg, "1px", "rgba(0,0,0,.5)", bPM ) }
			${ colored
				? `,repeating-linear-gradient(${ deg }deg, rgba(0,0,0,.08), rgba(0,0,0,.08) 1em, transparent 1em, transparent 2em)`
				: "" }
		`;
	}
	static #repeat( deg, w, col, em ) {
		return `repeating-linear-gradient(${ deg }deg, ${ col }, ${ col } ${ w }, transparent ${ w }, transparent calc(${ em }em - ${ w }), ${ col } calc(${ em }em - ${ w }), ${ col } ${ em }em)`;
	}
}

Object.freeze( gsuiBeatlines );
customElements.define( "gsui-beatlines", gsuiBeatlines );
