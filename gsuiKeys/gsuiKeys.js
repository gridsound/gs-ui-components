"use strict";

class gsuiKeys {
	constructor() {
		const root = document.createElement( "div" );

		this.rootElement = root;
		this._nlKeys = root.childNodes;
		this._keysDown = new Map();
		this._gain = 1;
		this._nbOct =
		this._rootTop =
		this._octStart =
		this._blackKeyR =
		this._blackKeyH =
		this._keyIndMouse = 0;
		this.onkeyup =
		this.onkeydown =
		this._elKeyMouse = null;
		this._evmuRoot = this._evmuRoot.bind( this );
		this._evmmRoot = this._evmmRoot.bind( this );
		Object.seal( this );

		root.className = "gsuiKeys";
		root.onmousedown = this._evmdRoot.bind( this );
	}

	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		Array.from( this._nlKeys ).forEach( el => {
			el.remove();
			el._rowElement.remove();
		} );
	}
	octaves( start, nbOct ) {
		const root = this.rootElement,
			maxOct = start + nbOct;

		this.empty();
		this._nbOct = nbOct;
		this._octStart = start;
		root.style.counterReset = `octave ${ maxOct }`;
		for ( let i = 0; i < nbOct; ++i ) {
			root.append.apply( root, gsuiKeys.template.cloneNode( true ).children );
		}
		Array.from( root.children ).reduce( ( midi, elKey, i ) => {
			const elRow = elKey.firstElementChild;

			elKey._rowElement = elRow;
			elRow._keyElement = elKey;
			elKey.dataset.midi =
			elRow.dataset.midi = midi - 1;
			elKey.style.top =
			elRow.style.top = `${ i }em`;
			return midi - 1;
		}, maxOct * 12 );
	}
	getKeyElementFromMidi( midi ) {
		return this._nlKeys[ this._nlKeys.length - 1 - ( midi - this._octStart * 12 ) ];
	}
	getMidiKeyFromKeyboard( e ) {
		const k = gsuiKeys.keyboardToKey[ e.code ];

		return k
			? ( 4 + k[ 0 ] ) * 12 + k[ 1 ]
			: false;
	}
	midiReleaseAllKeys() {
		this._keysDown.forEach( ( _, midi ) => this.midiKeyUp( midi ) );
		this._evmuRoot();
	}
	midiKeyDown( midi ) {
		this._keyUpDown( this.getKeyElementFromMidi( midi ), true );
	}
	midiKeyUp( midi ) {
		this._keyUpDown( this.getKeyElementFromMidi( midi ), false );
	}

	// private:
	_isBlack( keyInd ) {
		return keyInd === 1 || keyInd === 3 || keyInd === 5 || keyInd === 8 || keyInd === 10;
	}
	_keyUpDown( elKey, status ) {
		const midi = +elKey.dataset.midi;

		elKey.classList.toggle( "gsui-active", status );
		if ( status ) {
			this._keysDown.set( midi )
			this.onkeydown && this.onkeydown( midi, this._gain );
		} else {
			this._keysDown.delete( midi );
			this.onkeyup && this.onkeyup( midi, this._gain );
		}
	}

	// events:
	_evmdRoot( e ) {
		if ( this._nbOct ) {
			const blackKeyBCR = this.rootElement.childNodes[ 1 ].getBoundingClientRect();

			this._rootTop = this.rootElement.getBoundingClientRect().top;
			this._blackKeyR = blackKeyBCR.right;
			this._blackKeyH = blackKeyBCR.height;
			this._gain = Math.min( e.layerX / ( e.target.clientWidth - 1 ), 1 );
			document.addEventListener( "mouseup", this._evmuRoot );
			document.addEventListener( "mousemove", this._evmmRoot );
			this._evmmRoot( e );
		}
	}
	_evmuRoot() {
		document.removeEventListener( "mouseup", this._evmuRoot );
		document.removeEventListener( "mousemove", this._evmmRoot );
		if ( this._elKeyMouse ) {
			this._keyUpDown( this._elKeyMouse, false );
			this._elKeyMouse =
			this._keyIndMouse = null;
		}
		this._gain = 1;
	}
	_evmmRoot( e ) {
		const fKeyInd = ( e.clientY - this._rootTop ) / this._blackKeyH;
		let iKeyInd = ~~fKeyInd;

		if ( e.clientX > this._blackKeyR && this._isBlack( ~~( iKeyInd % 12 ) ) ) {
			iKeyInd += fKeyInd - iKeyInd < .5 ? -1 : 1;
		}
		if ( this._keyIndMouse !== iKeyInd ) {
			const elKey = this._nlKeys[ iKeyInd ];

			if ( elKey ) {
				if ( this._elKeyMouse ) {
					this._keyUpDown( this._elKeyMouse, false );
				}
				this._elKeyMouse = elKey;
				this._keyIndMouse = iKeyInd;
				this._keyUpDown( elKey, true );
			}
		}
	}
}

gsuiKeys.template = document.querySelector( "#gsuiKeys-octave-template" );
gsuiKeys.template.remove();
gsuiKeys.template.removeAttribute( "id" );

gsuiKeys.midiToKeyStr = m => gsuiKeys.keyIds[ m % 12 ] + ~~( m / 12 );
gsuiKeys.keyStrToMidi = k => {
	const key = k.substr( 0, k[ 1 ] !== "#" ? 1 : 2 );

	return k.substr( key.length ) * 12 + gsuiKeys.keyIds[ key ];
};
