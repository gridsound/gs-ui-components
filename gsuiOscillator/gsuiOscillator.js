"use strict";

const gsuiOscillator_defaultWaves = {
	sine: true,
	triangle: true,
	sawtooth: true,
	square: true,
};

class gsuiOscillator extends gsui0ne {
	$askWaveCustomData = GSUnoop;
	#timeidType = null;
	#dragleaveDeb = GSUdebounce( () => GSUsetAttribute( this, "dragover", false ), 175 );
	#dragleaveWaveDeb = GSUdebounce( () => GSUsetAttribute( this, "dragoverwave", false ), 175 );
	#typeSaved = "";
	#updateWaveDeb = GSUdebounce( this.#updateWave.bind( this ), 100 );
	#selectWaves = { ...gsuiOscillator_defaultWaves };
	#elWaveEdit = null;

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
		this.$elements.$waveEditBtn.onclick = () => GSUtoggleAttribute( this, "waveedit" );
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
			gsuiWaveEdit: {
				back: () => GSUsetAttribute( this, "waveedit", false ),
				changeWavetable: d => {
					d.component = "gsuiOscillator";
					d.target = this;
					return true;
				},
				changeWavetableCurve: d => {
					d.component = "gsuiOscillator";
					d.target = this;
					return true;
				},
			},
		} );
	}

	// .........................................................................
	$onresize() {
		const wedit = GSUhasAttribute( this, "waveedit" );
		const w = this.clientWidth;
		const h = wedit
			? 340
			: w < 700
				? 78
				: 168;

		this.style.minHeight = `${ h }px`;
		this.$elements.$waves[ 0 ].$resized();
		this.$elements.$waves[ 1 ].$resized();
		this.$dispatch( "resize" );
	}
	$firstTimeConnected() {
		this.$elements.$waves[ 0 ].$nbLines( 1 );
		this.$elements.$waves[ 1 ].$nbLines( 1 );
		this.#updateWaveDeb();
	}
	static get observedAttributes() {
		return [ "wave", "waveedit", "source", "detune", "detunefine", "phaze", "gain", "pan", "unisonvoices", "unisondetune", "unisonblend" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "wave": this.#changeWave( val ); break;
			case "phaze": this.#updatePhaze( +val ); break;
			case "source": this.#changeSource( val ); break;
			case "waveedit": this.#openWaveEdit( val === "" ); break;
			case "unisonvoices": this.#updateUnisonGraphVoices( +val ); break;
			case "unisondetune": this.#updateUnisonGraphDetune( +val ); break;
			case "unisonblend": this.#updateUnisonGraphBlend( +val ); break;
		}
		switch ( prop ) {
			case "pan":
			case "gain":
			case "phaze":
			case "detune":
			case "detunefine":
			case "unisonvoices":
			case "unisondetune":
			case "unisonblend":
				this.#changePropSlider( prop, +val );
				break;
		}
		switch ( prop ) {
			case "pan":
			case "gain":
			case "wave":
			case "detune":
			case "detunefine":
				this.#updateWaveDeb();
				break;
		}
	}

	// .........................................................................
	$addWaveCustom( name ) {
		this.$elements.$waveSelect.prepend( GSUcreateOption( { class: "gsuiOscillator-waveOpt", value: name } ) );
	}
	$addWaves( arr ) {
		const opts = [];

		arr.sort();
		arr.forEach( w => {
			if ( !this.#selectWaves[ w ] ) {
				this.#selectWaves[ w ] = true;
				opts.push( GSUcreateOption( { class: "gsuiOscillator-waveOpt", value: w } ) );
			}
		} );
		this.$elements.$waveSelect.append( ...opts );
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
	$changeCustomWave( obj ) {
		if ( this.#elWaveEdit ) {
			if ( obj ) {
				this.#elWaveEdit.$change( obj );
			} else {
				this.#elWaveEdit.$clear();
				GSUsetAttribute( this, "waveedit", false );
			}
		}
		this.#updateWaveDeb();
		GSUsetAttribute( this, "hascustomwave", !!obj );
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
		GSUsetAttribute( sli, "value", val );
		GSUsetAttribute( sli, "title", `${ prop } ${ val2 }` );
		gsuiOscillator.#setTextValue( span, prop, val2 );
	}
	static #setTextValue( span, prop, val ) {
		if ( span ) {
			switch ( prop ) {
				case "detune":
				case "detunefine":
					span.textContent = GSUsignNum( val.toFixed( 2 ) );
					break;
				case "gain":
					span.textContent = `${ Math.round( val * 100 ) }%`;
					break;
				case "pan":
					span.textContent = `${ GSUsignNum( Math.round( val * 100 ) ) }%`;
					break;
			}
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
		if ( b ) {
			this.#elWaveEdit = GSUcreateElement( "gsui-wave-edit" );
			this.$elements.$waveEditWrap.append( this.#elWaveEdit );
			this.#elWaveEdit.$change( this.$askWaveCustomData() );
		} else {
			this.#elWaveEdit.remove();
			this.#elWaveEdit = null;
		}
		GSUsetAttribute( this, "waveedit", b );
		this.$onresize();
	}
	#onclickPrevNext( dir ) {
		const sel = this.$elements.$waveSelect;
		const currOpt = sel.querySelector( `option[value="${ sel.value }"]` );
		const opt = dir < 0
			? currOpt.previousElementSibling
			: currOpt.nextElementSibling;

		if ( opt && ( dir > 0 || currOpt.value !== "sine" || GSUhasAttribute( this, "hascustomwave" ) ) ) {
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
		gsuiOscillator.#setTextValue( span, prop, val2 );
		this.$dispatch( "liveChange", prop, val );
	}
}

GSUdefineElement( "gsui-oscillator", gsuiOscillator );
