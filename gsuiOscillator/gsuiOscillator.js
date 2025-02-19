"use strict";

const gsuiOscillator_defaultWaves = {
	sine: true,
	triangle: true,
	sawtooth: true,
	square: true,
};

class gsuiOscillator extends gsui0ne {
	#timeidType = null;
	#dragleaveDeb = GSUdebounce( () => GSUsetAttribute( this, "dragover", false ), 175 );
	#dragleaveWaveDeb = GSUdebounce( () => GSUsetAttribute( this, "dragoverwave", false ), 175 );
	#typeSaved = "";
	#updateWaveDeb = GSUdebounce( this.#updateWave.bind( this ), 100 );
	#selectWaves = { ...gsuiOscillator_defaultWaves };

	constructor() {
		super( {
			$cmpName: "gsuiOscillator",
			$tagName: "gsui-oscillator",
			$tmpArgs: [ Object.keys( gsuiOscillator_defaultWaves ) ],
			$elements: {
				$waveWrap: ".gsuiOscillator-waveWrap",
				$waveWrapBottom: ".gsuiOscillator-waveWrap-bottom",
				$waveSelect: ".gsuiOscillator-waveSelect",
				$wavePrev: ".gsuiOscillator-wavePrev",
				$waveNext: ".gsuiOscillator-waveNext",
				$waveEditWrap: ".gsuiOscillator-waveEdit",
				$waveEditBtn: ".gsuiOscillator-waveBtn[data-action=waveEdit]",
				$waveEditExit: ".gsuiOscillator-waveEdit-exit",
				$sourceName: ".gsuiOscillator-sourceName",
				$source: ".gsuiOscillator-source",
				$waves: [
					"gsui-periodicwave:first-child",
					"gsui-periodicwave:last-child",
				],
				$unisonGraph: ".gsuiOscillator-unisonGraph-voices",
				$sliders: {
					pan: [ ".gsuiOscillator-pan gsui-slider", ".gsuiOscillator-pan .gsuiOscillator-sliderValue" ],
					gain: [ ".gsuiOscillator-gain gsui-slider", ".gsuiOscillator-gain .gsuiOscillator-sliderValue" ],
					detune: [ ".gsuiOscillator-detune gsui-slider", ".gsuiOscillator-detune .gsuiOscillator-sliderValue" ],
					detunefine: [ ".gsuiOscillator-detune gsui-slider + gsui-slider", ".gsuiOscillator-detune .gsuiOscillator-sliderValue" ],
					unisonvoices: [ "gsui-slider[data-prop='unisonvoices']" ],
					unisondetune: [ "gsui-slider[data-prop='unisondetune']" ],
					unisonblend: [ "gsui-slider[data-prop='unisonblend']" ],
					phaze: [ "gsui-slider[data-prop='phaze']" ],
				},
				$remove: ".gsuiOscillator-remove",
			},
			$attributes: {
				draggable: "true",
				order: 0,
				wave: undefined,
				source: undefined,
				detune: 0,
				detunefine: 0,
				gain: 1,
				pan: 0,
				phaze: 0,
				unisonvoices: 5,
				unisondetune: .2,
				unisonblend: .3,
			}
		} );
		Object.seal( this );
		this.$elements.$waveSelect.onchange = this.#onchangeSelect.bind( this );
		this.$elements.$waveSelect.onkeydown = this.#onkeydownSelect.bind( this );
		this.$elements.$wavePrev.onclick = this.#onclickPrevNext.bind( this, -1 );
		this.$elements.$waveNext.onclick = this.#onclickPrevNext.bind( this, 1 );
		this.$elements.$waveEditBtn.onclick = this.#openWaveEdit.bind( this, true );
		this.$elements.$waveEditExit.onclick = this.#openWaveEdit.bind( this, false );
		this.$elements.$waveEditWrap.onpointerdown = e => e.preventDefault();
		this.$elements.$remove.onclick = () => this.$dispatch( "remove" );
		this.$elements.$waveWrap.ondragover = e => {
			e.stopPropagation();
			GSUsetAttribute( this, "dragoverwave", true );
			GSUsetAttribute( this, "dragover", false );
			this.#dragleaveWaveDeb();
			return false;
		};
		this.ondragover = e => {
			const bcr = this.getBoundingClientRect();
			const y = e.pageY - bcr.y;

			if ( y > 8 && y < bcr.height - 8 ) {
				GSUsetAttribute( this, "dragoverwave", false );
				GSUsetAttribute( this, "dragover", true );
				this.#dragleaveDeb();
			}
			return false;
		};
		this.ondrop = e => {
			const tar = e.target.closest( "gsui-oscillator, .gsuiOscillator-waveWrap" );
			const [ bufType, bufId ] = GSUgetDataTransfer( e, [
				"pattern-buffer",
				"library-buffer:default",
				"library-buffer:local",
			] );

			if ( bufId ) {
				this.$dispatch( tar.nodeName === "GSUI-OSCILLATOR" ? "drop" : "wavedrop", bufType, bufId );
			}
			return false;
		};
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
	$firstTimeConnected() {
		this.$elements.$waves[ 0 ].$nbLines( 1 );
		this.$elements.$waves[ 1 ].$nbLines( 1 );
		this.#updateWaveDeb();
	}
	static get observedAttributes() {
		return [ "wave", "source", "detune", "detunefine", "phaze", "gain", "pan", "unisonvoices", "unisondetune", "unisonblend" ];
	}
	$attributeChanged( prop, val ) {
		const num = +val;

		switch ( prop ) {
			case "wave": this.#changeWave( val ); break;
			case "source": this.#changeSource( val ); break;
			case "phaze":
				this.#updatePhaze( num );
				this.#changePropSlider( "phaze", num );
				break;
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
		if ( prop === "wave" || prop === "gain" || prop === "pan" || prop === "detune" || prop === "detunefine" ) {
			this.#updateWaveDeb();
		}
	}

	// .........................................................................
	addWaves( arr ) {
		const opts = [];

		arr.sort();
		arr.forEach( w => {
			if ( !this.#selectWaves[ w ] ) {
				this.#selectWaves[ w ] = true;
				opts.push( GSUcreateOption( { class: "gsuiOscillator-waveOpt", value: w } ) );
			}
		} );
		Element.prototype.append.apply( this.$elements.$waveSelect, opts );
		this.#updateWaveDeb();
	}
	#updateWave( prop, val ) {
		const [ w0, w1 ] = this.$elements.$waves;
		const wave = prop === "wave" ? val : GSUgetAttribute( this, "wave" );
		const gain = prop === "gain" ? val : GSUgetAttributeNum( this, "gain" );
		const pan = prop === "pan" ? val : GSUgetAttributeNum( this, "pan" );
		const det = prop === "detune" ? val : GSUgetAttributeNum( this, "detune" ) + GSUgetAttributeNum( this, "detunefine" );
		const hz = 2 ** ( ( det - -24 ) / 12 );

		w0.$options( 0, { type: wave, frequency: hz, amplitude: Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 ) } );
		w1.$options( 0, { type: wave, frequency: hz, amplitude: Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 ) } );
	}
	$updateSourceWaveform( svg ) {
		GSUemptyElement( this.$elements.$source );
		this.$elements.$source.append( svg );
	}

	// .........................................................................
	#changeSource( src ) {
		this.$elements.$sourceName.textContent = src;
		if ( src ) {
			GSUsetAttribute( this, "wave", false );
		}
	}
	#changeWave( w ) {
		const slid = this.$elements.$sliders;

		this.$elements.$waveSelect.value = w;
		if ( w ) {
			GSUsetAttribute( this, "source", false );
		}
	}
	#changePropSlider( prop, val ) {
		const [ sli, span ] = this.$elements.$sliders[ prop ];
		let val2 = val;

		if ( prop.startsWith( "detune" ) ) {
			val2 = GSUgetAttributeNum( this, "detune" ) + GSUgetAttributeNum( this, "detunefine" );
		}
		sli.$setValue( val );
		GSUsetAttribute( sli, "title", `${ prop } ${ val2 }` );
		if ( span ) {
			span.textContent = val2.toFixed( 2 );
		}
	}
	#updatePhaze( n ) {
		this.$elements.$waveWrapBottom.style.marginLeft = `${ n * 10 }%`;
	}
	#updateUnisonGraphVoices( n ) {
		GSUsetChildrenNumber( this.$elements.$unisonGraph, n, "div", { class: "gsuiOscillator-unisonGraph-voice" } );
		this.#updateUnisonGraphBlend( GSUgetAttributeNum( this, "unisonblend" ) );
	}
	#updateUnisonGraphDetune( detune ) {
		const maxDetune = GSUgetAttributeNum( this.$elements.$sliders.unisondetune[ 0 ], "max" );

		this.$elements.$unisonGraph.style.height = `${ GSUeaseOutCirc( detune / maxDetune ) * 100 }%`;
	}
	#updateUnisonGraphBlend( blend ) {
		const vs = this.$elements.$unisonGraph.childNodes;
		const mid = Math.floor( vs.length / 2 );
		const even = vs.length % 2 === 0;

		vs.forEach( ( rc, i ) => rc.style.width = `${ i === mid || ( even && i === mid - 1 ) ? 100 : blend * 100 }%` );
	}

	// .........................................................................
	#openWaveEdit( b ) {
		GSUsetAttribute( this, "waveedit", b );
	}
	#onclickPrevNext( dir ) {
		const sel = this.$elements.$waveSelect;
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
		const w = this.$elements.$waveSelect.value;

		clearTimeout( this.#timeidType );
		GSUsetAttribute( this, "wave", w );
		this.$dispatch( "liveChange", "wave", w );
		this.#timeidType = setTimeout( () => {
			if ( w !== this.#typeSaved ) {
				this.#typeSaved = w;
				this.$dispatch( "change", "wave", w );
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
		this.$dispatch( "change", prop, val );
	}
	#oninputSlider( prop, val ) {
		let val2 = val;
		const span = this.$elements.$sliders[ prop ][ 1 ];

		switch ( prop ) {
			case "phaze":
				this.#updatePhaze( val );
				break;
			case "gain":
				this.#updateWave( "gain", val );
				break;
			case "pan":
				this.#updateWave( "pan", val );
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
				this.#updateWave( "detune", val2 );
				break;
			case "detunefine":
				val2 += GSUgetAttributeNum( this, "detune" );
				this.#updateWave( "detune", val2 );
				break;
		}
		if ( span ) {
			span.textContent = val2.toFixed( 2 );
		}
		this.$dispatch( "liveChange", prop, val );
	}
}

GSUdefineElement( "gsui-oscillator", gsuiOscillator );
