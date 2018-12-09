"use strict";

function gsuiKeys() {
	var root = document.createElement( "div" );

	this._init();
	this.rootElement = root;
	this._nlKeys = root.childNodes;
	this._nbOct = 0;
	root.className = "gsuiKeys";
	root.onmousedown = this._evmdRoot.bind( this );
}

gsuiKeys.keyIds = "c c# d d# e f f# g g# a a# b".split( " " );
gsuiKeys.keyIds.forEach( ( k, i, arr ) => arr[ k ] = i );
gsuiKeys.midiToKeyStr = m => gsuiKeys.keyIds[ m % 12 ] + ~~( m / 12 );
gsuiKeys.keyStrToMidi = k => {
	var key = k.substr( 0, k[ 1 ] !== "#" ? 1 : 2 );

	return k.substr( key.length ) * 12 + gsuiKeys.keyIds[ key ];
};

gsuiKeys.keyboardToKey = {

	//         [ relative octave, key index (C = 0, C# = 1) ]
	// keyboard down
	KeyZ:      [ 0, 0 ],
	KeyS:      [ 0, 1 ],
	KeyX:      [ 0, 2 ],
	KeyD:      [ 0, 3 ],
	KeyC:      [ 0, 4 ],
	KeyV:      [ 0, 5 ],
	KeyG:      [ 0, 6 ],
	KeyB:      [ 0, 7 ],
	KeyH:      [ 0, 8 ],
	KeyN:      [ 0, 9 ],
	KeyJ:      [ 0, 10 ],
	KeyM:      [ 0, 11 ],
	Comma:     [ 1, 0 ],
	KeyL:      [ 1, 1 ],
	Period:    [ 1, 2 ],
	Semicolon: [ 1, 3 ],
	Slash:     [ 1, 4 ],

	// keyboard up
	KeyQ:         [ 1, 0 ],
	Digit2:       [ 1, 1 ],
	KeyW:         [ 1, 2 ],
	Digit3:       [ 1, 3 ],
	KeyE:         [ 1, 4 ],
	KeyR:         [ 1, 5 ],
	Digit5:       [ 1, 6 ],
	KeyT:         [ 1, 7 ],
	Digit6:       [ 1, 8 ],
	KeyY:         [ 1, 9 ],
	Digit7:       [ 1, 10 ],
	KeyU:         [ 1, 11 ],
	KeyI:         [ 2, 0 ],
	Digit9:       [ 2, 1 ],
	KeyO:         [ 2, 2 ],
	Digit0:       [ 2, 3 ],
	KeyP:         [ 2, 4 ],
	BracketLeft:  [ 2, 5 ],
	Equal:        [ 2, 6 ],
	BracketRight: [ 2, 7 ],
};

gsuiKeys.template = document.querySelector( "#gsuiKeys-octave-template" );
gsuiKeys.template.remove();
gsuiKeys.template.removeAttribute( "id" );

gsuiKeys.prototype = {
	remove() {
		this.empty();
		this.rootElement.remove();
	},
	empty() {
		Array.from( this._nlKeys ).forEach( el => {
			el.remove();
			el._rowElement.remove();
		} );
	},
	octaves( start, nbOct ) {
		var elRow,
			root = this.rootElement,
			maxOct = start + nbOct,
			midi = maxOct * 12;

		this.empty();
		this._octStart = start;
		this._nbOct = nbOct;
		root.style.counterReset = "octave " + maxOct;
		while ( nbOct-- > 0 ) {
			root.append.apply( root,
				gsuiKeys.template.cloneNode( true ).children );
		}
		Array.from( root.children ).forEach( elKey => {
			elKey._rowElement = elRow = elKey.firstElementChild;
			elRow._keyElement = elKey;
			elKey.dataset.midi =
			elRow.dataset.midi = --midi;
		} );
	},
	getKeyElementFromMidi( midi ) {
		return this._nlKeys[ this._nlKeys.length - 1 - ( midi - this._octStart * 12 ) ];
	},
	getMidiKeyFromKeyboard( e ) {
		var k = gsuiKeys.keyboardToKey[ e.code ];

		if ( k ) {
			return ( 4 + k[ 0 ] ) * 12 + k[ 1 ];
		}
	},
	midiKeyDown( midi ) {
		var el = this.getKeyElementFromMidi( midi );

		el && el.classList.add( "gsui-active" );
	},
	midiKeyUp( midi ) {
		var el = this.getKeyElementFromMidi( midi );

		el && el.classList.remove( "gsui-active" );
	},

	// private:
	_init() {
		if ( !gsuiKeys._ready ) {
			gsuiKeys._ready = true;
			document.addEventListener( "mousemove", e => gsuiKeys._focused && gsuiKeys._focused._evmmRoot( e ) );
			document.addEventListener( "mouseup", e => gsuiKeys._focused && gsuiKeys._focused._evmuRoot( e ) );
		}
	},
	_isBlack( keyInd ) {
		return keyInd === 1 || keyInd === 3 || keyInd === 5 || keyInd === 8 || keyInd === 10;
	},
	_releaseKeyMouse() {
		if ( this._elKeyMouse ) {
			this._elKeyMouse.classList.remove( "gsui-active" );
			this.onkeyup && this.onkeyup( this._midiKeyMouse, this._gain );
		}
	},

	// events:
	_evmdRoot( e ) {
		if ( this._nbOct ) {
			var blackKeyBCR = this.rootElement.childNodes[ 1 ].getBoundingClientRect();

			this._rootTop = this.rootElement.getBoundingClientRect().top;
			this._blackKeyR = blackKeyBCR.right;
			this._blackKeyH = blackKeyBCR.height;
			this._gain = Math.min( e.layerX / ( e.target.clientWidth - 1 ), 1 );
			gsuiKeys._focused = this;
			this._evmmRoot( e );
		}
	},
	_evmuRoot( e ) {
		this._releaseKeyMouse();
		delete this._elKeyMouse;
		delete this._keyIndMouse;
		delete gsuiKeys._focused;
	},
	_evmmRoot( e ) {
		var elKey,
			fKeyInd = ( e.clientY - this._rootTop ) / this._blackKeyH,
			iKeyInd = ~~fKeyInd;

		if ( e.clientX > this._blackKeyR && this._isBlack( ~~( iKeyInd % 12 ) ) ) {
			iKeyInd += fKeyInd - iKeyInd < .5 ? -1 : 1;
		}
		if ( this._keyIndMouse !== iKeyInd ) {
			elKey = this._nlKeys[ iKeyInd ];
			if ( elKey ) {
				this._releaseKeyMouse();
				this._keyIndMouse = iKeyInd;
				this._elKeyMouse = elKey;
				this._midiKeyMouse = +elKey.dataset.midi;
				elKey.classList.add( "gsui-active" );
				this.onkeydown && this.onkeydown( this._midiKeyMouse, this._gain );
			}
		}
	}
};
