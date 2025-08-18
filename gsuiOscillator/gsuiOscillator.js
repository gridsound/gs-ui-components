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
				$waveWrap: ".gsuiOscillator-waveWrap",
				$waveWrapBottom: ".gsuiOscillator-waveWrap-bottom",
				$waveSelect: ".gsuiOscillator-waveSelect",
				$wavePrev: ".gsuiOscillator-wavePrev",
				$waveNext: ".gsuiOscillator-waveNext",
				$wavetableWrap: ".gsuiOscillator-wavetable",
				$wavetableBtn: ".gsuiOscillator-waveBtn[data-action=wavetable]",
				$sourceName: ".gsuiOscillator-sourceName",
				$source: ".gsuiOscillator-source",
				$waves: [
					"gsui-periodicwave:first-child",
					"gsui-periodicwave:last-child",
				],
				$unisonGraph: ".gsuiOscillator-unisonGraph-voices",
				$sliders: {
					pan: [ "gsui-slider[data-prop='pan']", "[data-prop='pan'] .gsuiOscillator-sliderValue" ],
					gain: [ "gsui-slider[data-prop='gain']", "[data-prop='gain'] .gsuiOscillator-sliderValue" ],
					detune: [ "gsui-slider[data-prop='detune']", "[data-prop='detune'] .gsuiOscillator-sliderValue" ],
					detunefine: [ "gsui-slider[data-prop='detunefine']", "[data-prop='detune'] .gsuiOscillator-sliderValue" ],
					unisonvoices: [ "gsui-slider[data-prop='unisonvoices']" ],
					unisondetune: [ "gsui-slider[data-prop='unisondetune']" ],
					unisonblend: [ "gsui-slider[data-prop='unisonblend']" ],
					phaze: [ "gsui-slider[data-prop='phaze']" ],
				},
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
			}
		} );
		Object.seal( this );
		this.$elements.$waveSelect.onchange = this.#onchangeSelect.bind( this );
		this.$elements.$waveSelect.onkeydown = this.#onkeydownSelect.bind( this );
		this.$elements.$wavePrev.onclick = this.#onclickPrevNext.bind( this, -1 );
		this.$elements.$waveNext.onclick = this.#onclickPrevNext.bind( this, 1 );
		this.$elements.$wavetableBtn.onclick = () => GSUdomTogAttr( this, "wavetable" );
		this.$elements.$remove.onclick = () => this.$dispatch( "remove" );
		this.addEventListener( "transitionend", e => {
			if ( e.propertyName === "min-height" && this.#elWavetable ) {
				GSUsetStyle( this, "transition", "none" );
			}
		} );

		const redirEv = d => {
			d.component = "gsuiOscillator";
			d.target = this;
			return true;
		};

		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, sli ) => this.#oninputSlider( sli.dataset.prop, d.args[ 0 ] ),
				change: ( d, sli ) => this.#onchangeSlider( sli.dataset.prop, d.args[ 0 ] ),
			},
			gsuiWavetable: {
				back: () => GSUdomRmAttr( this, "wavetable" ),
				changeWavetable: redirEv,
				changeWavetableCurve: redirEv,
				selectWavetableCurve: redirEv,
				changeWavetableParams: redirEv,
			},
		} );
	}

	// .........................................................................
	$onresize() {
		const wedit = GSUdomHasAttr( this, "wavetable" );
		const w = this.clientWidth;
		const h = wedit
			? Math.max( 500, w / 2 )
			: w < 700 ? 82 : 174;

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
		return [ "data-id", "order", "wave", "wavetable", "source", "detune", "detunefine", "phaze", "gain", "pan", "unisonvoices", "unisondetune", "unisonblend" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "data-id": this.$elements.$id.textContent = val; break;
			case "order": this.style.order = val; break;
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
			case "wave":
			case "detune":
			case "detunefine":
				this.#updateWaveDeb();
				break;
		}
	}

	// .........................................................................
	$startKey( startedKeyId, wtposCurveId, bpm, dur ) {
		this.#elWavetable?.$startKey( startedKeyId, wtposCurveId, bpm, dur );
	}
	$stopKey( startedKeyId ) {
		this.#elWavetable?.$stopKey( startedKeyId );
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
		const wave = prop === "wave" ? val : GSUdomGetAttr( this, "wave" );
		const gain = prop === "gain" ? val : GSUdomGetAttrNum( this, "gain" );
		const pan = prop === "pan" ? val : GSUdomGetAttrNum( this, "pan" );
		const det = prop === "detune" ? val : GSUdomGetAttrNum( this, "detune" ) + GSUdomGetAttrNum( this, "detunefine" );
		const hz = 2 ** ( ( det - -24 ) / 12 );

		w0.$options( 0, { type: wave, frequency: hz, amplitude: Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 ) } );
		w1.$options( 0, { type: wave, frequency: hz, amplitude: Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 ) } );
	}
	$changeCustomWave( obj ) {
		if ( this.#elWavetable ) {
			if ( obj ) {
				this.#elWavetable.$change( obj );
			} else {
				this.#elWavetable.$clear();
				GSUdomRmAttr( this, "wavetable" );
			}
		}
		this.#updateWaveDeb();
		GSUdomSetAttr( this, "hascustomwave", !!obj );
	}
	$updateSourceWaveform( svg ) {
		GSUemptyElement( this.$elements.$source );
		this.$elements.$source.append( svg );
	}

	// .........................................................................
	#changeSource( src ) {
		this.$elements.$sourceName.textContent = src;
		if ( src ) {
			GSUdomRmAttr( this, "wave" );
		}
	}
	#changeWave( w ) {
		const slid = this.$elements.$sliders;

		this.$elements.$waveSelect.value = w;
		if ( w ) {
			GSUdomRmAttr( this, "source" );
		}
	}
	#changePropSlider( prop, val ) {
		const [ sli, span ] = this.$elements.$sliders[ prop ];
		let val2 = val;

		if ( prop.startsWith( "detune" ) ) {
			val2 = GSUdomGetAttrNum( this, "detune" ) + GSUdomGetAttrNum( this, "detunefine" );
		}
		GSUdomSetAttr( sli, "value", val );
		GSUdomSetAttr( sli, "title", `${ prop } ${ val2 }` );
		gsuiOscillator.#setTextValue( span, prop, val2 );
	}
	static #setTextValue( span, prop, val ) {
		if ( span ) {
			switch ( prop ) {
				case "detune":
				case "detunefine":
					span.textContent = GSUmathSign( val.toFixed( 2 ) );
					break;
				case "gain":
					span.textContent = `${ Math.round( val * 100 ) }%`;
					break;
				case "pan":
					span.textContent = `${ GSUmathSign( Math.round( val * 100 ) ) }%`;
					break;
			}
		}
	}
	#updatePhaze( n ) {
		this.$elements.$waveWrapBottom.style.marginLeft = `${ n * 10 }%`;
	}
	#updateUnisonGraphVoices( n ) {
		GSUsetChildrenNumber( this.$elements.$unisonGraph, n, "div", { class: "gsuiOscillator-unisonGraph-voice" } );
		this.#updateUnisonGraphBlend( GSUdomGetAttrNum( this, "unisonblend" ) );
	}
	#updateUnisonGraphDetune( detune ) {
		const maxDetune = GSUdomGetAttrNum( this.$elements.$sliders.unisondetune[ 0 ], "max" );

		this.$elements.$unisonGraph.style.height = `${ GSUmathEaseOutCirc( detune / maxDetune ) * 100 }%`;
	}
	#updateUnisonGraphBlend( blend ) {
		const vs = this.$elements.$unisonGraph.childNodes;
		const mid = Math.floor( vs.length / 2 );
		const even = vs.length % 2 === 0;

		vs.forEach( ( rc, i ) => rc.style.width = `${ i === mid || ( even && i === mid - 1 ) ? 100 : blend * 100 }%` );
	}

	// .........................................................................
	#openWavetable( b ) {
		if ( b ) {
			const wtData = this.$askWavetableData();

			this.#elWavetable = GSUcreateElement( "gsui-wavetable" );
			this.$elements.$wavetableWrap.append( this.#elWavetable );
			this.#elWavetable.$change( wtData[ 0 ] );
			this.#elWavetable.$isRealData( wtData[ 1 ] );
		} else {
			GSUsetStyle( this, "transition", "" );
			this.#elWavetable.remove();
			this.#elWavetable = null;
		}
		GSUdomSetAttr( this, "wavetable", b );
		this.$onresize();
	}
	#onclickPrevNext( dir ) {
		const sel = this.$elements.$waveSelect;
		const currOpt = GSUdomQS( sel, `option[value="${ sel.value }"]` );
		const opt = dir < 0
			? currOpt.previousElementSibling
			: currOpt.nextElementSibling;

		if ( opt && ( dir > 0 || currOpt.value !== "sine" || GSUdomHasAttr( this, "hascustomwave" ) ) ) {
			sel.value = opt.value;
			this.#onchangeSelect();
		}
	}
	#onchangeSelect() {
		const w = this.$elements.$waveSelect.value;

		GSUclearTimeout( this.#timeidType );
		GSUdomSetAttr( this, "wave", w );
		this.$dispatch( "liveChange", "wave", w );
		this.#timeidType = GSUsetTimeout( () => {
			if ( w !== this.#typeSaved ) {
				this.#typeSaved = w;
				this.$dispatch( "change", "wave", w );
			}
		}, .7 );
	}
	#onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	#onchangeSlider( prop, val ) {
		GSUdomSetAttr( this, prop, val );
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
				val2 += GSUdomGetAttrNum( this, "detunefine" );
				this.#updateWave( "detune", val2 );
				break;
			case "detunefine":
				val2 += GSUdomGetAttrNum( this, "detune" );
				this.#updateWave( "detune", val2 );
				break;
		}
		gsuiOscillator.#setTextValue( span, prop, val2 );
		this.$dispatch( "liveChange", prop, val );
	}
}

GSUdefineElement( "gsui-oscillator", gsuiOscillator );
