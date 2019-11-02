"use strict";

class gsuiOscillator {
	constructor() {
		const root = gsuiOscillator.template.cloneNode( true ),
			qs = c => root.querySelector( `.gsuiOscillator-${ c }` ),
			sliders = {},
			waves = [
				new gsuiPeriodicWave(),
				new gsuiPeriodicWave()
			];

		this.oninput =
		this.onchange =
		this.onremove = GSData.noop;
		this.rootElement = root;
		this.store = {};
		this._waves = waves;
		this._sliders = sliders;
		this._selectWaves = {};
		this._elSelect = qs( "typeSelect" );
		this._gain =
		this._pan0 =
		this._pan1 = 0;
		this._timeidType = null;
		Object.seal( this );

		qs( "typeWaves" ).append(
			waves[ 0 ].rootElement,
			waves[ 1 ].rootElement );
		waves[ 0 ].frequency =
		waves[ 1 ].frequency = 1;
		"sine triangle sawtooth square".split( " " ).forEach( w => this._selectWaves[ w ] = true );
		this._elSelect.onchange = this._onchangeSelect.bind( this );
		this._elSelect.onkeydown = this._onkeydownSelect.bind( this );
		qs( "typePrev" ).onclick = this._onclickPrevNext.bind( this, -1 );
		qs( "typeNext" ).onclick = this._onclickPrevNext.bind( this, 1 );
		qs( "remove" ).onclick = () => this.onremove();
		root.querySelectorAll( "div[data-filter]" ).forEach( el => {
			const slider = new gsuiSlider(),
				attr = el.dataset.filter;

			el.querySelector( ".gsuiOscillator-sliderWrap" ).append( slider.rootElement );
			slider.oninput = this._oninputSlider.bind( this, attr );
			slider.onchange = this._onchangeSlider.bind( this, attr );
			sliders[ attr ] = {
				slider,
				elValue: el.querySelector( ".gsuiOscillator-sliderValue" )
			};
		} );
		sliders.gain.slider.options(   { type: "circular", min:    0, max:   1, step:  .01 } );
		sliders.pan.slider.options(    { type: "circular", min:   -1, max:   1, step:  .02 } );
		sliders.detune.slider.options( { type: "circular", min: -100, max: 100, step: 5    } );
		this.change( {
			type: "sine",
			gain: 1,
			pan: 0,
			detune: 0,
		} );
	}

	remove() {
		this.rootElement.remove();
	}
	attached() {
		const sliders = this._sliders;

		this._waves[ 0 ].attached();
		this._waves[ 1 ].attached();
		sliders.pan.slider.attached();
		sliders.gain.slider.attached();
		sliders.detune.slider.attached();
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
		let waveDraw;

		if ( obj.type ) {
			waveDraw = true;
			this._elSelect.value =
			this.store.type = obj.type;
		}
		if ( "order" in obj ) {
			this.rootElement.dataset.order = obj.order;
		}
		if ( "gain" in obj ) {
			waveDraw = true;
			this._gain = obj.gain;
			this.store.gain = this._sliderSetValue( "gain", obj.gain );
		}
		if ( "pan" in obj ) {
			waveDraw = true;
			this._pan0 = obj.pan < 0 ? 1 : 1 - obj.pan;
			this._pan1 = obj.pan > 0 ? 1 : 1 + obj.pan;
			this.store.pan = this._sliderSetValue( "pan", obj.pan );
		}
		if ( "detune" in obj ) {
			this.store.detune = this._sliderSetValue( "detune", obj.detune );
		}
		waveDraw && this._updateWaves();
	}

	// private:
	_updateWaves() {
		const wav0 = this._waves[ 0 ],
			wav1 = this._waves[ 1 ];

		wav0.amplitude = Math.min( this._gain * this._pan0, .95 );
		wav1.amplitude = Math.min( this._gain * this._pan1, .95 );
		wav0.type =
		wav1.type = this._elSelect.value;
		wav0.draw();
		wav1.draw();
	}
	_sliderSetValue( attr, val ) {
		const s = this._sliders[ attr ];

		s.slider.setValue( val );
		s.elValue.textContent = s.slider.value;
		return s.slider.value;
	}

	// events:
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

		this._updateWaves();
		this.oninput && this.oninput( "type", type );
		clearTimeout( this._timeidType );
		this._timeidType = setTimeout( () => {
			if ( this.store.type !== type ) {
				this.store.type = type;
				this.onchange( { type } );
			}
		}, 700 );
	}
	_onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	_oninputSlider( attr, val ) {
		if ( attr === "gain" ) {
			this._gain = val;
			this._updateWaves();
		} else if ( attr === "pan" ) {
			this._pan0 = val < 0 ? 1 : 1 - val;
			this._pan1 = val > 0 ? 1 : 1 + val;
			this._updateWaves();
		}
		this._sliders[ attr ].elValue.textContent = val;
		this.oninput && this.oninput( attr, val );
	}
	_onchangeSlider( attr, val ) {
		this.store[ attr ] = val;
		this.onchange( { [ attr ]: val } );
	}
}

gsuiOscillator.template = document.querySelector( "#gsuiOscillator-template" );
gsuiOscillator.template.remove();
gsuiOscillator.template.removeAttribute( "id" );

Object.freeze( gsuiOscillator );
