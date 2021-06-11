"use strict";

class gsuiKeys extends HTMLElement {
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
	connectedCallback() {
		this.classList.add( "gsuiKeys" );
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
			GSUI.dispatchEvent( this, "gsuiKeys", "onkeydown", midi, this.#gain );
		} else {
			this.#keysDown.delete( midi );
			GSUI.dispatchEvent( this, "gsuiKeys", "onkeyup", midi, this.#gain );
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

gsuiKeys.midiToKeyStr = m => gsuiKeys.keyIds[ m % 12 ] + ~~( m / 12 );
gsuiKeys.keyStrToMidi = k => {
	const key = k.substr( 0, k[ 1 ] !== "#" ? 1 : 2 );

	return k.substr( key.length ) * 12 + gsuiKeys.keyIds[ key ];
};

customElements.define( "gsui-keys", gsuiKeys );
