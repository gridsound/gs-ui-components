"use strict";

class gsuiClock extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-clock" ),
			elModes = children[ 1 ];

		super();
		this._children = children;
		this.onchangeDisplay = () => {};
		this._attached = false;
		this._wrapRel = children[ 0 ];
		this._wrapAbs = children[ 0 ].firstChild;
		this._timeSave = 0;
		this._firstValueLen = -1;
		this._values = [ -1, -1, -1 ];
		this._nodes = [
			this._wrapAbs.children[ 0 ],
			this._wrapAbs.children[ 1 ],
			this._wrapAbs.children[ 2 ],
		];
		Object.seal( this );

		elModes.onclick = this._onclickModes.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this._attached = true;
		if ( this._children ) {
			this.classList.add( "gsuiClock" );
			this.append( ...this._children );
			this._children = null;
			GSUI.recallAttributes( this, {
				mode: "second",
				bpm: 60,
				stepsPerBeat: 4,
			} );
		}
		this._updateWidth();
	}
	disconnectedCallback() {
		this._attached = false;
	}
	static get observedAttributes() {
		return [ "mode", "bpm", "stepsPerBeat" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this._children && prev !== val ) {
			switch ( prop ) {
				case "mode":
				case "bpm":
				case "stepsPerBeat":
					this._resetTime();
					break;
			}
		}
	}

	// .........................................................................
	static parseBeatsToSeconds( beats, bpm ) {
		const seconds = beats / ( bpm / 60 );

		return [
			`${ seconds / 60 | 0 }`,
			`${ seconds % 60 | 0 }`.padStart( 2, "0" ),
			`${ seconds * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}
	static parseBeatsToBeats( beats, stepsPerBeat ) {
		const steps = beats % 1 * stepsPerBeat;

		return [
			`${ beats + 1 | 0 }`,
			`${ steps + 1 | 0 }`.padStart( 2, "0" ),
			`${ steps * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}

	// .........................................................................
	setTime( beats ) {
		const [ a, b, c ] = this.getAttribute( "mode" ) === "second"
				? gsuiClock.parseBeatsToSeconds( beats, +this.getAttribute( "bpm" ) )
				: gsuiClock.parseBeatsToBeats( beats, +this.getAttribute( "stepsPerBeat" ) );

		this._timeSave = beats;
		this._setValue( 0, a );
		this._setValue( 1, b );
		this._setValue( 2, c );
		if ( this._attached && a.length !== this._firstValueLen ) {
			this._firstValueLen = a.length;
			this._updateWidth();
		}
	}

	// .........................................................................
	_resetTime() {
		this.setTime( this._timeSave );
	}
	_setValue( ind, val ) {
		if ( val !== this._values[ ind ] ) {
			this._nodes[ ind ].textContent =
			this._values[ ind ] = val;
		}
	}
	_updateWidth() {
		const len = this._nodes[ 0 ].textContent.length;

		this._wrapRel.style.width =
		this._wrapRel.style.minWidth = `${ 4.5 + len * .7 }ch`;
	}

	// .........................................................................
	_onclickModes() {
		const dpl = this.getAttribute( "mode" ) === "second" ? "beat" : "second";

		GSUI.setAttribute( this, "mode", dpl );
		this.onchangeDisplay( dpl );
	}
}

customElements.define( "gsui-clock", gsuiClock );
