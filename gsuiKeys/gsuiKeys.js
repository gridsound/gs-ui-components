"use strict";

class gsuiKeys extends HTMLElement {
	static keyNames = Object.freeze( {
		en: Object.freeze( [ "c",  "c#",  "d",  "d#",  "e",  "f",  "f#",  "g",   "g#",   "a",  "a#",  "b" ] ),
		fr: Object.freeze( [ "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ] ),
	} )
	static keyboardToKey = { // 1.
		KeyZ:   [ 0,  0 ], KeyS:      [ 0,  1 ],
		KeyX:   [ 0,  2 ], KeyD:      [ 0,  3 ],
		KeyC:   [ 0,  4 ],
		KeyV:   [ 0,  5 ], KeyG:      [ 0,  6 ],
		KeyB:   [ 0,  7 ], KeyH:      [ 0,  8 ],
		KeyN:   [ 0,  9 ], KeyJ:      [ 0, 10 ],
		KeyM:   [ 0, 11 ],
		Comma:  [ 1,  0 ], KeyL:      [ 1,  1 ],
		Period: [ 1,  2 ], Semicolon: [ 1,  3 ],
		Slash:  [ 1,  4 ],
		//
		KeyQ:         [ 1,  0 ], Digit2: [ 1,  1 ],
		KeyW:         [ 1,  2 ], Digit3: [ 1,  3 ],
		KeyE:         [ 1,  4 ],
		KeyR:         [ 1,  5 ], Digit5: [ 1,  6 ],
		KeyT:         [ 1,  7 ], Digit6: [ 1,  8 ],
		KeyY:         [ 1,  9 ], Digit7: [ 1, 10 ],
		KeyU:         [ 1, 11 ],
		KeyI:         [ 2,  0 ], Digit9: [ 2,  1 ],
		KeyO:         [ 2,  2 ], Digit0: [ 2,  3 ],
		KeyP:         [ 2,  4 ],
		BracketLeft:  [ 2,  5 ], Equal:  [ 2,  6 ],
		BracketRight: [ 2,  7 ],
	}
	#keysDown = new Map()
	#gain = 1
	#nbOct = 0
	#rootTop = 0
	#octStart = 0
	#blackKeyR = 0
	#blackKeyH = 0
	#keyIndMouse = 0
	#elKeyMouse = null
	#onmouseupBind = this.#onmouseup.bind( this )
	#onmousemoveBind = this.#onmousemove.bind( this )

	constructor() {
		super();
		Object.seal( this );

		this.onmousedown = this.#onmousedown.bind( this );
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
		this.style.counterReset = `octave ${ maxOct }`;
		this.style.height = `${ nbOct * 12 }em`;
		for ( let i = 0; i < nbOct; ++i ) {
			this.append( ...GSUI.getTemplate( "gsui-keys-octave" ) );
		}
		Array.prototype.reduce.call( this.children, ( midi, elKey, i ) => {
			const elRow = elKey.firstElementChild;

			elKey._rowElement = elRow;
			elRow._keyElement = elKey;
			elKey.dataset.midi =
			elRow.dataset.midi = midi - 1;
			elKey.style.top =
			elRow.style.top = `${ i }em`;
			return midi - 1;
		}, maxOct * 12 );
		return this.querySelectorAll( ".gsui-row" );
	}
	getKeyElementFromMidi( midi ) {
		return this.children[ this.children.length - 1 - ( midi - this.#octStart * 12 ) ];
	}
	getMidiKeyFromKeyboard( e ) {
		const k = gsuiKeys.keyboardToKey[ e.code ];

		return k
			? ( 4 + k[ 0 ] ) * 12 + k[ 1 ]
			: false;
	}
	midiReleaseAllKeys() {
		this.#keysDown.forEach( ( _, midi ) => this.midiKeyUp( midi ) );
		this.#onmouseup();
	}
	midiKeyDown( midi ) {
		this.#keyUpDown( this.getKeyElementFromMidi( midi ), true );
	}
	midiKeyUp( midi ) {
		this.#keyUpDown( this.getKeyElementFromMidi( midi ), false );
	}

	// .........................................................................
	#isBlack( keyInd ) {
		return keyInd === 1 || keyInd === 3 || keyInd === 5 || keyInd === 8 || keyInd === 10;
	}
	#keyUpDown( elKey, status ) {
		const midi = +elKey.dataset.midi;

		elKey.classList.toggle( "gsui-active", status );
		if ( status ) {
			this.#keysDown.set( midi );
			GSUI.dispatchEvent( this, "gsuiKeys", "keyDown", midi, this.#gain );
		} else {
			this.#keysDown.delete( midi );
			GSUI.dispatchEvent( this, "gsuiKeys", "keyUp", midi, this.#gain );
		}
	}

	// .........................................................................
	#onmousedown( e ) {
		if ( this.#nbOct ) {
			const blackKeyBCR = this.children[ 1 ].getBoundingClientRect();

			this.#rootTop = this.getBoundingClientRect().top;
			this.#blackKeyR = blackKeyBCR.right;
			this.#blackKeyH = blackKeyBCR.height;
			this.#gain = Math.min( e.layerX / ( e.target.clientWidth - 1 ), 1 );
			document.addEventListener( "mouseup", this.#onmouseupBind );
			document.addEventListener( "mousemove", this.#onmousemoveBind );
			this.#onmousemove( e );
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
		const fKeyInd = ( e.clientY - this.#rootTop ) / this.#blackKeyH;
		let iKeyInd = ~~fKeyInd;

		if ( e.clientX > this.#blackKeyR && this.#isBlack( ~~( iKeyInd % 12 ) ) ) {
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
