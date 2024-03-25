"use strict";

class gsuiMixer extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiMixer",
			$tagName: "gsui-mixer",
			$elements: {
				$channels: "gsui-channels",
				$effects: "gsui-effects",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		new gsuiScrollShadow( {
			scrolledElem: this.querySelector( ".gsuiChannels-panChannels" ),
			leftShadow: this.querySelector( ".gsuiChannels-panMain" ),
			rightShadow: this.querySelector( ".gsuiMixer-effects" ),
		} );
		new gsuiScrollShadow( {
			scrolledElem: this.$elements.$effects,
			topShadow: this.querySelector( ".gsuiMixer-effects .gsuiMixer-head" ),
		} );
	}

	// .........................................................................
	$getChannels() {
		return this.$elements.$channels;
	}
	$getEffects() {
		return this.$elements.$effects;
	}
}

Object.freeze( gsuiMixer );
customElements.define( "gsui-mixer", gsuiMixer );
