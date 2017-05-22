"use strict";

function gsuiTrackList() {
	var root = this._clone();

	this.rootElement = root;
	this.tracksNodeList = root.childNodes;
}

gsuiTrackList.prototype = {
	nbTracks( nb ) {
		nb = Math.min( Math.max( 0, nb ), 99 ) - this.tracksNodeList.length;
		if ( nb < 0 ) {
			for ( ; nb < 0; ++nb ) {
				this.rootElement.lastChild.remove();
			}
		} else {
			for ( ; nb > 0; --nb ) {
				this._addTrack();
			}
		}
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiTrackList.template || this._init();
		div.appendChild( document.importNode( gsuiTrackList.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		gsuiTrackList.template = document.getElementById( "gsuiTrackList" );
	},
	_addTrack() {
		var trk = new gsuiTrack();

		trk.rootElement.gsuiTrackObject = trk;
		trk.uiToggle.onmousedownright = this._muteAll.bind( this, trk );
		this.rootElement.append( trk.rootElement );
		trk.setPlaceholder( "Track " + this.tracksNodeList.length );
	},
	_muteAll( trk ) {
		var trkRoot = trk.rootElement,
			trkRoots = Array.from( this.tracksNodeList ),
			allMute = trkRoots.every( function( _trk ) {
					return _trk.gsuiTrackObject.isMute() || _trk === trkRoot;
				} );

		trkRoots.forEach( function( _trk ) {
			_trk.gsuiTrackObject.mute( !( allMute || _trk === trkRoot ) );
		} );
	}
};
