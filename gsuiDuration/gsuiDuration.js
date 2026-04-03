"use strict";

class gsuiDuration extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-duration",
			$template: [
				GSUcreateFlex( { y: true },
					GSUcreateSpan( { inert: true }, "duration" ),
					GSUcreateElement( "gsui-slider", { type: "linear-x", min: 1, max: 8, step: 1, "mousemove-size": 300 } ),
				),
				GSUcreateB( { inert: true }, 1 ),
			],
			$elements: {
				$slider: "gsui-slider",
				$output: "b",
			},
			$attributes: {
				value: 1,
				max: 8,
			},
		} );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_CHANGE ]: ( _, dur ) => this.$this.$dispatch( GSEV_DURATION_CHANGE, dur ),
			[ GSEV_SLIDER_INPUT ]: ( _, dur ) => {
				this.#updateOutput( dur );
				this.$this.$dispatch( GSEV_DURATION_INPUT, dur );
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "value", "max" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "value":
				this.#updateOutput( val );
				this.$elements.$slider.$setAttr( "value", val );
				break;
			case "max":
				this.$elements.$slider.$setAttr( "max", val );
				break;
		}
	}

	// .........................................................................
	#updateOutput( dur ) {
		this.$elements.$output.$text( `${ dur }`.padStart( 2, "0" ) );
	}
}

GSUdomDefine( "gsui-duration", gsuiDuration );
