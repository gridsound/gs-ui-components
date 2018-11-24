"use strict";

class gsuiOscillator {
	constructor() {
		const root = gsuiOscillator.template.cloneNode( true ),
			sliders = {},
			waves = [
				new gsuiPeriodicWave(),
				new gsuiPeriodicWave()
			];

		this.onchange = () => {};
		this.rootElement = root;
		this._waves = waves;
		this._selectWaves = {};
		"sine triangle sawtooth square".split( " " ).forEach( w => this._selectWaves[ w ] = true );
		root.querySelector( ".gsuiOscillator-typeWaves" ).append(
			waves[ 0 ].rootElement,
			waves[ 1 ].rootElement );
		waves[ 0 ].frequency =
		waves[ 1 ].frequency = 1;
		root.querySelector( ".gsuiOscillator-typePrev" ).onclick = this._onclickPrevNext.bind( this, -1 );
		root.querySelector( ".gsuiOscillator-typeNext" ).onclick = this._onclickPrevNext.bind( this, 1 );
		root.querySelector( ".gsuiOscillator-remove" ).onclick = () => this.onremove && this.onremove();
		this._elSelect = root.querySelector( "select" );
		this._elSelect.onchange = this._onchangeSelect.bind( this );
		this._elSelect.onkeydown = e => {
			if ( e.keyCode < 37 || e.keyCode > 40 ) {
				e.preventDefault();
			}
		};
		this._sliders = Array.from( root.querySelectorAll(
			"div[data-filter]" ) ).reduce( ( obj, el ) => {
				const slider = new gsuiSlider(),
					attr = el.dataset.filter;

				el.querySelector( ".gsuiOscillator-sliderWrap" ).append( slider.rootElement );
				slider.onchange = this._onchangeSlider.bind( this, attr );
				slider.oninput = this._oninputSlider.bind( this, attr );
				obj[ attr ] = {
					slider,
					elValue: el.querySelector( ".gsuiOscillator-sliderValue" )
				};
				return obj;
			}, sliders );
		sliders.gain.slider.options(   { type: "circular", min:    0, max:   1, step:  .01 } );
		sliders.pan.slider.options(    { type: "circular", min:   -1, max:   1, step:  .02 } );
		sliders.detune.slider.options( { type: "circular", min: -100, max: 100, step: 5    } );
		this.store = {};
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
		if ( "gain" in obj ) {
			waveDraw = true;
			this._gain = obj.gain;
			this.store.gain = this._sliderSetValue( "gain", obj.gain );
		}
		if ( "pan" in obj ) {
			waveDraw = true;
			this._pan0 = obj.pan < 0 ? 1 : ( 1 - obj.pan );
			this._pan1 = obj.pan > 0 ? 1 : ( 1 + obj.pan );
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
	_oninputSlider( attr, val ) {
		if ( attr === "gain" ) {
			this._gain = val;
			this._updateWaves();
		} else if ( attr === "pan" ) {
			this._pan0 = val < 0 ? 1 : ( 1 - val );
			this._pan1 = val > 0 ? 1 : ( 1 + val );
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

gsuiOscillator.attrSliders = [ "gain", "pan", "detune" ];

gsuiOscillator.template = document.querySelector( "#gsuiOscillator-template" );
gsuiOscillator.template.remove();
gsuiOscillator.template.removeAttribute( "id" );
