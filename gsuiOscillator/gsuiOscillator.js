"use strict";

const gsuiOscillator_defaultWaves = {
	sine: true,
	triangle: true,
	sawtooth: true,
	square: true,
};

class gsuiOscillator extends gsui0ne {
	$askWavetableData = GSUnoop;
	#timeidType = null;
	#typeSaved = "";
	#updateWaveDeb = GSUdebounce( this.#updateWave.bind( this ), .1 );
	#selectWaves = { ...gsuiOscillator_defaultWaves };
	#elWavetable = null;

	constructor() {
		super( {
			$cmpName: "gsuiOscillator",
			$tagName: "gsui-oscillator",
			$tmpArgs: [ Object.keys( gsuiOscillator_defaultWaves ) ],
			$elements: {
				$id: ".gsuiOscillator-id",
				$waveWrapBottom: ".gsuiOscillator-waveWrap-bottom",
				$waveSelect: ".gsuiOscillator-waveSelect",
				$wavePrev: ".gsuiOscillator-wavePrev",
				$waveNext: ".gsuiOscillator-waveNext",
				$wavetableWrap: ".gsuiOscillator-wavetable",
				$wavetableBtn: ".gsuiOscillator-waveBtn[data-action=wavetable]",
				$sourceName: ".gsuiOscillator-sourceName",
				$source: ".gsuiOscillator-source",
				$waves: "gsui-periodicwave",
				$unisonGraph: ".gsuiOscillator-unisonGraph-voices",
				$propSli: "gsui-slider",
				$propVal: ".gsuiOscillator-sliderValue",
				$remove: ".gsuiOscillator-remove",
			},
			$attributes: {
				"data-id": "0",
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
			},
		} );
		Object.seal( this );
		this.$elements.$waveSelect.$on( {
			change: this.#onchangeSelect.bind( this ),
			keydown: this.#onkeydownSelect.bind( this ),
		} );
		this.$elements.$wavePrev.$on( "click", this.#onclickPrevNext.bind( this, -1 ) );
		this.$elements.$waveNext.$on( "click", this.#onclickPrevNext.bind( this, 1 ) );
		this.$elements.$wavetableBtn.$on( "click", () => this.$this.$togAttr( "wavetable" ) );
		this.$elements.$remove.$on( "click", () => this.$this.$dispatch( GSEV_OSCILLATOR_REMOVE ) );
		this.$this.$on( "transitionend", e => {
			if ( e.propertyName === "min-height" && this.#elWavetable ) {
				this.$this.$css( "transition", "none" );
			}
		} );
		GSUdomListen( this, {
			[ GSEV_WAVETABLE_BACK ]: () => this.$this.$rmAttr( "wavetable" ),
			[ GSEV_WAVETABLE_PARAM ]: d => this.$this.$dispatch( GSEV_OSCILLATOR_CHANGEWAVETABLEPARAM, ...d.$args ),
			[ GSEV_WAVETABLE_CHANGE ]: d => this.$this.$dispatch( GSEV_OSCILLATOR_CHANGEWAVETABLE, ...d.$args ),
			[ GSEV_WAVETABLE_SELECTCURVE ]: d => this.$this.$dispatch( GSEV_OSCILLATOR_SELECTWAVETABLECURVE, ...d.$args ),
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputSlider( d.$target.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.#onchangeSlider( d.$target.dataset.prop, val ),
		} );
	}

	// .........................................................................
	$onresize() {
		const wedit = this.$this.$hasAttr( "wavetable" );
		const w = this.$this.$width();
		const h = wedit
			? Math.max( 450, w / 2 )
			: w < 700 ? 82 : 174;

		this.$this.$css( "minHeight", h, "px" );
		this.$elements.$waves
			.$message( GSEV_PERIODICWAVE_RESIZE )
			.$message( GSEV_PERIODICWAVE_DRAW );
		this.$this.$dispatch( GSEV_OSCILLATOR_RESIZE );
	}
	$firstTimeConnected() {
		this.#updateWaveDeb();
	}
	static get observedAttributes() {
		return [ "data-id", "order", "wave", "wavetable", "source", "detune", "detunefine", "phaze", "gain", "pan", "unisonvoices", "unisondetune", "unisonblend" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "data-id": this.$elements.$id.$text( val ); break;
			case "order": this.$this.$css( "order", val ); break;
			case "wave": this.#changeWave( val ); break;
			case "phaze": this.#updatePhaze( +val ); break;
			case "source": this.#changeSource( val ); break;
			case "wavetable": this.#openWavetable( val === "" ); break;
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
			case "detune":
			case "detunefine":
				this.#updateWaveDeb();
				break;
		}
	}
	$onmessage( ev, ...args ) {
		switch ( ev ) {
			case GSEV_OSCILLATOR_STARTKEY: this.#startKey( ...args ); break;
			case GSEV_OSCILLATOR_STOPKEY: this.#stopKey( ...args ); break;
			case GSEV_OSCILLATOR_ADDCUSTOMWAVE: this.#addWaveCustom( ...args ); break;
			case GSEV_OSCILLATOR_ADDWAVES: this.#addWaves( ...args ); break;
			case GSEV_OSCILLATOR_CHANGECUSTOMWAVE: this.#changeCustomWave( ...args ); break;
			case GSEV_OSCILLATOR_UPDATESOURCEWAVEFORM: this.#updateSourceWaveform( ...args ); break;
			case GSEV_OSCILLATOR_UPDATECUSTOMWAVE:
				this.$elements.$waves
					.$message( GSEV_PERIODICWAVE_DATA, args[ 0 ], 96 )
					.$message( GSEV_PERIODICWAVE_DRAW );
				break;
		}
	}

	// .........................................................................
	#startKey( startedKeyId, wtposCurveId, bpm, dur ) {
		this.#elWavetable?.$startKey( startedKeyId, wtposCurveId, bpm, dur );
	}
	#stopKey( startedKeyId ) {
		this.#elWavetable?.$stopKey( startedKeyId );
	}

	// .........................................................................
	#addWaveCustom( name ) {
		this.$elements.$waveSelect.$prepend( GSUcreateOption( { class: "gsuiOscillator-waveOpt", value: name } ) );
	}
	#addWaves( arr ) {
		const opts = [];

