"use strict";

class gsuiFxFilter {
	constructor() {
		const root = gsuiFxFilter.template.cloneNode( true ),
			elType = root.querySelector( ".gsuiFxFilter-areaType .gsuiFxFilter-area-content" ),
			elGraph = root.querySelector( ".gsuiFxFilter-areaGraph .gsuiFxFilter-area-content" ),
			uiCurves = new gsuiCurves(),
			Q = new gsuiSlider(),
			gain = new gsuiSlider(),
			detune = new gsuiSlider(),
			frequency = new gsuiSlider(),
			uiSliders = new Map( [
				[ "Q", Q ],
				[ "gain", gain ],
				[ "detune", detune ],
				[ "frequency", frequency ],
			] );

		this.rootElement = root;
		this.askData =
		this.oninput =
		this.onchange = () => {};
		this._nyquist = 24000;
		this._uiCurves = uiCurves;
		this._uiSliders = uiSliders;
		this._elType = elType;
		this._attached = false;
		this._currType = "lowpass";
		Object.seal( this );

		elType.onclick = this._onclickType.bind( this );
		elGraph.append( uiCurves.rootElement );
		this._initSlider( "areaQ", "Q", { type: "circular", min: .001, max: 25, step: .001 } );
		this._initSlider( "areaGain", "gain", { type: "linear-y", min: -50, max: 50, step: .1 } );
		this._initSlider( "areaDetune", "detune", { type: "circular", min: -12 * 100, max: 12 * 100, step: 10 } );
		this._initSlider( "areaFrequency", "frequency", { type: "linear-x", min: 0, max: 1, step: .0001 }, this._frequencyPow.bind( this ) );
	}

	// .........................................................................
	setNyquist( n ) {
		this._nyquist = n;
	}
	isAttached() {
		return this._attached;
	}
	attached() {
		this._attached = true;
		this._uiSliders.forEach( sli => sli.attached() );
		this._uiCurves.resized();
		this.updateWave();
	}
	resized() {
		this._uiCurves.resized();
	}
	toggle( b ) {
		this.rootElement.classList.toggle( "gsuiFxFilter-enable", b );
		setTimeout( () => this.updateWave(), 150 );
	}
	updateWave() {
		if ( this._attached ) {
			const curve = this.askData( "curve", this._uiCurves.getWidth() );

			if ( curve ) {
				this._uiCurves.setCurve( "0", curve );
			}
		}
	}

	// .........................................................................
	change( prop, val ) {
		switch ( prop ) {
			case "type": this._changeType( val ); break;
			case "frequency": this._changeFrequency( val ); break;
			case "Q":
			case "gain":
			case "detune": this._uiSliders.get( prop ).setValue( val ); break;
		}
	}
	_changeFrequency( hz ) {
		this._uiSliders.get( "frequency" ).setValue( ( Math.log2( hz / this._nyquist ) + 11 ) / 11 );
	}
	_changeType( type ) {
		const gainQ = gsuiFxFilter.typeGainQ[ type ];

		this._toggleTypeBtn( this._currType, false );
		this._toggleTypeBtn( type, true );
		this._currType = type;
		this._uiSliders.get( "Q" ).enable( gainQ.Q );
		this._uiSliders.get( "gain" ).enable( gainQ.gain );
	}

	// .........................................................................
	_frequencyPow( Hz ) {
		return this._nyquist * ( 2 ** ( Hz * 11 - 11 ) );
	}
	_initSlider( area, prop, opt, fnValue = a => a ) {
		const slider = this._uiSliders.get( prop ),
			elArea = this.rootElement.querySelector( `.gsuiFxFilter-${ area } .gsuiFxFilter-area-content` );

		slider.options( opt );
		slider.oninput = val => this._oninputProp( prop, fnValue( val ) );
		slider.onchange = val => this.onchange( prop, fnValue( val ) );
		elArea.append( slider.rootElement );
	}
	_toggleTypeBtn( type, b ) {
		this._elType.querySelector( `[data-type="${ type }"]` )
			.classList.toggle( "gsuiFxFilter-areaType-btnSelected", b );
	}

	// events
	// .........................................................................
	_oninputProp( prop, val ) {
		this.oninput( prop, val );
		this.updateWave();
	}
	_onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !e.target.classList.contains( "gsuiFxFilter-areaType-btnSelected" ) ) {
			this.onchange( "type", type );
		}
	}
}

gsuiFxFilter.template = document.querySelector( "#gsuiFxFilter" );
gsuiFxFilter.template.remove();
gsuiFxFilter.template.removeAttribute( "id" );

gsuiFxFilter.typeGainQ = GSUtils.deepFreeze( {
	lowpass:   { gain: false, Q: true },
	highpass:  { gain: false, Q: true },
	bandpass:  { gain: false, Q: true },
	lowshelf:  { gain: true,  Q: false },
	highshelf: { gain: true,  Q: false },
	peaking:   { gain: true,  Q: true },
	notch:     { gain: false, Q: true },
	allpass:   { gain: false, Q: true },
} );

Object.freeze( gsuiFxFilter );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "filter", { cmp: gsuiFxFilter, name: "Filter", height: 160 } );
}
