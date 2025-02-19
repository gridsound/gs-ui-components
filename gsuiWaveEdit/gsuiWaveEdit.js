"use strict";

class gsuiWaveEdit extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiWaveEdit",
			$tagName: "gsui-wave-edit",
			$elements: {
				$dotline: "gsui-dotline",
			},
			$attributes: {
			},
		} );
		Object.seal( this );
		this.$elements.$dotline.$change( {
			0: { x:    0, y: 50 },
			1: { x:  100, y: 50 },
		} );
		this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		GSUlistenEvents( this, {
			xxxx: {
				xxxx: d => {
					//
				},
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "xxxx" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "xxxx":
				//
				break;
		}
	}

	// .........................................................................
}

GSUdefineElement( "gsui-wave-edit", gsuiWaveEdit );
