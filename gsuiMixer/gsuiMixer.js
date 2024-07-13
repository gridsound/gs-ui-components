"use strict";

class gsuiMixer extends gsui0ne {
	#shadowChans = null;
	#shadowEffects = null;

	constructor() {
		super( {
			$cmpName: "gsuiMixer",
			$tagName: "gsui-mixer",
			$elements: {
				$channels: "gsui-channels",
				$effects: "gsui-effects",
				$analyserType: ".gsuiMixer-analyserTypes-labels",
			},
			$attributes: {
				analyser: "hz",
			},
		} );
		Object.seal( this );
		this.$elements.$analyserType.onclick = () => {
			const type = GSUgetAttribute( this, "analyser" ) === "hz" ? "td" : "hz";

			GSUsetAttribute( this, "analyser", type );
			this.$dispatch( "changeAnalyser", type );
		};
	}

	// .........................................................................
	$connected() {
		this.#shadowChans = new gsuiScrollShadow( {
			scrolledElem: this.querySelector( ".gsuiChannels-panChannels" ),
			leftShadow: this.querySelector( ".gsuiChannels-panMain" ),
			rightShadow: this.querySelector( ".gsuiMixer-effects" ),
		} );
		this.#shadowEffects = new gsuiScrollShadow( {
			scrolledElem: this.$elements.$effects,
			topShadow: this.querySelector( ".gsuiMixer-effects .gsuiMixer-head" ),
		} );
	}
	$disconnected() {
		this.#shadowChans.$disconnected();
		this.#shadowEffects.$disconnected();
	}
	static get observedAttributes() {
		return [ "analyser" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "analyser":
				this.$elements.$channels.$setAnalyserType( val );
				break;
		}
	}

	// .........................................................................
	$getChannels() { return this.$elements.$channels; }
	$getEffects() { return this.$elements.$effects; }
}

GSUdefineElement( "gsui-mixer", gsuiMixer );
