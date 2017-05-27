"use strict"

function gsuiKeys() {
	var root = document.createElement( "div" );

	this._init();
	this.rootElement = root;
	root.className = "gsuiKeys";
	this._nbOct = 0;
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
		}
	},
	_cloneOctave() {
		this.rootElement.appendChild( document.importNode( gsuiKeys.octaveTemplate.content, true ) );
	}
};
