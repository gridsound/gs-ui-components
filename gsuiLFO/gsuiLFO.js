"use strict";

class gsuiLFO {
	constructor() {
		const root = gsuiLFO.template.cloneNode( true ),
			elTypeForm = root.querySelector( "form.gsuiLFO-propContent" ),
			elWave = root.querySelector( ".gsuiLFO-wave" ),
			wave = new gsuiPeriodicWave(),
			beatlines = new gsuiBeatlines( elWave ),
			sliders = Object.freeze( {
				delay: [ new gsuiSlider(), root.querySelector( ".gsuiLFO-delay .gsuiLFO-propValue" ) ],
				attack: [ new gsuiSlider(), root.querySelector( ".gsuiLFO-attack .gsuiLFO-propValue" ) ],
				speed: [ new gsuiSlider(), root.querySelector( ".gsuiLFO-speed .gsuiLFO-propValue" ) ],
				amp: [ new gsuiSlider(), root.querySelector( ".gsuiLFO-amp .gsuiLFO-propValue" ) ],
			} );

		this.rootElement = root;
		this.oninput =
		this.onchange = () => {};
		this._wave = wave;
		this._sliders = sliders;
		this._beatlines = beatlines;
		this._dur = 4;
		this._waveWidth = 300;
		this._data = Object.seal( {
			type: "",
			delay: 0,
			attack: 0,
			speed: 0,
			amp: 0,
		} );
		Object.seal( this );

		elTypeForm.onchange = this._onchangeType.bind( this );
		root.querySelector( ".gsuiLFO-toggle" ).onclick = () => this.onchange( "toggleLFO" );
		elWave.append( wave.rootElement );
		this._initSlider( "delay", 0, 4, 1 / 4 / 8 );
		this._initSlider( "attack", 0, 4, 1 / 4 / 8 );
		this._initSlider( "speed", 1 / 4, 18, 1 / 8 );
		this._initSlider( "amp", 0, 1, .001 );
	}

	// .........................................................................
	attached() {
		this._sliders.delay[ 0 ].attached();
		this._sliders.attack[ 0 ].attached();
		this._sliders.speed[ 0 ].attached();
		this._sliders.amp[ 0 ].attached();
		this._wave.attached();
		this.resizing();
	}
	resizing() {
		this._waveWidth = this._beatlines.rootElement.getBoundingClientRect().width;
		this._updatePxPerBeat();
	}
	resize() {
		this.resizing();
		this._wave.resized();
		this._beatlines.render();
	}
	timeSignature( a, b ) {
		this._beatlines.timeSignature( a, b );
		this.updateWave();
	}
	updateWave() {
		const bPM = this._beatlines.getBeatsPerMeasure(),
			d = this._data;

		this._dur =
		this._wave.duration = Math.max( d.delay + d.attack + 2, bPM );
		this._wave.type = d.type;
		this._wave.delay = d.delay;
		this._wave.attack = d.attack;
		this._wave.frequency = d.speed;
		this._wave.amplitude = d.amp;
		this._wave.draw();
		this._wave.rootElement.style.opacity = Math.min( 6 / d.speed, 1 );
		this._updatePxPerBeat();
		this._beatlines.render();
	}

	// .........................................................................
	change( prop, val ) {
		switch ( prop ) {
			case "toggle": this._changeToggle( val ); break;
			case "type": this._changeType( val ); break;
			case "amp":
			case "delay":
			case "speed":
			case "attack": this._changeProp( prop, val ); break;
		}
	}
	_changeToggle( b ) {
		this.rootElement.classList.toggle( "gsuiLFO-enable", b );
		this.rootElement.querySelectorAll( ".gsuiLFO-typeRadio" )
			.forEach( b
				? el => el.removeAttribute( "disabled" )
				: el => el.setAttribute( "disabled", "" ) );
		this._sliders.delay[ 0 ].enable( b );
		this._sliders.attack[ 0 ].enable( b );
		this._sliders.speed[ 0 ].enable( b );
		this._sliders.amp[ 0 ].enable( b );
	}
	_changeType( type ) {
		this._data.type =
		this._wave.type = type;
		this.rootElement.querySelector( `.gsuiLFO-typeRadio[value="${ type }"]` ).checked = true;
	}
	_changeProp( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		this._data[ prop ] = val;
		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	_updatePxPerBeat() {
		this._beatlines.pxPerBeat( this._waveWidth / this._dur );
	}
	_initSlider( prop, min, max, step ) {
		const elWrap = this.rootElement.querySelector( `.gsuiLFO-${ prop } .gsuiLFO-propContent` ),
			slider = this._sliders[ prop ][ 0 ];

		slider.options( { type: "linear-x", min, max, step, mousemoveSize: 800 } );
		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = val => this.onchange( "changeLFO", prop, val );
		elWrap.append( slider.rootElement );
	}

	// events:
	// .........................................................................
	_onchangeType( e ) {
		this.onchange( "changeLFO", "type", e.target.value );
	}
	_oninputSlider( prop, val ) {
		this._data[ prop ] = val;
		this._sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave();
		this.oninput( prop, val );
	}
}

gsuiLFO.template = document.querySelector( "#gsuiLFO-template" );
gsuiLFO.template.remove();
gsuiLFO.template.removeAttribute( "id" );

Object.freeze( gsuiLFO );
