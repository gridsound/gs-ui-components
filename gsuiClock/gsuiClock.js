"use strict";

class gsuiClock extends gsui0ne {
	#bPM = 4;
	#sPB = 4;
	#timeSave = 0;
	#firstValueLen = -1;
	#values = [ -1, -1, -1 ];

	constructor() {
		super( {
			$cmpName: "gsuiClock",
			$tagName: "gsui-clock",
			$elements: {
				$wrapRel: ".gsuiClock-relative",
				$modes: ".gsuiClock-modes",
				$nodes: [
					".gsuiClock-a",
					".gsuiClock-b",
					".gsuiClock-c",
				],
			},
			$attributes: {
				mode: "second",
				bpm: 60,
				timedivision: "4/4",
			},
		} );
		Object.seal( this );

		this.$elements.$modes.onclick = this.#onclickModes.bind( this );
	}

	// .........................................................................
	$connected() {
		this.#updateWidth();
	}
	static get observedAttributes() {
		return [ "mode", "bpm", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "mode":
			case "bpm":
				this.#resetTime();
				break;
			case "timedivision": {
				const timediv = val.split( "/" );

				this.#bPM = +timediv[ 0 ];
				this.#sPB = +timediv[ 1 ];
				this.#resetTime();
			} break;
		}
	}

	// .........................................................................
	static #numberingOff = 1;
	static $numbering( from ) {
		gsuiClock.#numberingOff = +from;
		GSUdomQSA( "gsui-clock" ).forEach( el => el.#resetTime() );
	}
	static $parseBeatsToSeconds( beats, bpm ) {
		const seconds = beats / ( bpm / 60 );

		return [
			`${ seconds / 60 | 0 }`,
			`${ seconds % 60 | 0 }`.padStart( 2, "0" ),
			`${ seconds * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}
	static $parseBeatsToBeats( beats, bPM, sPB ) {
		const measures = Math.floor( beats / bPM );
		const steps = Math.floor( ( beats - measures * bPM ) * sPB );
		const msteps = beats * sPB - Math.floor( beats * sPB );

		return [
			`${ measures + gsuiClock.#numberingOff }`,
			`${ steps + gsuiClock.#numberingOff }`.padStart( 2, "0" ),
			`${ msteps * 1000 % 1000 | 0 }`.padStart( 3, "0" ),
		];
	}

	// .........................................................................
	$setTime( beats ) {
		const [ a, b, c ] = GSUdomGetAttr( this, "mode" ) === "second"
			? gsuiClock.$parseBeatsToSeconds( beats, GSUdomGetAttrNum( this, "bpm" ) || 60 )
			: gsuiClock.$parseBeatsToBeats( beats, this.#bPM, this.#sPB );

		this.#timeSave = beats;
		this.#setValue( 0, a );
		this.#setValue( 1, b );
		this.#setValue( 2, c );
		if ( this.$isConnected && a.length !== this.#firstValueLen ) {
			this.#firstValueLen = a.length;
			this.#updateWidth();
		}
	}
	#resetTime() {
		this.$setTime( this.#timeSave );
	}

	// .........................................................................
	#setValue( ind, val ) {
		if ( val !== this.#values[ ind ] ) {
			this.$elements.$nodes[ ind ].textContent =
			this.#values[ ind ] = val;
		}
	}
	#updateWidth() {
		const len = this.$elements.$nodes[ 0 ].textContent.length;

		this.$elements.$wrapRel.style.width =
		this.$elements.$wrapRel.style.minWidth = `${ 4.5 + len * .7 }ch`;
	}

	// .........................................................................
	#onclickModes() {
		const dpl = GSUdomGetAttr( this, "mode" ) === "second" ? "beat" : "second";

		GSUdomSetAttr( this, "mode", dpl );
		GSUdomDispatch( this, GSEV_CLOCK_CHANGEDISPLAY, dpl );
	}
}

GSUdomDefine( "gsui-clock", gsuiClock );
