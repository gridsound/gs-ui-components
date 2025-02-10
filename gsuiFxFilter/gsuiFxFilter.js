"use strict";

class gsuiFxFilter extends gsui0ne {
	$askData = GSUnoop;
	#nyquist = 24000;
	#currType = "lowpass";
	#fnValue = {
		Q: a => a,
		gain: a => a,
		detune: a => a,
		frequency: a => GSUXtoHz( a ) * this.#nyquist,
	};
	static typeGainQ = {
		lowpass:   { gain: false, q: true },
		highpass:  { gain: false, q: true },
		bandpass:  { gain: false, q: true },
		lowshelf:  { gain: true,  q: false },
		highshelf: { gain: true,  q: false },
		peaking:   { gain: true,  q: true },
		notch:     { gain: false, q: true },
		allpass:   { gain: false, q: true },
	};

	constructor() {
		super( {
			$cmpName: "gsuiFxFilter",
			$tagName: "gsui-fx-filter",
			$elements: {
				$type: ".gsuiFxFilter-areaType .gsuiFxFilter-area-content",
				$graph: ".gsuiFxFilter-areaGraph .gsuiFxFilter-area-content",
				$curves: "gsui-curves",
				$sliders: {
					Q: ".gsuiFxFilter-areaQ gsui-slider",
					gain: ".gsuiFxFilter-areaGain gsui-slider",
					detune: ".gsuiFxFilter-areaDetune gsui-slider",
					frequency: ".gsuiFxFilter-areaFrequency gsui-slider",
				},
			},
		} );
		Object.seal( this );

		this.$elements.$type.onclick = this.#onclickType.bind( this );
		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, sli ) => {
					this.#oninputProp( sli.dataset.prop, this.#fnValue[ sli.dataset.prop ]( d.args[ 0 ] ) );
				},
				change: ( d, sli ) => {
					this.$dispatch( "changeProp", sli.dataset.prop, this.#fnValue[ sli.dataset.prop ]( d.args[ 0 ] ) );
				},
			},
		} );
		this.$elements.$graph.append( this.$elements.$curves );
	}

	// .........................................................................
	$connected() {
		this.$onresize();
		this.$updateWave();
	}
	static get observedAttributes() {
		return [ "type", "frequency", "q", "gain", "detune", "off" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "off":
				setTimeout( () => this.$updateWave(), 150 );
				break;
			case "type": {
				const gainQ = gsuiFxFilter.typeGainQ[ val ];

				this.#toggleTypeBtn( this.#currType, false );
				this.#toggleTypeBtn( val, true );
				this.#currType = val;
				GSUsetAttribute( this.$elements.$sliders.Q, "disabled", !gainQ.q );
				GSUsetAttribute( this.$elements.$sliders.gain, "disabled", !gainQ.gain );
			} break;
			case "q":
				this.$elements.$sliders.Q.$setValue( +val );
				break;
			case "gain":
			case "detune":
				this.$elements.$sliders[ prop ].$setValue( +val );
				break;
			case "frequency":
				this.$elements.$sliders.frequency.$setValue( GSUHztoX( val / this.#nyquist ) );
				break;
		}
	}

	// .........................................................................
	$updateWave() {
		if ( this.$isConnected ) {
			const curve = this.$askData( "curve", this.$elements.$curves.$getWidth() );

			if ( curve ) {
				this.$elements.$curves.$setCurve( "0", curve );
			}
		}
	}

	// .........................................................................
	#toggleTypeBtn( type, b ) {
		this.$elements.$type.querySelector( `[data-type="${ type }"]` )
			.classList.toggle( "gsuiFxFilter-areaType-btnSelected", b );
	}

	// .........................................................................
	$onresize() {
		this.$elements.$curves.$resized();
	}
	#oninputProp( prop, val ) {
		this.$dispatch( "liveChange", prop, val );
		this.$updateWave();
	}
	#onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !e.target.classList.contains( "gsuiFxFilter-areaType-btnSelected" ) ) {
			this.$dispatch( "changeProp", "type", type );
		}
	}
}

GSUdefineElement( "gsui-fx-filter", gsuiFxFilter );
