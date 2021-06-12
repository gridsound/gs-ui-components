"use strict";

class gsuiFxFilter extends HTMLElement {
	#nyquist = 24000
	#attached = false
	#currType = "lowpass"
	#onresizeBind = this.#onresize.bind( this )
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiFxFilter" )
	#children = GSUI.getTemplate( "gsui-fx-filter" )
	#elements = GSUI.findElements( this.#children, {
		type: ".gsuiFxFilter-areaType .gsuiFxFilter-area-content",
		graph: ".gsuiFxFilter-areaGraph .gsuiFxFilter-area-content",
		curves: "gsui-curves",
		sliders: {
			Q: ".gsuiFxFilter-areaQ gsui-slider",
			gain: ".gsuiFxFilter-areaGain gsui-slider",
			detune: ".gsuiFxFilter-areaDetune gsui-slider",
			frequency: ".gsuiFxFilter-areaFrequency gsui-slider",
		},
	} )

	constructor() {
		super();
		this.askData = GSUI.noop;
		Object.seal( this );

		this.#elements.type.onclick = this.#onclickType.bind( this );
		this.#elements.graph.append( this.#elements.curves );
		this.#initSlider( "Q" );
		this.#initSlider( "gain" );
		this.#initSlider( "detune" );
		this.#initSlider( "frequency", this.#frequencyPow.bind( this ) );
	}

	// .........................................................................
	connectedCallback() {
		this.#attached = true;
		if ( this.#children ) {
			this.classList.add( "gsuiFxFilter" );
			this.append( ...this.#children );
			this.#children = null;
			this.#onresize();
			this.updateWave();
		}
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		this.#attached = false;
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
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
					this.#elements.sliders.Q.enable( gainQ.q );
					this.#elements.sliders.gain.enable( gainQ.gain );
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
	setNyquist( n ) {
		this.#nyquist = n;
	}
	toggle( b ) {
		this.classList.toggle( "gsuiFxFilter-enable", b );
		setTimeout( () => this.updateWave(), 150 );
	}
	updateWave() {
		if ( this.#attached ) {
			const curve = this.askData( "curve", this.#elements.curves.getWidth() );

			if ( curve ) {
				this.#elements.curves.setCurve( "0", curve );
			}
		}
	}

	// .........................................................................
	#frequencyPow( Hz ) {
		return this.#nyquist * ( 2 ** ( Hz * 11 - 11 ) );
	}
	#initSlider( prop, fnValue = a => a ) {
		const slider = this.#elements.sliders[ prop ];

		slider.oninput = val => this.#oninputProp( prop, fnValue( val ) );
		slider.onchange = val => this.#dispatch( "changeProp", prop, fnValue( val ) );
	}
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
		this.updateWave();
	}
	#onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !e.target.classList.contains( "gsuiFxFilter-areaType-btnSelected" ) ) {
			this.#dispatch( "changeProp", "type", type );
		}
	}
}

gsuiFxFilter.typeGainQ = Object.freeze( {
	lowpass:   Object.freeze( { gain: false, q: true } ),
	highpass:  Object.freeze( { gain: false, q: true } ),
	bandpass:  Object.freeze( { gain: false, q: true } ),
	lowshelf:  Object.freeze( { gain: true,  q: false } ),
	highshelf: Object.freeze( { gain: true,  q: false } ),
	peaking:   Object.freeze( { gain: true,  q: true } ),
	notch:     Object.freeze( { gain: false, q: true } ),
	allpass:   Object.freeze( { gain: false, q: true } ),
} );

customElements.define( "gsui-fx-filter", gsuiFxFilter );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "filter", { cmp: gsuiFxFilter, name: "Filter", height: 160 } );
}
