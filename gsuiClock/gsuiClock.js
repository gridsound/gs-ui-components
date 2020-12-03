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
		this._bPM = 4;
		this._sPB = 4;
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
				timedivision: "4/4",
			} );
		}
		this._updateWidth();
	}
	disconnectedCallback() {
		this._attached = false;
	}
	static get observedAttributes() {
		return [ "mode", "bpm", "timedivision" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this._children && prev !== val ) {
			switch ( prop ) {
				case "mode":
				case "bpm":
					this.resetTime();
					break;
				case "timedivision": {
					const timediv = val.split( "/" );

					this._bPM = +timediv[ 0 ];
					this._sPB = +timediv[ 1 ];
					this.resetTime();
				} break;
			}
		}
	}

	// .........................................................................
	static numbering( from ) {
		gsuiClock._numbering = +from;
		document.querySelectorAll( "gsui-clock" ).forEach( el => el.resetTime() );
	}
	static parseBeatsToSeconds( beats, bpm ) {
		const seconds = beats / ( bpm / 60 );

		return [
			`${ seconds / 60 | 0 }`,
			`${ seconds % 60 | 0 }`.padStart( 2, "0" ),
			`${ seconds * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}
	static parseBeatsToBeats( beats, bPM, sPB ) {
		const measures = Math.floor( beats / bPM ),
			steps = Math.floor( ( beats - measures * bPM ) * sPB ),
			msteps = beats * sPB - Math.floor( beats * sPB );

		return [
			`${ measures + gsuiClock._numbering }`,
			`${ steps + gsuiClock._numbering }`.padStart( 2, "0" ),
			`${ msteps * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}

	// .........................................................................
	setTime( beats ) {
		const [ a, b, c ] = this.getAttribute( "mode" ) === "second"
				? gsuiClock.parseBeatsToSeconds( beats, +this.getAttribute( "bpm" ) || 60 )
				: gsuiClock.parseBeatsToBeats( beats, this._bPM, this._sPB );

		this._timeSave = beats;
		this._setValue( 0, a );
		this._setValue( 1, b );
		this._setValue( 2, c );
		if ( this._attached && a.length !== this._firstValueLen ) {
			this._firstValueLen = a.length;
			this._updateWidth();
		}
	}
	resetTime() {
		this.setTime( this._timeSave );
	}

	// .........................................................................
	_setValue( ind, val ) {
		if ( val !== this._values[ ind ] ) {
			this._nodes[ ind ].textContent =
			this._values[ ind ] = val;
		}
	}
	_updateWidth() {
		const len = this._nodes[ 0 ].textContent.length;

		this._wrapRel.style.width =
		this._wrapRel.style.minWidth = `${ 4.2 + len * .7 }ch`;
	}

	// .........................................................................
	_onclickModes() {
		const dpl = this.getAttribute( "mode" ) === "second" ? "beat" : "second";

		GSUI.setAttribute( this, "mode", dpl );
		this.onchangeDisplay( dpl );
	}
}

gsuiClock._numbering = 1;

customElements.define( "gsui-clock", gsuiClock );
