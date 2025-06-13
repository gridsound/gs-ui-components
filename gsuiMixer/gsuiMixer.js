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
		GSUlistenEvents( this, {
			gsuiChannels: {
				nbChannelsChange: () => {
					this.#shadowChans.$update();
				},
			},
			gsuiEffect: {
				expand: () => {
					GSUsetTimeout( () => this.#shadowEffects.$update(), .1 );
				},
			},
		} );
	}

	// .........................................................................
	$connected() {
		this.#shadowChans = new gsuiScrollShadow( {
			scrolledElem: GSUdomQS( this, ".gsuiChannels-panChannels" ),
			leftShadow: GSUdomQS( this, ".gsuiChannels-panMain" ),
			rightShadow: GSUdomQS( this, ".gsuiMixer-effects" ),
		} );
		this.#shadowEffects = new gsuiScrollShadow( {
			scrolledElem: this.$elements.$effects,
			topShadow: GSUdomQS( this, ".gsuiMixer-effects .gsuiMixer-head" ),
			bottomShadow: GSUdomQS( this, ".gsuiMixer-effects .gsuiMixer-bottomShadow" ),
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
