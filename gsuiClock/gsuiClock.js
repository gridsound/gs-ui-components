"use strict";

class gsuiClock extends HTMLElement {
	#bPM = 4;
	#sPB = 4;
	#timeSave = 0;
	#firstValueLen = -1;
	#attached = false;
	#values = [ -1, -1, -1 ];
	#children = GSUI.$getTemplate( "gsui-clock" );
	#elements = GSUI.$findElements( this.#children, {
		wrapRel: ".gsuiClock-relative",
		modes: ".gsuiClock-modes",
		nodes: [
			".gsuiClock-a",
			".gsuiClock-b",
			".gsuiClock-c",
		],
	} );

	constructor() {
		super();
		this.onchangeDisplay = GSUI.$noop;
		Object.seal( this );

		this.#elements.modes.onclick = this.#onclickModes.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this.#attached = true;
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, {
				mode: "second",
				bpm: 60,
				timedivision: "4/4",
			} );
		}
		this.#updateWidth();
	}
	disconnectedCallback() {
		this.#attached = false;
	}
	static get observedAttributes() {
		return [ "mode", "bpm", "timedivision" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "mode":
				case "bpm":
					this.resetTime();
					break;
				case "timedivision": {
					const timediv = val.split( "/" );

					this.#bPM = +timediv[ 0 ];
					this.#sPB = +timediv[ 1 ];
					this.resetTime();
				} break;
			}
		}
	}

	// .........................................................................
	static numberingOff = 1;
	static numbering( from ) {
		gsuiClock.numberingOff = +from;
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
		const measures = Math.floor( beats / bPM );
		const steps = Math.floor( ( beats - measures * bPM ) * sPB );
		const msteps = beats * sPB - Math.floor( beats * sPB );

		return [
			`${ measures + gsuiClock.numberingOff }`,
			`${ steps + gsuiClock.numberingOff }`.padStart( 2, "0" ),
			`${ msteps * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}

	// .........................................................................
	setTime( beats ) {
		const [ a, b, c ] = GSUI.$getAttribute( this, "mode" ) === "second"
			? gsuiClock.parseBeatsToSeconds( beats, GSUI.$getAttributeNum( this, "bpm" ) || 60 )
			: gsuiClock.parseBeatsToBeats( beats, this.#bPM, this.#sPB );

		this.#timeSave = beats;
		this.#setValue( 0, a );
		this.#setValue( 1, b );
		this.#setValue( 2, c );
		if ( this.#attached && a.length !== this.#firstValueLen ) {
			this.#firstValueLen = a.length;
			this.#updateWidth();
		}
	}
	resetTime() {
		this.setTime( this.#timeSave );
	}

	// .........................................................................
	#setValue( ind, val ) {
		if ( val !== this.#values[ ind ] ) {
			this.#elements.nodes[ ind ].textContent =
			this.#values[ ind ] = val;
		}
	}
	#updateWidth() {
		const len = this.#elements.nodes[ 0 ].textContent.length;

		this.#elements.wrapRel.style.width =
		this.#elements.wrapRel.style.minWidth = `${ 4.5 + len * .7 }ch`;
	}

	// .........................................................................
	#onclickModes() {
		const dpl = GSUI.$getAttribute( this, "mode" ) === "second" ? "beat" : "second";

		GSUI.$setAttribute( this, "mode", dpl );
		this.onchangeDisplay( dpl );
	}
}

Object.seal( gsuiClock );
customElements.define( "gsui-clock", gsuiClock );
