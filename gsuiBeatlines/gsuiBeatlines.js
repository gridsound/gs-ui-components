"use strict";

class gsuiBeatlines extends HTMLElement {
	connectedCallback() {
		this.classList.add( "gsuiBeatlines" );
	}
	static get observedAttributes() {
		return [ "timesignature", "pxperbeat", "coloredbeats" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "coloredbeats":
				case "timesignature":
					this.style.backgroundImage = gsuiBeatlines._background(
						...( this.getAttribute( "timesignature" ) || "4,4" ).split( "," ),
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
	static _background( bPM, sPB, colored ) {
		return `
			${ gsuiBeatlines._repeat( ".5px", "rgba(0,0,0,.15)", 1 / sPB ) },
			${ gsuiBeatlines._repeat( ".5px", "rgba(0,0,0,.25)", 1 ) },
			${ gsuiBeatlines._repeat( "1px", "rgba(0,0,0,.5)", bPM ) }
			${ colored
				? ",repeating-linear-gradient(90deg, rgba(0,0,0,.08), rgba(0,0,0,.08) 1em, transparent 1em, transparent 2em)"
				: "" }
		`;
	}
	static _repeat( w, col, em ) {
		return `repeating-linear-gradient(90deg, ${ col }, ${ col } ${ w }, transparent ${ w }, transparent calc(${ em }em - ${ w }), ${ col } calc(${ em }em - ${ w }), ${ col } ${ em }em)`;
	}
}

customElements.define( "gsui-beatlines", gsuiBeatlines );
