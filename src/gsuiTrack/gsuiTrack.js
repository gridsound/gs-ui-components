"use strict";

function gsuiTrack() {
	var root = this._clone();

	this.rootElement = root;
	this.gridTrackElement = root.querySelector( ".gsuiTrack-body" );
	this.gridTrackElement.remove();
	this.uiToggle = new gsuiToggle();
	this.uiSpan = new gsuiSpanEditable();
	root.append( this.uiToggle.rootElement );
	root.append( this.uiSpan.rootElement );

	this.uiToggle.onchange = this._evocToggle.bind( this );
	this.mute( false );
}

gsuiTrack.prototype = {
	mute( b ) {
		this.uiToggle.toggle( !b );
		this._evocToggle( !b );
	},
	isMute() {
		return !this.uiToggle.checked;
	},
	setPlaceholder( p ) {
		this.uiSpan.setPlaceholder( p );
	},
	setName( n ) {
		this.uiSpan.setValue( n );
	},
	getName() {
		return this.uiSpan.value;
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiTrack.template = gsuiTrack.template || document.getElementById( "gsuiTrack" );
		div.appendChild( document.importNode( gsuiTrack.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},

	// events:
	_evocToggle( b ) {
		this.rootElement.classList.toggle( "gsui-mute", !b );
		this.gridTrackElement.classList.toggle( "gsui-mute", !b );
	}
};
