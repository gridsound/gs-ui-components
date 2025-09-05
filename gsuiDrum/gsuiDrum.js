"use strict";

class gsuiDrum extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiDrum",
			$tagName: "gsui-drum",
		} );
		Object.seal( this );
	}

	static get observedAttributes() {
		return [ "when", "duration", "gain", "pan", "detune" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "when":
				this.style.left = `${ val }em`;
				break;
			case "duration":
				this.style.width = `${ val }em`;
				break;
			case "pan":
			case "gain":
			case "detune":
				this.#changeProp( prop, +val );
				break;
		}
	}

	// .........................................................................
	#changeProp( prop, val ) {
		const st = {};

		switch ( prop ) {
			case "detune":
				st.left = val > 0 ? "50%" : `${ ( 1 + val / 12 ) * 50 }%`;
				st.width = `${ Math.abs( val / 12 ) * 50 }%`;
				break;
			case "pan":
				st.left = val > 0 ? "50%" : `${ ( 1 + val ) * 50 }%`;
				st.width = `${ Math.abs( val ) * 50 }%`;
				break;
			case "gain":
				st.left = 0;
				st.width = `${ val * 100 }%`;
				break;
		}
		GSUdomStyle( GSUdomQS( this, `.gsuiDrum-prop[data-value="${ prop }"]` ).firstChild, st );
	}
}

GSUdomDefine( "gsui-drum", gsuiDrum );
