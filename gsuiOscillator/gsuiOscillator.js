"use strict";

class gsuiOscillator {
	constructor() {
		const root = gsuiOscillator.template.cloneNode( true ),
			qs = c => root.querySelector( `.gsuiOscillator-${ c }` ),
			sliders = {},
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
		this._sliders = sliders;
		this._selectWaves = {};
		this._elSelect = qs( "typeSelect" );
		this._timeidType = null;
		Object.seal( this );

		waves[ 0 ].frequency =
		waves[ 1 ].frequency = 1;
		qs( "typeWaves" ).append(
			waves[ 0 ].rootElement,
			waves[ 1 ].rootElement );
		GSDataOscillator.nativeTypes.forEach( w => this._selectWaves[ w ] = true );
		this._elSelect.onchange = this._onchangeSelect.bind( this );
		this._elSelect.onkeydown = this._onkeydownSelect.bind( this );
		qs( "typePrev" ).onclick = this._onclickPrevNext.bind( this, -1 );
		qs( "typeNext" ).onclick = this._onclickPrevNext.bind( this, 1 );
		qs( "remove" ).onclick = () => this.onremove();
		this._initSlider( qs( "pan" ), "pan", -1, 1, .02 );
		this._initSlider( qs( "gain" ), "gain", 0, 1, .01 );
		this._initSlider( qs( "detune" ), "detune", -100, 100, 5 );
		this.gsdata.recall();
	}

	remove() {
		this.rootElement.remove();
	}
	attached() {
		this._waves[ 0 ].attached();
		this._waves[ 1 ].attached();
		this._sliders.pan.slider.attached();
		this._sliders.gain.slider.attached();
		this._sliders.detune.slider.attached();
	}
	addWaves( arr ) {
		const opts = [];

		arr.sort();
		arr.forEach( w => {
			if ( !this._selectWaves[ w ] ) {
				const opt = document.createElement( "option" );

				this._selectWaves[ w ] = true;
				opt.value = w;
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
		const s = this._sliders[ prop ];

		s.slider.setValue( val );
		s.elValue.textContent = val;
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
	_initSlider( elWrap, prop, min, max, step ) {
		const slider = new gsuiSlider();

		elWrap.querySelector( ".gsuiOscillator-sliderWrap" ).append( slider.rootElement );
		slider.options( { type: "circular", min, max, step } );
		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = this.gsdata.callAction.bind( this.gsdata, "changeProp", prop );
		this._sliders[ prop ] = {
			slider,
			elValue: elWrap.querySelector( ".gsuiOscillator-sliderValue" )
		};
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

		if ( prop === "gain" ) {
			this._updateWaves( { ...d, gain: val } );
		} else if ( prop === "pan" ) {
			this._updateWaves( { ...d, pan: val } );
		// } else if ( prop === "detune" ) {
			// this._updateWaves( { ...d, detunes: val } );
		}
		this._sliders[ prop ].elValue.textContent = val;
		this.oninput( prop, val );
	}
}

gsuiOscillator.template = document.querySelector( "#gsuiOscillator-template" );
gsuiOscillator.template.remove();
gsuiOscillator.template.removeAttribute( "id" );

Object.freeze( gsuiOscillator );
