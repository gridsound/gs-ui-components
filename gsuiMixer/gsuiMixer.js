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
			const type = GSUdomGetAttr( this, "analyser" ) === "hz" ? "td" : "hz";

			GSUdomSetAttr( this, "analyser", type );
			GSUdomDispatch( this, GSEV_MIXER_CHANGEANALYSER, type );
		};
		GSUdomListen( this, {
			[ GSEV_CHANNELS_NBCHANNELSCHANGE ]: () => this.#shadowChans.$update(),
			[ GSEV_EFFECT_EXPAND ]: () => GSUsetTimeout( () => this.#shadowEffects.$update(), .1 ),
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

GSUdomDefine( "gsui-mixer", gsuiMixer );
