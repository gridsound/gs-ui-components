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
			] ),
			gsdata = new GSDataFxFilter( {
				actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
				dataCallbacks: {
					changeType: this._changeType.bind( this ),
					changeQ: this._changeProp.bind( this, "Q" ),
					changeGain: this._changeProp.bind( this, "gain" ),
					changeDetune: this._changeProp.bind( this, "detune" ),
					changeFrequency: this._changeFrequency.bind( this ),
				},
			} );

		this.rootElement = root;
		this.gsdata = gsdata;
		this.askData =
		this.oninput =
		this.onchange = GSData.noop;
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
		this.gsdata.recall();
		this._redrawGraph();
	}
	resized() {
		this._uiCurves.resized();
	}
	change( obj ) {
		this.gsdata.change( obj );
		this._redrawGraph();
	}

	// .........................................................................
	_frequencyPow( Hz ) {
		return this._nyquist * ( 2 ** ( Hz * 11 - 11 ) );
	}
	_initSlider( area, prop, opt, fnValue = GSData.noopReturn ) {
		const slider = this._uiSliders.get( prop ),
			elArea = this.rootElement.querySelector( `.gsuiFxFilter-${ area } .gsuiFxFilter-area-content` );

		slider.options( opt );
		slider.oninput = val => this._oninputProp( prop, fnValue( val ) );
		slider.onchange = val => this.gsdata.callAction( "changeProp", prop, fnValue( val ) );
		elArea.append( slider.rootElement );
	}
	_redrawGraph() {
		if ( this._attached ) {
			const curve = this.askData( "curve", this._uiCurves.getWidth() );

			if ( curve ) {
				this._uiCurves.setCurve( "0", curve );
			}
		}
	}
	_changeType( type ) {
		const gainQ = GSDataFxFilter.typeGainQ[ type ];

		this._toggleTypeBtn( this._currType, false );
		this._toggleTypeBtn( type, true );
		this._currType = type;
		this._uiSliders.get( "Q" ).enable( gainQ.Q );
		this._uiSliders.get( "gain" ).enable( gainQ.gain );
	}
	_changeFrequency( Hz ) {
		this._changeProp( "frequency", ( Math.log2( Hz / this._nyquist ) + 11 ) / 11 );
	}
	_changeProp( prop, val ) {
		this._uiSliders.get( prop ).setValue( val );
	}
	_toggleTypeBtn( type, b ) {
		this._elType.querySelector( `[data-type="${ type }"]` )
			.classList.toggle( "gsuiFxFilter-areaType-btnSelected", b );
	}

	// events
	// .........................................................................
	_oninputProp( prop, val ) {
		this.oninput( prop, val );
		this._redrawGraph();
	}
	_onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && type !== this.gsdata.data.type ) {
			this.gsdata.callAction( "changeType", type );
		}
	}
}

gsuiFxFilter.template = document.querySelector( "#gsuiFxFilter" );
gsuiFxFilter.template.remove();
gsuiFxFilter.template.removeAttribute( "id" );

Object.freeze( gsuiFxFilter );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "filter", { cmp: gsuiFxFilter, name: "Filter", height: 160 } );
}
