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
			} ),
			gsdata = new GSDataLFO( {
				actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
				dataCallbacks: {
					type: this._changeType.bind( this ),
					toggle: this._toggle.bind( this ),
					drawWave: this._updateWave.bind( this ),
					delay: this._setPropValue.bind( this, "delay", ),
					attack: this._setPropValue.bind( this, "attack", ),
					speed: this._setPropValue.bind( this, "speed", ),
					amp: this._setPropValue.bind( this, "amp", ),
				},
			} );

		this.oninput =
		this.onchange =
		this.onremove = GSData.noop;
		this.rootElement = root;
		this.gsdata = gsdata;
		this._wave = wave;
		this._sliders = sliders;
		this._beatlines = beatlines;
		this._dur = 4;
		this._waveWidth = 300;
		Object.seal( this );

		elTypeForm.onchange = this._onchangeType.bind( this );
		root.querySelector( ".gsuiLFO-toggle" ).onclick = gsdata.callAction.bind( gsdata, "toggle" );
		elWave.append( wave.rootElement );
		this._initSlider( "delay", 0, 4, 1 / 4 / 8 );
		this._initSlider( "attack", 0, 4, 1 / 4 / 8 );
		this._initSlider( "speed", 1 / 4, 18, 1 / 8 );
		this._initSlider( "amp", 0, 1, .001 );
	}

	remove() {
		this.rootElement.remove();
	}
	attached() {
		this._sliders.delay[ 0 ].attached();
		this._sliders.attack[ 0 ].attached();
		this._sliders.speed[ 0 ].attached();
		this._sliders.amp[ 0 ].attached();
		this._wave.attached();
		this.resizing();
		this.gsdata.recall();
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
	}
	change( obj ) {
		this.gsdata.change( obj );
	}

	// .........................................................................
	_updateWave( obj ) {
		const bPM = this._beatlines.getBeatsPerMeasure();

		this._dur =
		this._wave.duration = Math.max( obj.delay + obj.attack, bPM ) + bPM;
		this._wave.type = obj.type;
		this._wave.delay = obj.delay;
		this._wave.attack = obj.attack;
		this._wave.frequency = obj.speed;
		this._wave.amplitude = obj.amp;
		this._wave.draw();
		this._updatePxPerBeat();
		this._beatlines.render();
	}
	_updatePxPerBeat() {
		this._beatlines.pxPerBeat( this._waveWidth / this._dur );
	}
	_toggle( b ) {
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
		this._wave.type = type;
		this.rootElement.querySelector( `.gsuiLFO-typeRadio[value="${ type }"]` ).checked = true;
	}
	_initSlider( prop, min, max, step ) {
		const elWrap = this.rootElement.querySelector( `.gsuiLFO-${ prop } .gsuiLFO-propContent` ),
			slider = this._sliders[ prop ][ 0 ];

		slider.options( { type: "linear-x", min, max, step } );
		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = this.gsdata.callAction.bind( this.gsdata, "changeProp", prop );
		elWrap.append( slider.rootElement );
	}
	_setPropValue( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	_onchangeType( e ) {
		this.gsdata.callAction( "changeProp", "type", e.target.value );
	}
	_oninputSlider( prop, val ) {
		this._sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this._updateWave( {
			...this.gsdata.data,
			[ prop ]: val,
		} );
	}
}

gsuiLFO.template = document.querySelector( "#gsuiLFO-template" );
gsuiLFO.template.remove();
gsuiLFO.template.removeAttribute( "id" );

Object.freeze( gsuiLFO );
