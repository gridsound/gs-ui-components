"use strict";

class gsuiKeys extends gsui0ne {
	static $keyNotations = {
		OneTwo:  [ "1",  "1#",  "2",  "2#",  "3",  "4",  "4#",  "5",   "5#",   "6",  "6#",  "7" ],
		DoRéMi:  [ "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ],
		UtRéMi:  [ "ut", "ut#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ],
		CDEFGAB: [ "C",  "C#",  "D",  "D#",  "E",  "F",  "F#",  "G",   "G#",   "A",  "A#",  "B" ],
		CDEFGAH: [ "C",  "C#",  "D",  "D#",  "E",  "F",  "F#",  "G",   "G#",   "A",  "A#",  "H" ],
	};
	static $keyNotation( id ) {
		GSUsetStyle( document.body, "--gsuiKeys-keyNotation", `"${ gsuiKeys.$keyNotations[ id ][ 0 ] }"` );
	}
	static $keyboardToKey = { // 1.
		KeyZ:   [ -1,  0 ], KeyS:      [ -1,  1 ],
		KeyX:   [ -1,  2 ], KeyD:      [ -1,  3 ],
		KeyC:   [ -1,  4 ],
		KeyV:   [ -1,  5 ], KeyG:      [ -1,  6 ],
		KeyB:   [ -1,  7 ], KeyH:      [ -1,  8 ],
		KeyN:   [ -1,  9 ], KeyJ:      [ -1, 10 ],
		KeyM:   [ -1, 11 ],
		Comma:  [  0,  0 ], KeyL:      [  0,  1 ],
		Period: [  0,  2 ], Semicolon: [  0,  3 ],
		Slash:  [  0,  4 ],
		//
		KeyQ:         [  0,  0 ], Digit2: [  0,  1 ],
		KeyW:         [  0,  2 ], Digit3: [  0,  3 ],
		KeyE:         [  0,  4 ],
		KeyR:         [  0,  5 ], Digit5: [  0,  6 ],
		KeyT:         [  0,  7 ], Digit6: [  0,  8 ],
		KeyY:         [  0,  9 ], Digit7: [  0, 10 ],
		KeyU:         [  0, 11 ],
		KeyI:         [  1,  0 ], Digit9: [  1,  1 ],
		KeyO:         [  1,  2 ], Digit0: [  1,  3 ],
		KeyP:         [  1,  4 ],
		BracketLeft:  [  1,  5 ], Equal:  [  1,  6 ],
		BracketRight: [  1,  7 ],
	};
	#rootOctave = 0;
	#keysDown = new Map();
	#gain = 1;
	#nbOct = 0;
	#rootStartPx = 0;
	#octStart = 0;
	#blackKeyR = 0;
	#blackKeyH = 0;
	#keyIndByPtr = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiKeys",
			$tagName: "gsui-keys",
			$attributes: {
				orient: "vertical",
				rootoctave: "4",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "octaves", "rootoctave" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "octaves": this.#setOctaves( ...GSUsplitNums( val ) ); break;
			case "rootoctave": this.#setRootOctave( +val ); break;
		}
	}

	// .........................................................................
	$getRows() {
		return [ ...this.getElementsByClassName( "gsui-row" ) ];
	}
	$getMidiKeyFromKeyboard( e ) {
		const k = gsuiKeys.$keyboardToKey[ e.code ];

		return k
			? ( this.#rootOctave + k[ 0 ] ) * 12 + k[ 1 ]
			: false;
	}
	$midiReleaseAllKeys() {
		this.#keysDown.forEach( ( _, midi ) => this.$midiKeyUp( midi ) );
	}
	$midiKeyDown( midi ) {
		this.#keyUpDown( this.#getKeyElementFromMidi( midi ), true );
	}
	$midiKeyUp( midi ) {
		this.#keyUpDown( this.#getKeyElementFromMidi( midi ), false );
	}

	// .........................................................................
	#getKeyElementFromMidi( midi ) {
		return this.children[ this.children.length - 1 - ( midi - this.#octStart * 12 ) ];
	}
	#setRootOctave( oct ) {
		this.#rootOctave = oct;
		this.querySelector( `.gsuiKey-root` )?.classList.remove( "gsuiKey-root" );
		this.querySelector( `.gsuiKey[data-midi="${ oct * 12 }"]` )?.classList.add( "gsuiKey-root" );
	}
	#setOctaves( start, nbOct ) {
		GSUsetStyle( this, {
			"--gsuiKeys-firstOctave": start,
			"--gsuiKeys-nbOctaves": nbOct,
		} );
		if ( nbOct > this.#nbOct ) {
			for ( let i = this.#nbOct; i < nbOct; ++i ) {
				this.append( ...GSUgetTemplate( "gsui-keys-octave" ) );
			}
		} else if ( nbOct < this.#nbOct ) {
			Array.from( this.children ).forEach( ( el, i ) => {
				if ( i >= nbOct * 12 ) {
					el.remove();
					el._rowElement.remove();
				}
			} );
		}
		this.#nbOct = nbOct;
		this.#octStart = start;
		Array.prototype.reduce.call( this.children, ( midi, elKey, i ) => {
			const elRow = elKey.getElementsByClassName( "gsuiKey-row" )[ 0 ];

			elKey.dataset.midi = midi - 1;
			GSUsetStyle( elKey, "--gsuiKeys-key-id", i );
			if ( elRow ) {
				elKey._rowElement = elRow;
				elRow._keyElement = elKey;
				elRow.dataset.midi = midi - 1;
				elRow.style.top = `${ i }em`;
			}
			return midi - 1;
		}, ( start + nbOct ) * 12 );
		this.#setRootOctave( this.#rootOctave );
	}
	#isVertical() {
		return GSUgetAttribute( this, "orient" ) === "vertical";
	}
	#isBlack( keyInd ) {
		return keyInd === 1 || keyInd === 3 || keyInd === 5 || keyInd === 8 || keyInd === 10;
	}
	#keyUpDown( elKey, status ) {
		if ( elKey ) {
			const midi = +elKey.dataset.midi;

			elKey.classList.toggle( "gsui-active", status );
			if ( status ) {
				this.#keysDown.set( midi );
				GSUdispatchEvent( this, "gsuiKeys", "keyDown", midi, this.#gain );
			} else {
				this.#keysDown.delete( midi );
				GSUdispatchEvent( this, "gsuiKeys", "keyUp", midi, this.#gain );
			}
		}
	}

	// .........................................................................
	$onptrdown( e ) {
		if ( this.#nbOct ) {
			if ( e.button === 2 ) {
				GSUsetAttribute( this, "rootoctave", e.target.dataset.midi / 12 | 0 );
			} else if ( e.button === 0 ) {
				const isVert = this.#isVertical();
				const rootBCR = this.getBoundingClientRect();
				const blackKeyBCR = this.children[ 1 ].getBoundingClientRect();

				this.#rootStartPx = isVert ? rootBCR.top : rootBCR.left;
				this.#blackKeyR = isVert ? blackKeyBCR.right : blackKeyBCR.bottom;
				this.#blackKeyH = isVert ? blackKeyBCR.height : blackKeyBCR.width;
				this.#gain = Math.min( isVert
					? e.offsetX / ( e.target.clientWidth - 1 )
					: e.offsetY / ( e.target.clientHeight - 1 ), 1 );
				this.$onptrmove( e );
				return;
			}
		}
		return false;
	}
	$onptrup( e ) {
		const currKeyInd = this.#keyIndByPtr.get( e.pointerId );

		this.#keyIndByPtr.delete( e.pointerId );
		if ( this.children[ currKeyInd ] ) {
			this.#keyUpDown( this.children[ currKeyInd ], false );
		}
		this.#gain = 1;
	}
	$onptrmove( e ) {
		const currKeyInd = this.#keyIndByPtr.get( e.pointerId );
		const isVert = this.#isVertical();
		const mouseAxeKey = isVert ? e.clientY : e.clientX;
		const mouseAxeVel = isVert ? e.clientX : e.clientY;
		const fKeyInd2 = ( mouseAxeKey - this.#rootStartPx ) / this.#blackKeyH;
		const fKeyInd = isVert ? fKeyInd2 : this.#nbOct * 12 - fKeyInd2;
		let iKeyInd = ~~fKeyInd;

		if ( mouseAxeVel > this.#blackKeyR && this.#isBlack( ~~( iKeyInd % 12 ) ) ) {
			iKeyInd += fKeyInd - iKeyInd < .5 ? -1 : 1;
		}
		if ( currKeyInd !== iKeyInd ) {
			const elKey = this.children[ iKeyInd ];

			if ( elKey ) {
				if ( this.children[ currKeyInd ] ) {
					this.#keyUpDown( this.children[ currKeyInd ], false );
				}
				this.#keyIndByPtr.set( e.pointerId, iKeyInd );
				this.#keyUpDown( elKey, true );
			}
		}
	}
}

Object.freeze( gsuiKeys );
customElements.define( "gsui-keys", gsuiKeys );
