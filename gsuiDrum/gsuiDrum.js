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
				this.$this.$left( val, "em" );
				break;
			case "duration":
				this.$this.$width( val, "em" );
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
		this.$this.$query( `.gsuiDrum-prop[data-value="${ prop }"]` ).$child( 0 ).$css( st );
	}
}

GSUdomDefine( "gsui-drum", gsuiDrum );
