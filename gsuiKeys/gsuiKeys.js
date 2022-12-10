"use strict";

class gsuiKeys extends HTMLElement {
	static keyNames = Object.freeze( {
		en: Object.freeze( [ "c",  "c#",  "d",  "d#",  "e",  "f",  "f#",  "g",   "g#",   "a",  "a#",  "b" ] ),
		fr: Object.freeze( [ "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ] ),
	} );
	static keyboardToKey = { // 1.
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
	#keyIndMouse = 0;
	#elKeyMouse = null;
	#onmouseupBind = this.#onmouseup.bind( this );
	#onmousemoveBind = this.#onmousemove.bind( this );

	constructor() {
		super();
		Object.seal( this );

		this.onmousedown = this.#onmousedown.bind( this );
		this.oncontextmenu = () => false;
	}

	// .........................................................................
	connectedCallback() {
		GSUI.$recallAttributes( this, {
			orient: "vertical",
			rootoctave: "4",
		} );
	}
	static get observedAttributes() {
		return [ "orient", "rootoctave" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "rootoctave":
					this.#setRootOctave( +val );
					break;
			}
		}
	}

	// .........................................................................
	octaves( start, nbOct ) {
		const maxOct = start + nbOct;

		Array.prototype.forEach.call( this.children, el => {
			el.remove();
			el._rowElement.remove();
		} );
		this.#nbOct = nbOct;
		this.#octStart = start;
		this.style.setProperty( "--gsuiKeys-firstOctave", start );
		this.style.setProperty( "--gsuiKeys-nbOctaves", nbOct );
		for ( let i = 0; i < nbOct; ++i ) {
			this.append( ...GSUI.$getTemplate( "gsui-keys-octave" ) );
		}
		Array.prototype.reduce.call( this.children, ( midi, elKey, i ) => {
			const elRow = elKey.firstElementChild;

			elKey._rowElement = elRow;
			elRow._keyElement = elKey;
			elKey.dataset.midi =
			elRow.dataset.midi = midi - 1;
			elKey.style.setProperty( "--gsuiKeys-key-id", i );
			elRow.style.top = `${ i }em`;
			return midi - 1;
		}, maxOct * 12 );
		this.#setRootOctave( this.#rootOctave );
		return this.querySelectorAll( ".gsui-row" );
	}
	getMidiKeyFromKeyboard( e ) {
		const k = gsuiKeys.keyboardToKey[ e.code ];

		return k
			? ( this.#rootOctave + k[ 0 ] ) * 12 + k[ 1 ]
			: false;
	}
	midiReleaseAllKeys() {
		this.#keysDown.forEach( ( _, midi ) => this.midiKeyUp( midi ) );
		this.#onmouseup();
	}
	midiKeyDown( midi ) {
		this.#keyUpDown( this.#getKeyElementFromMidi( midi ), true );
	}
	midiKeyUp( midi ) {
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
	#isVertical() {
		return GSUI.$getAttribute( this, "orient" ) === "vertical";
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
				GSUI.$dispatchEvent( this, "gsuiKeys", "keyDown", midi, this.#gain );
			} else {
				this.#keysDown.delete( midi );
				GSUI.$dispatchEvent( this, "gsuiKeys", "keyUp", midi, this.#gain );
			}
		}
	}

	// .........................................................................
	#onmousedown( e ) {
		if ( this.#nbOct ) {
			if ( e.button === 2 ) {
				GSUI.$setAttribute( this, "rootoctave", e.target.dataset.midi / 12 | 0 );
			} else if ( e.button === 0 ) {
				const isVert = this.#isVertical();
				const rootBCR = this.getBoundingClientRect();
				const blackKeyBCR = this.children[ 1 ].getBoundingClientRect();

				this.#rootStartPx = isVert ? rootBCR.top : rootBCR.left;
				this.#blackKeyR = isVert ? blackKeyBCR.right : blackKeyBCR.bottom;
				this.#blackKeyH = isVert ? blackKeyBCR.height : blackKeyBCR.width;
				this.#gain = Math.min( e.layerX / ( e.target.clientWidth - 1 ), 1 );
				document.addEventListener( "mouseup", this.#onmouseupBind );
				document.addEventListener( "mousemove", this.#onmousemoveBind );
				this.#onmousemove( e );
			}
		}
	}
	#onmouseup() {
		document.removeEventListener( "mouseup", this.#onmouseupBind );
		document.removeEventListener( "mousemove", this.#onmousemoveBind );
		if ( this.#elKeyMouse ) {
			this.#keyUpDown( this.#elKeyMouse, false );
			this.#elKeyMouse =
			this.#keyIndMouse = null;
		}
		this.#gain = 1;
	}
	#onmousemove( e ) {
		const isVert = this.#isVertical();
		const mouseAxeKey = isVert ? e.clientY : e.clientX;
		const mouseAxeVel = isVert ? e.clientX : e.clientY;
		const fKeyInd2 = ( mouseAxeKey - this.#rootStartPx ) / this.#blackKeyH;
		const fKeyInd = isVert ? fKeyInd2 : this.#nbOct * 12 - fKeyInd2;
		let iKeyInd = ~~fKeyInd;

		if ( mouseAxeVel > this.#blackKeyR && this.#isBlack( ~~( iKeyInd % 12 ) ) ) {
			iKeyInd += fKeyInd - iKeyInd < .5 ? -1 : 1;
		}
		if ( this.#keyIndMouse !== iKeyInd ) {
			const elKey = this.children[ iKeyInd ];

			if ( elKey ) {
				if ( this.#elKeyMouse ) {
					this.#keyUpDown( this.#elKeyMouse, false );
				}
				this.#elKeyMouse = elKey;
				this.#keyIndMouse = iKeyInd;
				this.#keyUpDown( elKey, true );
			}
		}
	}
}

Object.freeze( gsuiKeys );
customElements.define( "gsui-keys", gsuiKeys );

/*
1. The arrays inside keyboardToKey have this format: [ relative octave, key index (C = 0, C# = 1) ].
The arrangement of the code represent the white and black keys.
*/
