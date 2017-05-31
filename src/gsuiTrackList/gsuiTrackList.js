"use strict";

function gsuiTrackList() {
	var root = this._clone();

	this.rootElement = root;
	this.rowElements = [];
	this.tracksNodeList = root.childNodes;
}

gsuiTrackList.prototype = {
	change( objs ) {
		var id, trk, obj;

		for ( id in objs ) {
			obj = objs[ id ];
			trk = this.tracksNodeList[ id ].gsuiTrackObject;
			obj.toggle != null && trk.toggle( obj.toggle );
			obj.name != null && trk.setName( obj.name );
		}
	},
	nbTracks( nb ) {
		nb = Math.min( Math.max( 0, nb ), 99 ) - this.tracksNodeList.length;
		this.newRowElements = [];
		if ( nb < 0 ) {
			for ( ; nb < 0; ++nb ) {
				this.rootElement.lastChild.remove();
				this.rowElements[ this.rowElements.length - 1 ].remove();
				this.rowElements.pop();
			}
		} else {
			for ( ; nb > 0; --nb ) {
				this._addTrack();
			}
			Array.prototype.push.apply( this.rowElements, this.newRowElements );
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
		trk.ontogglechange = this._change.bind( this, trk, "toggle" );
		trk.onnamechange = this._change.bind( this, trk, "name" );
		trk.id = this.tracksNodeList.length;
		trk.setPlaceholder( "Track " + ( trk.id + 1 ) );
		this.newRowElements.push( trk.rowElement );
		this.rootElement.append( trk.rootElement );
	},
	_change( trk, attr, val ) {
		if ( this.onchange ) {
			this.onchange( {
				[ trk.id ]: {
					[ attr ]: val
				}
			} );
		}
	},
	_muteAll( trk ) {
		var obj = {},
			trkRoot = trk.rootElement,
			trkRoots = Array.from( this.tracksNodeList ),
			allMute = trkRoots.every( function( _trkRoot ) {
					return !_trkRoot.gsuiTrackObject.uiToggle.checked || _trkRoot === trkRoot;
				} );

		trkRoots.forEach( function( _trkRoot ) {
			var _trk = _trkRoot.gsuiTrackObject,
				tog = allMute || _trkRoot === trkRoot;

			if ( tog !== _trk.uiToggle.checked ) {
				_trk.toggle( tog );
				obj[ _trk.id ] = { toggle: tog };
			}
		} );
		if ( this.onchange ) {
			this.onchange( obj );
		}
	}
};
