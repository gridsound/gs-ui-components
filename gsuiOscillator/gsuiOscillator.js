"use strict";

class gsuiOscillator {
	constructor() {
		const root = gsuiOscillator.template.cloneNode( true ),
			qs = c => root.querySelector( `.gsuiOscillator-${ c }` ),
			waves = [
				new gsuiPeriodicWave(),
				new gsuiPeriodicWave(),
			];

		this.rootElement = root;
		this.oninput =
		this.onchange = () => {};
		this._data = {};
		this._typeSaved = "";
		this._waves = waves;
		this._elSelect = qs( "waveSelect" );
		this._timeidType = null;
		this._sliders = Object.freeze( {
			pan: this._initSlider( "pan", -1, 1, .02 ),
			gain: this._initSlider( "gain", 0, 1, .01 ),
			detune: this._initSlider( "detune", -24, 24, 1 ),
		} );
		this._selectWaves = {
			sine: true,
			triangle: true,
			sawtooth: true,
			square: true,
		};
		Object.seal( this );

		waves[ 0 ].frequency =
		waves[ 1 ].frequency = 1;
		qs( "wave" ).append(
			waves[ 0 ].rootElement,
			waves[ 1 ].rootElement );
		this._elSelect.onchange = this._onchangeSelect.bind( this );
		this._elSelect.onkeydown = this._onkeydownSelect.bind( this );
		qs( "wavePrev" ).onclick = this._onclickPrevNext.bind( this, -1 );
		qs( "waveNext" ).onclick = this._onclickPrevNext.bind( this, 1 );
		qs( "remove" ).onclick = () => this.onchange( "removeOscillator" );
	}

	// .........................................................................
	attached() {
		this._waves[ 0 ].attached();
		this._waves[ 1 ].attached();
		this._sliders.pan[ 0 ].attached();
		this._sliders.gain[ 0 ].attached();
		this._sliders.detune[ 0 ].attached();
	}
	addWaves( arr ) {
		const opts = [];

		arr.sort();
		arr.forEach( w => {
			if ( !this._selectWaves[ w ] ) {
				const opt = document.createElement( "option" );

				this._selectWaves[ w ] = true;
				opt.value = w;
				opt.className = "gsuiOscillator-waveOpt";
				opt.textContent = w;
				opts.push( opt );
			}
		} );
		Element.prototype.append.apply( this._elSelect, opts );
	}
	updateWave() {
		const [ wav0, wav1 ] = this._waves,
			{ type, gain, pan } = this._data;

		wav0.amplitude = Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 );
		wav1.amplitude = Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 );
		wav0.type =
		wav1.type = type;
		wav0.draw();
		wav1.draw();
	}

	// .........................................................................
	change( prop, val ) {
		switch ( prop ) {
			case "order": this._changeOrder( val ); break;
			case "type": this._changeType( val ); break;
			case "pan":
			case "gain":
			case "detune": this._changeProp( prop, val ); break;
		}
	}
	_changeOrder( n ) {
		this.rootElement.dataset.order = n;
	}
	_changeType( type ) {
		this._data.type =
		this._elSelect.value = type;
	}
	_changeProp( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		this._data[ prop ] = val;
		sli.setValue( val );
		span.textContent = prop === "detune" ? val : val.toFixed( 2 );
	}

	// .........................................................................
	_initSlider( prop, min, max, step ) {
		const slider = new gsuiSlider(),
			sel = `.gsuiOscillator-${ prop } .gsuiOscillator-slider`,
			elValue = this.rootElement.querySelector( `${ sel }Value` ),
			elSliderWrap = this.rootElement.querySelector( `${ sel }Wrap` );

		slider.options( { type: "circular", min, max, step } );
		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = val => this.onchange( "changeOscillator", prop, val );
		elSliderWrap.append( slider.rootElement );
		return Object.freeze( [ slider, elValue ] );
	}

	// events:
	// .........................................................................
	_onclickPrevNext( dir ) {
		const sel = this._elSelect,
			currOpt = sel.querySelector( `option[value="${ sel.value }"]` ),
			opt = dir < 0
				? currOpt.previousElementSibling
				: currOpt.nextElementSibling;

		if ( opt ) {
			sel.value = opt.value;
			this._onchangeSelect();
		}
	}
	_onchangeSelect() {
		const type = this._elSelect.value;

		this._data.type = type;
		clearTimeout( this._timeidType );
		this.updateWave();
		this.oninput( "type", type );
		this._timeidType = setTimeout( () => {
			if ( type !== this._typeSaved ) {
				this.onchange( "changeOscillator", "type", type );
			}
		}, 700 );
	}
	_onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	_oninputSlider( prop, val ) {
		let val2 = val;

		if ( prop === "gain" ) {
			this._data.gain = val;
			this.updateWave();
			val2 = +val.toFixed( 2 );
		} else if ( prop === "pan" ) {
			this._data.pan = val;
			this.updateWave();
			val2 = +val.toFixed( 2 );
		}
		this._sliders[ prop ][ 1 ].textContent = val2;
		this.oninput( prop, val2 );
	}
}

gsuiOscillator.template = document.querySelector( "#gsuiOscillator-template" );
gsuiOscillator.template.remove();
gsuiOscillator.template.removeAttribute( "id" );

Object.freeze( gsuiOscillator );
