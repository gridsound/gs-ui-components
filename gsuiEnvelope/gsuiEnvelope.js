"use strict";

class gsuiEnvelope extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-envelope" ),
			elWave = children[ 1 ].firstChild,
			beatlines = children[ 6 ].firstChild,
			sliders = Object.freeze( {
				attack: [ children[ 1 ].lastChild.firstChild, children[ 1 ].firstChild.lastChild ],
				hold: [ children[ 2 ].lastChild.firstChild, children[ 2 ].firstChild.lastChild ],
				decay: [ children[ 3 ].lastChild.firstChild, children[ 3 ].firstChild.lastChild ],
				substain: [ children[ 4 ].lastChild.firstChild, children[ 4 ].firstChild.lastChild ],
				release: [ children[ 5 ].lastChild.firstChild, children[ 5 ].firstChild.lastChild ],
			} );

		super();
		this._children = children;
		this._wave = elWave.firstChild;
		this._sliders = sliders;
		this._beatlines = beatlines;
		this._dur = 4;
		this._waveWidth = 300;
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiEnvelope" );
		this._onresize = this._onresize.bind( this );
		Object.seal( this );

		this.onchange = this._onchangeForm.bind( this );
		this._initSlider( "attack" );
		this._initSlider( "hold" );
		this._initSlider( "decay" );
		this._initSlider( "substain" );
		this._initSlider( "release" );
	}

	// .........................................................................
	connectedCallback() {
		if ( this._children ) {
			this.classList.add( "gsuiEnvelope" );
			this.append( ...this._children );
			this._children = null;
		}
		GSUI.observeSizeOf( this, this._onresize );
	}
	disconnectedCallback() {
		GSUI.unobserveSizeOf( this, this._onresize );
	}
	static get observedAttributes() {
		return [ "toggle", "attack", "hold", "decay", "substain", "release" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "toggle": this._changeToggle( val === "true" ); break;
				case "attack":
				case "hold":
				case "decay":
				case "substain":
				case "release":
					this._changeProp( prop, +val );
					break;
			}
		}
	}

	// .........................................................................
	timeSignature( a, b ) {
		this._beatlines.setAttribute( "timesignature", `${ a },${ b }` );
		this.updateWave();
	}
	updateWave( prop, val ) {
		// const w = this._wave;

		// w.type = this.getAttribute( "type" );
		// w.delay = prop === "delay" ? val : +this.getAttribute( "delay" );
		// w.attack = prop === "attack" ? val : +this.getAttribute( "attack" );
		// w.frequency = prop === "speed" ? val : +this.getAttribute( "speed" );
		// w.amplitude = prop === "amp" ? val : +this.getAttribute( "amp" );
		// w.duration =
		// this._dur = Math.max( w.delay + w.attack + 2, this._beatlines.getBeatsPerMeasure() );
		// w.draw();
		this._updatePxPerBeat();
	}

	// .........................................................................
	_changeToggle( b ) {
		this.classList.toggle( "gsuiEnvelope-enable", b );
		this._sliders.attack[ 0 ].enable( b );
		this._sliders.hold[ 0 ].enable( b );
		this._sliders.decay[ 0 ].enable( b );
		this._sliders.substain[ 0 ].enable( b );
		this._sliders.release[ 0 ].enable( b );
	}
	_changeProp( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	_updatePxPerBeat() {
		this._beatlines.setAttribute( "pxperbeat", this._waveWidth / this._dur );
	}
	_initSlider( prop ) {
		const slider = this._sliders[ prop ][ 0 ];

		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = this._onchangeSlider.bind( this, prop );
	}

	// events:
	// .........................................................................
	_onresize() {
		this._waveWidth = this._beatlines.getBoundingClientRect().width;
		this._updatePxPerBeat();
		// this._wave.resized();
	}
	_onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiEnvelope-toggle": this._dispatch( "toggle" ); break;
		}
	}
	_oninputSlider( prop, val ) {
		this._sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave( prop, val );
		this._dispatch( "liveChange", prop, val );
	}
	_onchangeSlider( prop, val ) {
		this._dispatch( "change", prop, val );
	}
}

customElements.define( "gsui-envelope", gsuiEnvelope );

Object.freeze( gsuiEnvelope );
