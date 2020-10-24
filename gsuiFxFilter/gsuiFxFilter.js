"use strict";

class gsuiFxFilter extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-fx-filter" ),
			elType = children[ 0 ].querySelector( ".gsuiFxFilter-area-content" ),
			elGraph = children[ 1 ].querySelector( ".gsuiFxFilter-area-content" ),
			uiCurves = GSUI.createElement( "gsui-curves" ),
			uiSliders = new Map( [
				[ "Q", children[ 4 ].querySelector( "gsui-slider" ) ],
				[ "gain", children[ 3 ].querySelector( "gsui-slider" ) ],
				[ "detune", children[ 5 ].querySelector( "gsui-slider" ) ],
				[ "frequency", children[ 2 ].querySelector( "gsui-slider" ) ],
			] );

		super();
		this.askData = () => {};
		this._children = children;
		this._nyquist = 24000;
		this._uiCurves = uiCurves;
		this._uiSliders = uiSliders;
		this._elType = elType;
		this._attached = false;
		this._currType = "lowpass";
		this._onresize = this._onresize.bind( this );
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiFxFilter" );
		Object.seal( this );

		elType.onclick = this._onclickType.bind( this );
		elGraph.append( uiCurves );
		this._initSlider( "Q" );
		this._initSlider( "gain" );
		this._initSlider( "detune" );
		this._initSlider( "frequency", this._frequencyPow.bind( this ) );
	}

	// .........................................................................
	connectedCallback() {
		this._attached = true;
		if ( this._children ) {
			this.classList.add( "gsuiFxFilter" );
			this.append( ...this._children );
			this._children = null;
			this._onresize();
			this.updateWave();
		}
		GSUI.observeSizeOf( this, this._onresize );
	}
	disconnectedCallback() {
		this._attached = false;
		GSUI.unobserveSizeOf( this, this._onresize );
	}
	static get observedAttributes() {
		return [ "type", "frequency", "q", "gain", "detune" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "type": {
					const gainQ = gsuiFxFilter.typeGainQ[ val ];

					this._toggleTypeBtn( this._currType, false );
					this._toggleTypeBtn( val, true );
					this._currType = val;
					this._uiSliders.get( "Q" ).enable( gainQ.q );
					this._uiSliders.get( "gain" ).enable( gainQ.gain );
				} break;
				case "q":
					this._uiSliders.get( "Q" ).setValue( +val );
					break;
				case "gain":
				case "detune":
					this._uiSliders.get( prop ).setValue( +val );
					break;
				case "frequency":
					this._uiSliders.get( "frequency" ).setValue( ( Math.log2( val / this._nyquist ) + 11 ) / 11 );
					break;
			}
		}
	}

	// .........................................................................
	setNyquist( n ) {
		this._nyquist = n;
	}
	toggle( b ) {
		this.classList.toggle( "gsuiFxFilter-enable", b );
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
	_frequencyPow( Hz ) {
		return this._nyquist * ( 2 ** ( Hz * 11 - 11 ) );
	}
	_initSlider( prop, fnValue = a => a ) {
		const slider = this._uiSliders.get( prop );

		slider.oninput = val => this._oninputProp( prop, fnValue( val ) );
		slider.onchange = val => this._dispatch( "changeProp", prop, fnValue( val ) );
	}
	_toggleTypeBtn( type, b ) {
		this._elType.querySelector( `[data-type="${ type }"]` )
			.classList.toggle( "gsuiFxFilter-areaType-btnSelected", b );
	}

	// events
	// .........................................................................
	_onresize() {
		this._uiCurves.resized();
	}
	_oninputProp( prop, val ) {
		this._dispatch( "liveChange", prop, val );
		this.updateWave();
	}
	_onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !e.target.classList.contains( "gsuiFxFilter-areaType-btnSelected" ) ) {
			this._dispatch( "changeProp", "type", type );
		}
	}
}

gsuiFxFilter.typeGainQ = GSUtils.deepFreeze( {
	lowpass:   { gain: false, q: true },
	highpass:  { gain: false, q: true },
	bandpass:  { gain: false, q: true },
	lowshelf:  { gain: true,  q: false },
	highshelf: { gain: true,  q: false },
	peaking:   { gain: true,  q: true },
	notch:     { gain: false, q: true },
	allpass:   { gain: false, q: true },
} );

customElements.define( "gsui-fx-filter", gsuiFxFilter );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "filter", { cmp: gsuiFxFilter, name: "Filter", height: 160 } );
}
