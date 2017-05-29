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

gsuiKeys.prototype = {
	octaves( start, nbOct ) {
		var nbDiff = nbOct - this._nbOct;

		if ( nbDiff || this._octStart !== start ) {
			this._octStart = start;
			this.rootElement.style.counterReset = "octave " + ( start + nbOct );
		}
		if ( nbDiff ) {
			this._nbOct = nbOct;
			if ( nbDiff > 0 ) {
				while ( nbDiff-- > 0 ) {
					this._cloneOctave();
				}
			} else {
				for ( nbDiff *= 12; nbDiff < 0; ++nbDiff ) {
					this.rootElement.removeChild( this.rootElement.firstChild );
				}
			}
		}
	},

	// private:
	_init() {
		if ( !gsuiKeys.octaveTemplate ) {
			gsuiKeys.octaveTemplate = document.getElementById( "gsuiKeys-octave" );
			document.body.addEventListener( "mousemove", function( e ) {
				gsuiKeys._focused && gsuiKeys._focused._evmmRoot( e );
			} );
			document.body.addEventListener( "mouseup", function( e ) {
				gsuiKeys._focused && gsuiKeys._focused._evmuRoot( e );
			} );
		}
	},
	_cloneOctave() {
		this.rootElement.appendChild( document.importNode( gsuiKeys.octaveTemplate.content, true ) );
	},
	_isBlack( keyInd ) {
		return keyInd === 1 || keyInd === 3 || keyInd === 5 || keyInd === 8 || keyInd === 10;
	},
	_keydown( keyInd ) {
		var elKey = this._nlKeys[ keyInd ];

		if ( elKey ) {
			this._keyup();
			this._keyInd = keyInd;
			this._elKey = elKey;
			this._octNum = this._octStart + this._nbOct - 1 - ~~( keyInd / 12 );
			elKey.classList.add( "gsui-active" );
			this.onkeydown && this.onkeydown( elKey.dataset.key, this._octNum, this._gain );
		}
	},
	_keyup() {
		if ( this._elKey ) {
			this._elKey.classList.remove( "gsui-active" );
			this.onkeyup && this.onkeyup( this._elKey.dataset.key, this._octNum, this._gain );
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
		this._keyup();
		delete this._elKey;
		delete this._keyInd;
		delete gsuiKeys._focused;
	},
	_evmmRoot( e ) {
		var fKeyInd = ( e.clientY - this._rootTop ) / this._blackKeyH,
			iKeyInd = ~~fKeyInd;

		if ( e.clientX > this._blackKeyR && this._isBlack( ~~( iKeyInd % 12 ) ) ) {
			iKeyInd += fKeyInd - iKeyInd < .5 ? -1 : 1;
		}
		if ( this._keyInd !== iKeyInd ) {
			this._keydown( iKeyInd );
		}
	}
};
