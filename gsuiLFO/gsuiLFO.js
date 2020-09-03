"use strict";

class gsuiLFO extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-lfo" ),
			elWave = children[ 1 ].firstChild,
			sliders = Object.freeze( {
				delay: [ children[ 2 ].lastChild.firstChild, children[ 2 ].firstChild.lastChild ],
				attack: [ children[ 3 ].lastChild.firstChild, children[ 3 ].firstChild.lastChild ],
				speed: [ children[ 4 ].lastChild.firstChild, children[ 4 ].firstChild.lastChild ],
				amp: [ children[ 5 ].lastChild.firstChild, children[ 5 ].firstChild.lastChild ],
			} );

		super();
		this._children = children;
		this._beatlines = elWave.firstChild;
		this._wave = elWave.lastChild;
		this._sliders = sliders;
		this._dur = 4;
		this._waveWidth = 300;
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiLFO" );
		this._onresize = this._onresize.bind( this );
		Object.seal( this );

		this.onchange = this._onchangeForm.bind( this );
		this._initSlider( "delay" );
		this._initSlider( "attack" );
		this._initSlider( "speed" );
		this._initSlider( "amp" );
	}

	// .........................................................................
	connectedCallback() {
		if ( this._children ) {
			this.classList.add( "gsuiLFO" );
			this.append( ...this._children );
			this._children = null;
		}
		GSUI.observeSizeOf( this, this._onresize );
	}
	disconnectedCallback() {
		GSUI.unobserveSizeOf( this, this._onresize );
	}
	static get observedAttributes() {
		return [ "toggle", "type", "delay", "speed", "attack", "amp" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "toggle": this._changeToggle( val === "true" ); break;
				case "type": this._changeType( val ); break;
				case "delay":
				case "speed":
				case "attack":
					this._changeProp( prop, num );
					break;
				case "amp":
					if ( num > 0 !== prev > 0 ) {
						this._changeAmpSign( num );
					}
					this._changeProp( "amp", Math.abs( num ) );
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
		const w = this._wave,
			bPM = this._beatlines.getAttribute( "timesignature" ).split( "," )[ 0 ];

		w.type = this.getAttribute( "type" );
		w.delay = prop === "delay" ? val : +this.getAttribute( "delay" );
		w.attack = prop === "attack" ? val : +this.getAttribute( "attack" );
		w.frequency = prop === "speed" ? val : +this.getAttribute( "speed" );
		w.amplitude = prop === "amp" ? val : +this.getAttribute( "amp" );
		w.duration =
		this._dur = Math.max( w.delay + w.attack + 2, bPM );
		w.draw();
		w.style.opacity = Math.min( 6 / w.frequency, 1 );
		this._updatePxPerBeat();
	}

	// .........................................................................
	_changeToggle( b ) {
		this.classList.toggle( "gsuiLFO-enable", b );
		this.querySelectorAll( ".gsuiLFO-typeRadio" )
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
		this.querySelector( `.gsuiLFO-typeRadio[value="${ type }"]` ).checked = true;
	}
	_changeAmpSign( amp ) {
		this.querySelector( `.gsuiLFO-ampSignRadio[value="${ Math.sign( amp ) || 1 }"]` ).checked = true;
	}
	_changeProp( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	_updatePxPerBeat() {
		this._beatlines.setAttribute( "pxPerBeat", this._waveWidth / this._dur );
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
		this._wave.resized();
	}
	_onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiLFO-toggle": this._dispatch( "toggle" ); break;
			case "gsuiLFO-type": this._dispatch( "change", "type", e.target.value ); break;
			case "gsuiLFO-ampSign": this._dispatch( "change", "amp", -this.getAttribute( "amp" ) ); break;
		}
	}
	_oninputSlider( prop, val ) {
		const realval = prop !== "amp"
				? val
				: val * Math.sign( this.getAttribute( "amp" ) );

		this._sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave( prop, realval );
		this._dispatch( "liveChange", prop, realval );
	}
	_onchangeSlider( prop, val ) {
		switch ( prop ) {
			case "amp": this._dispatch( "change", prop, val * Math.sign( this.getAttribute( "amp" ) ) ); break;
			default: this._dispatch( "change", prop, val ); break;
		}
	}
}

customElements.define( "gsui-lfo", gsuiLFO );

Object.freeze( gsuiLFO );
