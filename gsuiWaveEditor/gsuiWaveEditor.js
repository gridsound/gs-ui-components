"use strict";

class gsuiWaveEditor extends gsui0ne {
	#gridSize = [ 1, 1 ];

	constructor() {
		super( {
			$cmpName: "gsuiWaveEditor",
			$tagName: "gsui-wave-editor",
			$elements: {
				$gridVal: "[].gsuiWaveEditor-tool-gridSize span",
				$gridSli: "[].gsuiWaveEditor-tool-gridSize gsui-slider",
				$beatlines: "[].gsuiWaveEditor-wave gsui-beatlines",
			},
			$attributes: {
				"grid-x": 1,
				"grid-y": 1,
			}
		} );
		Object.seal( this );
		GSUlistenEvents( this, {
			gsuiSlider: {
				input: ( d, t ) => GSUdomSetAttr( this, GSUdomGetAttr( t.parentNode, "dir" ) === "x" ? "grid-x" : "grid-y", d.args[ 0 ] ),
			},
		} );
	}

	// .........................................................................
	$onresize() {
		this.#updateBeatlines( 0, GSUdomGetAttrNum( this, "grid-x" ) );
		this.#updateBeatlines( 1, GSUdomGetAttrNum( this, "grid-y" ) );
	}
	$firstTimeConnected() {
		GSUdomRmAttr( this.$elements.$beatlines[ 0 ], "coloredbeats" );
		GSUdomRmAttr( this.$elements.$beatlines[ 1 ], "coloredbeats" );
	}
	static get observedAttributes() {
		return [ "grid-x", "grid-y" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "grid-x": this.#updateGridSize( 0, val ); break;
			case "grid-y": this.#updateGridSize( 1, val ); break;
		}
	}

	// .........................................................................
	#updateBeatlines( dir, sz ) {
		const bl = this.$elements.$beatlines[ dir ];
		const blSize = dir ? bl.clientHeight : bl.clientWidth;

		GSUdomSetAttr( bl, "pxperbeat", blSize );
		GSUdomSetAttr( bl, "timedivision", `1/${ sz }` );
	}
	#updateGridSize( dir, val ) {
		this.#gridSize[ dir ] = +val;
		this.$elements.$gridVal[ dir ].textContent = val;
		this.#updateBeatlines( dir, val );
		GSUdomSetAttr( this.$elements.$gridSli[ dir ], "value", val );
	}
}

GSUdefineElement( "gsui-wave-editor", gsuiWaveEditor );
