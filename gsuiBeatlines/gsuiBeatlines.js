"use strict";

class gsuiBeatlines extends HTMLElement {
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...GSUI.$getTemplate( "gsui-beatlines" ) );
			GSUI.$recallAttributes( this, {
				timedivision: "4/4",
				coloredbeats: true,
				pxperbeat: 10,
			} );
		}
	}
	static get observedAttributes() {
		return [ "timedivision", "pxperbeat" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "timedivision":
					this.style.setProperty( "--gsui-bPM", `${ val.split( "/" )[ 0 ] }em` );
					this.style.setProperty( "--gsui-sPB", `${ 1 / val.split( "/" )[ 1 ] }em` );
					break;
				case "pxperbeat":
					this.style.fontSize = `${ val }px`;
					this.style.opacity = Math.min( val / 48, 1 );
					break;
			}
		}
	}
}

Object.freeze( gsuiBeatlines );
customElements.define( "gsui-beatlines", gsuiBeatlines );
