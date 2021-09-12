"use strict";

class gsuiOscillator extends HTMLElement {
	#timeidType = null
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiOscillator" )
	#selectWaves = {
		sine: true,
		triangle: true,
		sawtooth: true,
		square: true,
	}
	#children = GSUI.getTemplate( "gsui-oscillator" )
	#elements = GSUI.findElements( this.#children, {
		waveSelect: ".gsuiOscillator-waveSelect",
		wavePrev: ".gsuiOscillator-wavePrev",
		waveNext: ".gsuiOscillator-waveNext",
		waves: [
			"gsui-periodicwave:first-child",
			"gsui-periodicwave:last-child",
		],
		sliders: {
			pan: [ ".gsuiOscillator-pan gsui-slider", ".gsuiOscillator-pan .gsuiOscillator-sliderValue" ],
			gain: [ ".gsuiOscillator-gain gsui-slider", ".gsuiOscillator-gain .gsuiOscillator-sliderValue" ],
			detune: [ ".gsuiOscillator-detune gsui-slider", ".gsuiOscillator-detune .gsuiOscillator-sliderValue" ],
		},
		remove: ".gsuiOscillator-remove",
	} )

	constructor() {
		super();
		Object.seal( this );

		this.#elements.waves[ 0 ].frequency =
		this.#elements.waves[ 1 ].frequency = 1;
		this.#elements.waveSelect.onchange = this.#onchangeSelect.bind( this );
		this.#elements.waveSelect.onkeydown = this.#onkeydownSelect.bind( this );
		this.#elements.wavePrev.onclick = this.#onclickPrevNext.bind( this, -1 );
		this.#elements.waveNext.onclick = this.#onclickPrevNext.bind( this, 1 );
		this.#elements.remove.onclick = () => this.#dispatch( "remove" );
		GSUI.listenEvents( this, {
			gsuiSlider: {
				inputStart: GSUI.noop,
				inputEnd: GSUI.noop,
				input: ( d, sli ) => {
					this.#oninputSlider( sli.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.#onchangeSlider( sli.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			GSUI.setAttribute( this, "draggable", "true" );
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
				order: 0,
				type: "sine",
				detune: 0,
				gain: 1,
				pan: 0,
			} );
			this.updateWave();
		}
	}
	static get observedAttributes() {
		return [ "order", "type", "detune", "gain", "pan" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "order": this.#changeOrder( num ); break;
				case "type": this.#changeType( val ); break;
				case "detune":
				case "gain":
				case "pan":
					this.#changeProp( prop, num );
					break;
			}
		}
	}

	// .........................................................................
	addWaves( arr ) {
		const opts = [];

		arr.sort();
		arr.forEach( w => {
			if ( !this.#selectWaves[ w ] ) {
				const opt = document.createElement( "option" );

				this.#selectWaves[ w ] = true;
				opt.value = w;
				opt.className = "gsuiOscillator-waveOpt";
				opt.textContent = w;
				opts.push( opt );
			}
		} );
		Element.prototype.append.apply( this.#elements.waveSelect, opts );
	}
	updateWave( prop, val ) {
		const [ w0, w1 ] = this.#elements.waves,
			gain = prop === "gain" ? val : +this.getAttribute( "gain" ),
			pan = prop === "pan" ? val : +this.getAttribute( "pan" );

		w0.type =
		w1.type = prop === "type" ? val : this.getAttribute( "type" );
		w0.amplitude = Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 );
		w1.amplitude = Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 );
		w0.draw();
		w1.draw();
	}

	// .........................................................................
	#changeOrder( n ) {
		this.dataset.order = n;
	}
	#changeType( type ) {
		this.#elements.waveSelect.value = type;
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.#elements.sliders[ prop ];

		sli.setValue( val );
		span.textContent = prop === "detune" ? val : val.toFixed( 2 );
	}

	// .........................................................................
	#onclickPrevNext( dir ) {
		const sel = this.#elements.waveSelect,
			currOpt = sel.querySelector( `option[value="${ sel.value }"]` ),
			opt = dir < 0
				? currOpt.previousElementSibling
				: currOpt.nextElementSibling;

		if ( opt ) {
			sel.value = opt.value;
			this.#onchangeSelect();
		}
	}
	#onchangeSelect() {
		const type = this.#elements.waveSelect.value;

		clearTimeout( this.#timeidType );
		this.updateWave( "type", type );
		this.#dispatch( "liveChange", "type", type );
		this.#timeidType = setTimeout( () => {
			if ( type !== this.getAttribute( "type" ) ) {
				GSUI.setAttribute( this, "type", type );
				this.#dispatch( "change", "type", type );
			}
		}, 700 );
	}
	#onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	#onchangeSlider( prop, val ) {
		GSUI.setAttribute( this, prop, val );
		this.#dispatch( "change", prop, val );
	}
	#oninputSlider( prop, val ) {
		let val2 = val;

		if ( prop === "gain" ) {
			this.updateWave( "gain", val );
			val2 = val.toFixed( 2 );
		} else if ( prop === "pan" ) {
			this.updateWave( "pan", val );
			val2 = val.toFixed( 2 );
		}
		this.#elements.sliders[ prop ][ 1 ].textContent = val2;
		this.#dispatch( "liveChange", prop, +val2 );
	}
}

Object.freeze( gsuiOscillator );
customElements.define( "gsui-oscillator", gsuiOscillator );
