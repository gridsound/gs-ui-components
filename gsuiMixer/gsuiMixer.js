"use strict";

class gsuiMixer extends gsui0ne {
	#shadowChans = null;
	#shadowEffects = null;

	constructor() {
		super( {
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
		this.$elements.$analyserType.$onclick( () => {
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
			scrolledElem: this.$this.$query( ".gsuiChannels-panChannels" ),
			leftShadow: this.$this.$query( ".gsuiChannels-panMain" ),
			rightShadow: this.$this.$query( ".gsuiMixer-effects" ),
		} );
		this.#shadowEffects = new gsuiScrollShadow( {
			scrolledElem: this.$elements.$effects,
			topShadow: this.$this.$query( ".gsuiMixer-effects .gsuiMixer-head" ),
			bottomShadow: this.$this.$query( ".gsuiMixer-effects .gsuiMixer-bottomShadow" ),
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
