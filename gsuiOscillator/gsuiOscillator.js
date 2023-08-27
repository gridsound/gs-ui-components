"use strict";

class gsuiOscillator extends HTMLElement {
	#timeidType = null;
	#dispatch = GSUdispatchEvent.bind( null, this, "gsuiOscillator" );
	#selectWaves = {
		sine: true,
		triangle: true,
		sawtooth: true,
		square: true,
	};
	#children = GSUgetTemplate( "gsui-oscillator" );
	#elements = GSUfindElements( this.#children, {
		waveSelect: ".gsuiOscillator-waveSelect",
		wavePrev: ".gsuiOscillator-wavePrev",
		waveNext: ".gsuiOscillator-waveNext",
		waves: [
			"gsui-periodicwave:first-child",
			"gsui-periodicwave:last-child",
		],
		unisonGraph: ".gsuiOscillator-unisonGraph-voices",
		sliders: {
			pan: [ ".gsuiOscillator-pan gsui-slider", ".gsuiOscillator-pan .gsuiOscillator-sliderValue" ],
			gain: [ ".gsuiOscillator-gain gsui-slider", ".gsuiOscillator-gain .gsuiOscillator-sliderValue" ],
			detune: [ ".gsuiOscillator-detune gsui-slider", ".gsuiOscillator-detune .gsuiOscillator-sliderValue" ],
			detunefine: [ ".gsuiOscillator-detune gsui-slider + gsui-slider", ".gsuiOscillator-detune .gsuiOscillator-sliderValue" ],
			unisonvoices: [ "gsui-slider[data-prop='unisonvoices']" ],
			unisondetune: [ "gsui-slider[data-prop='unisondetune']" ],
			unisonblend: [ "gsui-slider[data-prop='unisonblend']" ],
		},
		remove: ".gsuiOscillator-remove",
	} );

	constructor() {
		super();
		Object.seal( this );

		this.#elements.waveSelect.onchange = this.#onchangeSelect.bind( this );
		this.#elements.waveSelect.onkeydown = this.#onkeydownSelect.bind( this );
		this.#elements.wavePrev.onclick = this.#onclickPrevNext.bind( this, -1 );
		this.#elements.waveNext.onclick = this.#onclickPrevNext.bind( this, 1 );
		this.#elements.remove.onclick = () => this.#dispatch( "remove" );
		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
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
			GSUsetAttribute( this, "draggable", "true" );
			this.append( ...this.#children );
			this.#children = null;
			GSUrecallAttributes( this, {
				order: 0,
				type: "sine",
				detune: 0,
				detunefine: 0,
				gain: 1,
				pan: 0,
				unisonvoices: 5,
				unisondetune: .2,
				unisonblend: .3,
			} );
			this.updateWave();
		}
	}
	static get observedAttributes() {
		return [ "order", "type", "detune", "detunefine", "gain", "pan", "unisonvoices", "unisondetune", "unisonblend" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "order": this.#changeOrder( num ); break;
				case "type": this.#changeType( val ); break;
				case "unisonvoices":
					this.#updateUnisonGraphVoices( num );
					this.#changePropSlider( "unisonvoices", num );
					break;
				case "unisondetune":
					this.#updateUnisonGraphDetune( num );
					this.#changePropSlider( "unisondetune", num );
					break;
				case "unisonblend":
					this.#updateUnisonGraphBlend( num );
					this.#changePropSlider( "unisonblend", num );
					break;
				case "detunefine":
				case "detune":
				case "gain":
				case "pan":
					this.#changePropSlider( prop, num );
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
				this.#selectWaves[ w ] = true;
				opts.push( GSUcreateElement( "option", { class: "gsuiOscillator-waveOpt", value: w }, w ) );
			}
		} );
		Element.prototype.append.apply( this.#elements.waveSelect, opts );
		this.updateWave();
	}
	updateWave( prop, val ) {
		const [ w0, w1 ] = this.#elements.waves;
		const type = prop === "type" ? val : GSUgetAttribute( this, "type" );
		const gain = prop === "gain" ? val : GSUgetAttributeNum( this, "gain" );
		const pan = prop === "pan" ? val : GSUgetAttributeNum( this, "pan" );

		w0.$options( { type, amplitude: Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 ) } );
		w1.$options( { type, amplitude: Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 ) } );
	}

	// .........................................................................
	#changeOrder( n ) {
		this.dataset.order = n;
	}
	#changeType( type ) {
		this.#elements.waveSelect.value = type;
	}
	#changePropSlider( prop, val ) {
		const [ sli, span ] = this.#elements.sliders[ prop ];
		let val2 = val;

		if ( prop.startsWith( "detune" ) ) {
			val2 = GSUgetAttributeNum( this, "detune" ) + GSUgetAttributeNum( this, "detunefine" );
		}
		sli.setValue( val );
		GSUsetAttribute( sli, "title", `${ prop } ${ val2 }` );
		if ( span ) {
			span.textContent = val2.toFixed( 2 );
		}
	}
	#updateUnisonGraphVoices( voices ) {
		const svg = this.#elements.unisonGraph;
		const elVoices = [];

		for ( let i = 0; i < voices; ++i ) {
			elVoices.push( GSUcreateElement( "div", { class: "gsuiOscillator-unisonGraph-voice" } ) );
		}
		GSUemptyElement( svg );
		svg.append( ...elVoices );
		this.#updateUnisonGraphBlend( GSUgetAttributeNum( this, "unisonblend" ) );
	}
	#updateUnisonGraphDetune( detune ) {
		const maxDetune = GSUgetAttributeNum( this.#elements.sliders.unisondetune[ 0 ], "max" );

		this.#elements.unisonGraph.style.height = `${ GSUeaseOutCirc( detune / maxDetune ) * 100 }%`;
	}
	#updateUnisonGraphBlend( blend ) {
		const vs = this.#elements.unisonGraph.childNodes;
		const mid = Math.floor( vs.length / 2 );
		const even = vs.length % 2 === 0;

		vs.forEach( ( rc, i ) => rc.style.width = `${ i === mid || ( even && i === mid - 1 ) ? 100 : blend * 100 }%` );
	}

	// .........................................................................
	#onclickPrevNext( dir ) {
		const sel = this.#elements.waveSelect;
		const currOpt = sel.querySelector( `option[value="${ sel.value }"]` );
		const opt = dir < 0
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
			if ( type !== GSUgetAttribute( this, "type" ) ) {
				GSUsetAttribute( this, "type", type );
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
		GSUsetAttribute( this, prop, val );
		this.#dispatch( "change", prop, val );
	}
	#oninputSlider( prop, val ) {
		let val2 = val;
		const span = this.#elements.sliders[ prop ][ 1 ];

		switch ( prop ) {
			case "gain":
				this.updateWave( "gain", val );
				break;
			case "pan":
				this.updateWave( "pan", val );
				break;
			case "unisonvoices":
				this.#updateUnisonGraphVoices( val );
				break;
			case "unisondetune":
				this.#updateUnisonGraphDetune( val );
				break;
			case "unisonblend":
				this.#updateUnisonGraphBlend( val );
				break;
			case "detune":
				val2 += GSUgetAttributeNum( this, "detunefine" );
				break;
			case "detunefine":
				val2 += GSUgetAttributeNum( this, "detune" );
				break;
		}
		if ( span ) {
			span.textContent = val2.toFixed( 2 );
		}
		this.#dispatch( "liveChange", prop, val );
	}
}

Object.freeze( gsuiOscillator );
customElements.define( "gsui-oscillator", gsuiOscillator );
