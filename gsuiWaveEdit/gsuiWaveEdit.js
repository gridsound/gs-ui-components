"use strict";

class gsuiWaveEdit extends gsui0ne {
	#waveNull = true;
	static #waveDefault = GSUdeepFreeze( {
		0: { x: 0, y: 0 },
		1: { x: 1, y: 0 },
	} );

	constructor() {
		super( {
			$cmpName: "gsuiWaveEdit",
			$tagName: "gsui-wave-edit",
			$elements: {
				$dotline: "gsui-dotline",
			},
		} );
		Object.seal( this );
		this.$init();
		GSUlistenEvents( this, {
			gsuiDotline: {
				input: d => {
					d.component = "gsuiWaveEdit";
					return true;
				},
				change: d => {
					if ( this.#waveNull ) {
						d.args[ 0 ] = GSUdeepAssign( GSUdeepCopy( gsuiWaveEdit.#waveDefault ), d.args[ 0 ] );
						this.#waveNull = false;
					}
					d.component = "gsuiWaveEdit";
					return true;
				},
			},
		} );
	}

	// .........................................................................
	$init() {
		if ( this.#waveNull ) {
			this.$elements.$dotline.$change( gsuiWaveEdit.#waveDefault );
			this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
			this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		}
	}
	$change( obj ) {
		this.#waveNull = false;
		this.$elements.$dotline.$change( obj );
	}
	$clear() {
		this.#waveNull = true;
		this.$elements.$dotline.$clear();
	}
}

GSUdefineElement( "gsui-wave-edit", gsuiWaveEdit );
