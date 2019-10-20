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
					changeFrequency: this._changeProp.bind( this, "frequency" ),
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
		Q.options( { type: "circular", min: .001, max: 25, step: .001 } );
		gain.options( { type: "linear-y", min: -50, max: 50, step: .1 } );
		detune.options( { type: "circular", min: -12 * 100, max: 12 * 100, step: 10 } );
		frequency.options( { type: "linear-x", min: 10, max: 24000, step: 10 } );
		Q.oninput = this._oninputProp.bind( this, "Q" );
		gain.oninput = this._oninputProp.bind( this, "gain" );
		detune.oninput = this._oninputProp.bind( this, "detune" );
		frequency.oninput = this._oninputProp.bind( this, "frequency" );
		Q.onchange = gsdata.callAction.bind( gsdata, "changeProp", "Q" );
		gain.onchange = gsdata.callAction.bind( gsdata, "changeProp", "gain" );
		detune.onchange = gsdata.callAction.bind( gsdata, "changeProp", "detune" );
		frequency.onchange = gsdata.callAction.bind( gsdata, "changeProp", "frequency" );
		elGraph.append( uiCurves.rootElement );
		this._attachSlider( "areaQ", "Q" );
		this._attachSlider( "areaGain", "gain" );
		this._attachSlider( "areaDetune", "detune" );
		this._attachSlider( "areaFrequency", "frequency" );
		this._toggleTypeBtn( this.gsdata.data.type, true );
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
	}
	resized() {
		this._uiCurves.resized();
	}
	change( obj ) {
		this.gsdata.change( obj );
		this._redrawGraph();
	}

	// .........................................................................
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
	_changeProp( prop, val ) {
		this._uiSliders.get( prop ).setValue( val );
	}
	_toggleTypeBtn( type, b ) {
		this._elType.querySelector( `[data-type="${ type }"]` )
			.classList.toggle( "gsuiFxFilter-areaType-btnSelected", b );
	}
	_attachSlider( clazz, prop ) {
		this.rootElement.querySelector( `.gsuiFxFilter-${ clazz } .gsuiFxFilter-area-content` )
			.append( this._uiSliders.get( prop ).rootElement );
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
