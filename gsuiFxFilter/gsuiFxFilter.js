"use strict";

class gsuiFxFilter extends HTMLElement {
	$askData = GSUI.$noop;
	#nyquist = 24000;
	#attached = false;
	#currType = "lowpass";
	#onresizeBind = this.#onresize.bind( this );
	#fnValue = {
		Q: a => a,
		gain: a => a,
		detune: a => a,
		frequency: a => this.#nyquist * ( 2 ** ( a * 11 - 11 ) ),
	};
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiFxFilter" );
	#children = GSUI.$getTemplate( "gsui-fx-filter" );
	#elements = GSUI.$findElements( this.#children, {
		type: ".gsuiFxFilter-areaType .gsuiFxFilter-area-content",
		graph: ".gsuiFxFilter-areaGraph .gsuiFxFilter-area-content",
		curves: "gsui-curves",
		sliders: {
			Q: ".gsuiFxFilter-areaQ gsui-slider",
			gain: ".gsuiFxFilter-areaGain gsui-slider",
			detune: ".gsuiFxFilter-areaDetune gsui-slider",
			frequency: ".gsuiFxFilter-areaFrequency gsui-slider",
		},
	} );
	static typeGainQ = Object.freeze( {
		lowpass:   Object.freeze( { gain: false, q: true } ),
		highpass:  Object.freeze( { gain: false, q: true } ),
		bandpass:  Object.freeze( { gain: false, q: true } ),
		lowshelf:  Object.freeze( { gain: true,  q: false } ),
		highshelf: Object.freeze( { gain: true,  q: false } ),
		peaking:   Object.freeze( { gain: true,  q: true } ),
		notch:     Object.freeze( { gain: false, q: true } ),
		allpass:   Object.freeze( { gain: false, q: true } ),
	} );

	constructor() {
		super();
		Object.seal( this );

		this.#elements.type.onclick = this.#onclickType.bind( this );
		GSUI.$listenEvents( this, {
			gsuiSlider: {
				inputStart: GSUI.$noop,
				inputEnd: GSUI.$noop,
				input: ( d, sli ) => {
					this.#oninputProp( sli.dataset.prop, this.#fnValue[ sli.dataset.prop ]( d.args[ 0 ] ) );
				},
				change: ( d, sli ) => {
					this.#dispatch( "changeProp", sli.dataset.prop, this.#fnValue[ sli.dataset.prop ]( d.args[ 0 ] ) );
				},
			},
		} );
		this.#elements.graph.append( this.#elements.curves );
	}

	// .........................................................................
	connectedCallback() {
		this.#attached = true;
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			this.#onresize();
			this.$updateWave();
		}
		GSUI.$observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		this.#attached = false;
		GSUI.$unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "type", "frequency", "q", "gain", "detune" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "type": {
					const gainQ = gsuiFxFilter.typeGainQ[ val ];

					this.#toggleTypeBtn( this.#currType, false );
					this.#toggleTypeBtn( val, true );
					this.#currType = val;
					GSUI.$setAttribute( this.#elements.sliders.Q, "disabled", !gainQ.q );
					GSUI.$setAttribute( this.#elements.sliders.gain, "disabled", !gainQ.gain );
				} break;
				case "q":
					this.#elements.sliders.Q.setValue( +val );
					break;
				case "gain":
				case "detune":
					this.#elements.sliders[ prop ].setValue( +val );
					break;
				case "frequency":
					this.#elements.sliders.frequency.setValue( ( Math.log2( val / this.#nyquist ) + 11 ) / 11 );
					break;
			}
		}
	}

	// .........................................................................
	$toggle( b ) {
		this.classList.toggle( "gsuiFxFilter-enable", b );
		setTimeout( () => this.$updateWave(), 150 );
	}
	$updateWave() {
		if ( this.#attached ) {
			const curve = this.$askData( "curve", this.#elements.curves.getWidth() );

			if ( curve ) {
				this.#elements.curves.setCurve( "0", curve );
			}
		}
	}

	// .........................................................................
	#toggleTypeBtn( type, b ) {
		this.#elements.type.querySelector( `[data-type="${ type }"]` )
			.classList.toggle( "gsuiFxFilter-areaType-btnSelected", b );
	}

	// .........................................................................
	#onresize() {
		this.#elements.curves.resized();
	}
	#oninputProp( prop, val ) {
		this.#dispatch( "liveChange", prop, val );
		this.$updateWave();
	}
	#onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !e.target.classList.contains( "gsuiFxFilter-areaType-btnSelected" ) ) {
			this.#dispatch( "changeProp", "type", type );
		}
	}
}

Object.freeze( gsuiFxFilter );
customElements.define( "gsui-fx-filter", gsuiFxFilter );
