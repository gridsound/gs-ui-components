"use strict";

function gsuiOscillator() {
	var root = gsuiOscillator.template.cloneNode( true ),
		sliders = {},
		waves = [
			new gsuiWave(),
			new gsuiWave()
		];

	this.rootElement = root;
	this._waves = waves;
	root.querySelector( ".gsuiOscillator-typeWaves" ).append(
		waves[ 0 ].rootElement,
		waves[ 1 ].rootElement );
	waves[ 0 ].frequency =
	waves[ 1 ].frequency = 2;
	waves[ 0 ].setResolution( 200, 40 );
	waves[ 1 ].setResolution( 200, 40 );
	root.querySelector( ".gsuiOscillator-typePrev" ).onclick = this._onclickPrevNext.bind( this, -1 );
	root.querySelector( ".gsuiOscillator-typeNext" ).onclick = this._onclickPrevNext.bind( this, 1 );
	root.querySelector( ".gsuiOscillator-remove" ).onclick = _ => this.onremove && this.onremove();
	this._elSelect = root.querySelector( "select" );
	this._elSelect.onchange = this._onchangeSelect.bind( this );
	this._sliders = Array.from( root.querySelectorAll(
		"div[data-filter]" ) ).reduce( ( obj, el ) => {
			var slider = new gsuiSlider(),
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
		detune: 0
	} );
}

gsuiOscillator.template = document.querySelector( "#gsuiOscillator-template" );
gsuiOscillator.template.remove();
gsuiOscillator.template.removeAttribute( "id" );

gsuiOscillator.attrSliders = [ "gain", "pan", "detune" ];
gsuiOscillator.prototype = {
	remove() {
		this.rootElement.remove();
	},
	attach( attachMode, elDist ) {
		var sliders = this._sliders;

		elDist[ attachMode ]( this.rootElement );
		sliders.pan.slider.resized();
		sliders.gain.slider.resized();
		sliders.detune.slider.resized();
	},
	change( obj ) {
		var waveDraw;

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
	},

	// private:
	_updateWaves() {
		var wav = this._waves,
			wav0 = wav[ 0 ],
			wav1 = wav[ 1 ];

		wav0.amplitude = this._gain * this._pan0;
		wav1.amplitude = this._gain * this._pan1;
		wav0.type =
		wav1.type = this.store.type;
		wav0.draw();
		wav1.draw();
	},
	_sliderSetValue( attr, val ) {
		var s = this._sliders[ attr ];

		s.slider.setValue( val );
		s.elValue.textContent = s.slider.value;
		return s.slider.value;
	},

	// events:
	_onclickPrevNext( dir ) {
		var sel = this._elSelect,
			opt = sel.querySelector( `option[value="${ this.store.type }"]` );

		opt = dir < 0
			? opt.previousElementSibling
			: opt.nextElementSibling;
		if ( opt ) {
			sel.value = opt.value;
			this._onchangeSelect();
		}
	},
	_onchangeSelect() {
		var val = this._elSelect.value;

		this.store.type = val;
		this._updateWaves();
		this.oninput && this.oninput( "type", val );
		clearTimeout( this._timeidType );
		this._timeidType = setTimeout( _ => {
			this.onchange && this.onchange( { type: val } );
		}, 700 );
	},
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
	},
	_onchangeSlider( attr, val ) {
		this.store[ attr ] = val;
		this.onchange && this.onchange( { [ attr ]: val } );
	}
};
