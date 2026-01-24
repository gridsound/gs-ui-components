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
		this.$elements.$analyserType.$on( "click", () => {
			const type = this.$this.$getAttr( "analyser" ) === "hz" ? "td" : "hz";

			this.$this.$setAttr( "analyser", type )
				.$dispatch( GSEV_MIXER_CHANGEANALYSER, type );
		} );
		GSUdomListen( this, {
			[ GSEV_CHANNELS_NBCHANNELSCHANGE ]: () => this.#shadowChans.$update(),
			[ GSEV_EFFECT_EXPAND ]: () => GSUsetTimeout( () => this.#shadowEffects.$update(), .1 ),
		} );
	}

	// .........................................................................
	$connected() {
		this.#shadowChans = new gsuiScrollShadow( {
			scrolledElem: $( this, ".gsuiChannels-panChannels" ).$get( 0 ),
			leftShadow: $( this, ".gsuiChannels-panMain" ).$get( 0 ),
			rightShadow: $( this, ".gsuiMixer-effects" ).$get( 0 ),
		} );
		this.#shadowEffects = new gsuiScrollShadow( {
			scrolledElem: this.$elements.$effects.$get( 0 ),
			topShadow: $( this, ".gsuiMixer-effects .gsuiMixer-head" ).$get( 0 ),
			bottomShadow: $( this, ".gsuiMixer-effects .gsuiMixer-bottomShadow" ).$get( 0 ),
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
				this.$elements.$channels.$get( 0 ).$setAnalyserType( val );
				break;
		}
	}

	// .........................................................................
	$getChannels() { return this.$elements.$channels.$get( 0 ); }
	$getEffects() { return this.$elements.$effects.$get( 0 ); }
}

GSUdomDefine( "gsui-mixer", gsuiMixer );
