"use strict";

class gsuiOscillator extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-oscillator" ),
			waves = [
				children[ 1 ].firstChild,
				children[ 1 ].lastChild,
			];

		super();
		this._children = children;
		this._waves = waves;
		this._elSelect = children[ 4 ];
		this._timeidType = null;
		this._sliders = Object.freeze( {
			detune: this._initSlider( 5, "detune" ),
			pan: this._initSlider( 6, "pan" ),
			gain: this._initSlider( 7, "gain" ),
		} );
		this._selectWaves = {
			sine: true,
			triangle: true,
			sawtooth: true,
			square: true,
		};
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiOscillator" );
		Object.seal( this );

		waves[ 0 ].frequency =
		waves[ 1 ].frequency = 1;
		this._elSelect.onchange = this._onchangeSelect.bind( this );
		this._elSelect.onkeydown = this._onkeydownSelect.bind( this );
		children[ 2 ].onclick = this._onclickPrevNext.bind( this, -1 );
		children[ 3 ].onclick = this._onclickPrevNext.bind( this, 1 );
		children[ 8 ].onclick = () => this._dispatch( "remove" );
	}

	// .........................................................................
	connectedCallback() {
		if ( this._children ) {
			this.classList.add( "gsuiOscillator" );
			this.setAttribute( "draggable", "true" );
			this.append( ...this._children );
			this._children = null;
		}
	}
	static get observedAttributes() {
		return [ "order", "type", "detune", "gain", "pan" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "order": this._changeOrder( num ); break;
				case "type": this._changeType( val ); break;
				case "detune":
				case "gain":
				case "pan":
					this._changeProp( prop, num );
					break;
			}
		}
	}

	// .........................................................................
	addWaves( arr ) {
		const opts = [];

		arr.sort();
		arr.forEach( w => {
			if ( !this._selectWaves[ w ] ) {
				const opt = document.createElement( "option" );

				this._selectWaves[ w ] = true;
				opt.value = w;
				opt.className = "gsuiOscillator-waveOpt";
				opt.textContent = w;
				opts.push( opt );
			}
		} );
		Element.prototype.append.apply( this._elSelect, opts );
	}
	updateWave( prop, val ) {
		const [ w0, w1 ] = this._waves,
			gain = prop === "gain" ? val : +this.getAttribute( "gain" ),
			pan = prop === "pan" ? val : +this.getAttribute( "pan" );

		w0.type =
		w1.type = prop === "type" ? val : this.getAttribute( "type" );
		w0.amplitude = Math.min( gain * ( pan < 0 ? 1 : 1 - pan ), .95 );
		w1.amplitude = Math.min( gain * ( pan > 0 ? 1 : 1 + pan ), .95 );
		w0.draw();
		w1.draw();
	}

	// .........................................................................
	_changeOrder( n ) {
		this.dataset.order = n;
	}
	_changeType( type ) {
		this._elSelect.value = type;
	}
	_changeProp( prop, val ) {
		const [ sli, span ] = this._sliders[ prop ];

		sli.setValue( val );
		span.textContent = prop === "detune" ? val : val.toFixed( 2 );
	}

	// .........................................................................
	_initSlider( childNum, prop ) {
		const root = this._children[ childNum ],
			slider = root.firstChild.firstChild,
			elValue = root.lastChild;

		slider.oninput = this._oninputSlider.bind( this, prop );
		slider.onchange = val => this._dispatch( "change", prop, val );
		return Object.freeze( [ slider, elValue ] );
	}

	// events:
	// .........................................................................
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

		clearTimeout( this._timeidType );
		this.updateWave( "type", type );
		this._dispatch( "liveChange", "type", type );
		this._timeidType = setTimeout( () => {
			if ( type !== this.getAttribute( "type" ) ) {
				this._dispatch( "change", "type", type );
			}
		}, 700 );
	}
	_onkeydownSelect( e ) {
		if ( e.key.length === 1 ) {
			e.preventDefault();
		}
	}
	_oninputSlider( prop, val ) {
		let val2 = val;

		if ( prop === "gain" ) {
			this.updateWave( "gain", val );
			val2 = val.toFixed( 2 );
		} else if ( prop === "pan" ) {
			this.updateWave( "pan", val );
			val2 = val.toFixed( 2 );
		}
		this._sliders[ prop ][ 1 ].textContent = val2;
		this._dispatch( "liveChange", prop, +val2 );
	}
}

customElements.define( "gsui-oscillator", gsuiOscillator );

Object.freeze( gsuiOscillator );