		arr.forEach( w => {
			if ( !this.#selectWaves[ w ] ) {
				this.#selectWaves[ w ] = true;
				opts.push( GSUcreateOption( { class: "gsuiOscillator-waveOpt", value: w } ) );
			}
		} );
		this.$elements.$waveSelect.$append( ...opts );
		this.#updateWaveDeb();
	}
	#updateWave( prop, val ) {
		const w = this.$elements.$waves;
		const gain = prop === "gain" ? val : +this.$this.$getAttr( "gain" );
		const pan = prop === "pan" ? val : +this.$this.$getAttr( "pan" );
		const det = prop === "detune" ? val : +this.$this.$getAttr( "detune" ) + +this.$this.$getAttr( "detunefine" );
		const hz = 2 ** ( ( det - -24 ) / 12 );

		w.$at( 0 ).$setAttr( { frequency: hz, amplitude: Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 ) } ).$message( GSEV_PERIODICWAVE_DRAW );
		w.$at( 1 ).$setAttr( { frequency: hz, amplitude: Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 ) } ).$message( GSEV_PERIODICWAVE_DRAW );
	}
	#changeCustomWave( obj ) {
		if ( this.#elWavetable ) {
			if ( obj ) {
				this.#elWavetable.$change( obj );
			} else {
				this.#elWavetable.$clear();
				this.$this.$rmAttr( "wavetable" );
			}
		}
		this.#updateWaveDeb();
		this.$this.$setAttr( "hascustomwave", !!obj );
	}
	#updateSourceWaveform( svg ) {
		this.$elements.$source.$empty().$append( svg );
	}

	// .........................................................................
	#getPropSlider( prop ) { return this.$elements.$propSli.$filter( `[data-prop="${ prop }"]` ); }
	#getPropOutput( prop ) { return this.$elements.$propVal.$filter( `[data-prop="${ prop }"] *` ); }
	#changeSource( src ) {
		this.$elements.$sourceName.$text( src );
		if ( src ) {
			this.$this.$rmAttr( "wave" );
		}
	}
	#changeWave( w ) {
		const w2 = gsuiWaveletList.find( a => a[ 0 ] === w )?.[ 1 ];

		this.$elements.$waveSelect.$value( w );
		if ( w2 ) {
			this.$elements.$waves
				.$message( GSEV_PERIODICWAVE_DATA, w2, 96 )
				.$message( GSEV_PERIODICWAVE_DRAW );
		}
		if ( w ) {
			this.$this.$rmAttr( "source" );
		}
	}
	#changePropSlider( prop, val ) {
		let val2 = val;

		if ( prop.startsWith( "detune" ) ) {
			val2 = +this.$this.$getAttr( "detune" ) + +this.$this.$getAttr( "detunefine" );
		}
		this.#getPropSlider( prop ).$setAttr( {
			value: val,
			title: `${ prop } ${ val2 }`,
		} );
		gsuiOscillator.#setTextValue( this.#getPropOutput( prop ), prop, val2 );
	}
	static #setTextValue( span, prop, val ) {
		switch ( prop ) {
			case "detune":
			case "detunefine":
				span.$text( GSUmathSign( val.toFixed( 2 ) ) );
				break;
			case "gain":
				span.$text( `${ Math.round( val * 100 ) }%` );
				break;
			case "pan":
				span.$text( `${ GSUmathSign( Math.round( val * 100 ) ) }%` );
				break;
		}
	}
	#updatePhaze( n ) {
		this.$elements.$waveWrapBottom.$css( "marginLeft", n * 10, "%" );
	}
	#updateUnisonGraphVoices( n ) {
		GSUdomSetChildrenLength( this.$elements.$unisonGraph.$get( 0 ), n, "div", { class: "gsuiOscillator-unisonGraph-voice" } );
		this.#updateUnisonGraphBlend( +this.$this.$getAttr( "unisonblend" ) );
	}
	#updateUnisonGraphDetune( detune ) {
		const maxDetune = +this.#getPropSlider( "unisondetune" ).$getAttr( "max" );

		this.$elements.$unisonGraph.$height( GSUmathEaseOutCirc( detune / maxDetune ) * 100, "%" );
	}
	#updateUnisonGraphBlend( blend ) {
		const vs = this.$elements.$unisonGraph.$children();
		const mid = Math.floor( vs.$size() / 2 );
		const even = vs.$size() % 2 === 0;

		vs.$width( ( rc, i ) => i === mid || ( even && i === mid - 1 ) ? 100 : blend * 100, "%" );
	}

	// .........................................................................
	#openWavetable( b ) {
		if ( b ) {
			const wtData = this.$askWavetableData();

			this.#elWavetable = GSUcreateElement( "gsui-wavetable" );
			this.$elements.$wavetableWrap.$append( this.#elWavetable );
			this.#elWavetable.$change( wtData[ 0 ] );
			this.#elWavetable.$isRealData( wtData[ 1 ] );
		} else {
			this.$this.$css( "transition", "" );
			this.#elWavetable.remove();
			this.#elWavetable = null;
		}
		this.$this.$setAttr( "wavetable", b );
		this.$onresize();
	}
	#onclickPrevNext( dir ) {
		const sel = this.$elements.$waveSelect.$get( 0 );
		const currOpt = GSUdomQS( sel, `option[value="${ sel.value }"]` );
		const opt = dir < 0
			? currOpt.previousElementSibling
			: currOpt.nextElementSibling;

		if ( opt && ( dir > 0 || currOpt.value !== "sine" || this.$this.$hasAttr( "hascustomwave" ) ) ) {
			sel.value = opt.value;
			this.#onchangeSelect();
		}
	}
	#onchangeSelect() {
		const w = this.$elements.$waveSelect.$value();

		GSUclearTimeout( this.#timeidType );
		this.$this.$setAttr( "wave", w )
			.$dispatch( GSEV_OSCILLATOR_LIVECHANGE, "wave", w );
		this.#timeidType = GSUsetTimeout( () => {
			if ( w !== this.#typeSaved ) {
				this.#typeSaved = w;
				this.$this.$dispatch( GSEV_OSCILLATOR_CHANGE, "wave", w );
			}
		}, .7 );
	}
	#onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	#onchangeSlider( prop, val ) {
		this.$this.$setAttr( prop, val ).$dispatch( GSEV_OSCILLATOR_CHANGE, prop, val );
	}
	#oninputSlider( prop, val ) {
		let val2 = val;

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
				val2 += +this.$this.$getAttr( "detunefine" );
				this.#updateWave( "detune", val2 );
				break;
			case "detunefine":
				val2 += +this.$this.$getAttr( "detune" );
				this.#updateWave( "detune", val2 );
				break;
		}
		gsuiOscillator.#setTextValue( this.#getPropOutput( prop ), prop, val2 );
		this.$this.$dispatch( GSEV_OSCILLATOR_LIVECHANGE, prop, val );
	}
}

GSUdomDefine( "gsui-oscillator", gsuiOscillator );
