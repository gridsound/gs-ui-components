"use strict";

class gsuiOscillator {
	constructor() {
		const root = gsuiOscillator.template.cloneNode( true ),
			qs = c => root.querySelector( `.gsuiOscillator-${ c }` ),
			waves = [
				new gsuiPeriodicWave(),
				new gsuiPeriodicWave()
			],
			gsdata = new GSDataOscillator( {
				actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
				dataCallbacks: {
					order: n => this.rootElement.dataset.order = n,
					type: this._changeType.bind( this ),
					pan: this._changeProp.bind( this, "pan" ),
					gain: this._changeProp.bind( this, "gain" ),
					detune: this._changeProp.bind( this, "detune" ),
					drawWave: this._updateWaves.bind( this ),
				},
			} );

		this.oninput =
		this.onchange =
		this.onremove = GSData.noop;
		this.rootElement = root;
		this.gsdata = gsdata;
		this._waves = waves;
		this._selectWaves = {};
		this._elSelect = qs( "waveSelect" );
		this._timeidType = null;
		this._sliders = Object.freeze( {
			pan: this._initSlider( "pan", -1, 1, .02 ),
			gain: this._initSlider( "gain", 0, 1, .01 ),
			detune: this._initSlider( "detune", -24, 24, 1 ),
		} );
		Object.seal( this );

		waves[ 0 ].frequency =
		waves[ 1 ].frequency = 1;
		qs( "wave" ).append(
			waves[ 0 ].rootElement,
			waves[ 1 ].rootElement );
		GSDataOscillator.nativeTypes.forEach( w => this._selectWaves[ w ] = true );
		this._elSelect.onchange = this._onchangeSelect.bind( this );
		this._elSelect.onkeydown = this._onkeydownSelect.bind( this );
		qs( "wavePrev" ).onclick = this._onclickPrevNext.bind( this, -1 );
		qs( "waveNext" ).onclick = this._onclickPrevNext.bind( this, 1 );
		qs( "remove" ).onclick = () => this.onremove();
		this.gsdata.recall();
	}

	remove() {
		this.rootElement.remove();
	}
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
	change( obj ) {
		this.gsdata.change( obj );
	}

	// .........................................................................
	_changeType( type ) {
		this._elSelect.value = type;
	}
	_changeProp( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		sli.setValue( val );
		span.textContent = prop === "detune" ? val : val.toFixed( 2 );
	}
	_updateWaves( { type, gain, pan } ) {
		const [ wav0, wav1 ] = this._waves;

		wav0.amplitude = Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 );
		wav1.amplitude = Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 );
		wav0.type =
		wav1.type = type;
		wav0.draw();
		wav1.draw();
	}

	// .........................................................................
	_initSlider( prop, min, max, step ) {
		const slider = new gsuiSlider(),
			sel = `.gsuiOscillator-${ prop } .gsuiOscillator-slider`,
			elValue = this.rootElement.querySelector( `${ sel }Value` ),
			elSliderWrap = this.rootElement.querySelector( `${ sel }Wrap` );

		slider.options( { type: "circular", min, max, step } );
		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = this.gsdata.callAction.bind( this.gsdata, "changeProp", prop );
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

		this._updateWaves( { ...this.gsdata.data, type } );
		this.oninput( "type", type );
		clearTimeout( this._timeidType );
		this._timeidType = setTimeout( () => {
			if ( this.gsdata.data.type !== type ) {
				this.gsdata.callAction( "changeProp", "type", type );
			}
		}, 700 );
	}
	_onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	_oninputSlider( prop, val ) {
		const d = this.gsdata.data;
		let span = this._sliders[ prop ][ 1 ],
			val2 = val;

		if ( prop === "gain" ) {
			this._updateWaves( { ...d, gain: val } );
			val2 = val.toFixed( 2 );
		} else if ( prop === "pan" ) {
			this._updateWaves( { ...d, pan: val } );
			val2 = val.toFixed( 2 );
		}
		span.textContent = val2;
		this.oninput( prop, val2 );
	}
}

gsuiOscillator.template = document.querySelector( "#gsuiOscillator-template" );
gsuiOscillator.template.remove();
gsuiOscillator.template.removeAttribute( "id" );

Object.freeze( gsuiOscillator );
