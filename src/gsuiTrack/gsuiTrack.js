"use strict";

function gsuiTrack() {
	var root = this._clone();

	this.rootElement = root;
	this.rowElement = root.querySelector( ".gsui-row" );
	this.rowElement.remove();
	this.uiToggle = new gsuiToggle();
	this.uiSpan = new gsuiSpanEditable();
	root.append( this.uiToggle.rootElement );
	root.append( this.uiSpan.rootElement );

	this.uiToggle.onchange = this._evocToggle.bind( this );
	this.uiSpan.onchange = this._evocSpan.bind( this );
	this.toggle( true );
}

gsuiTrack.prototype = {
	toggle( b ) {
		this.uiToggle.toggle( b );
		this._evocToggle( b, false );
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
	_evocToggle( b, isUserAction ) {
		this.rootElement.classList.toggle( "gsui-mute", !b );
		this.rowElement.classList.toggle( "gsui-mute", !b );
		if ( isUserAction !== false && this.ontogglechange ) {
			this.ontogglechange( b );
		}
	},
	_evocSpan( name ) {
		if ( this.onnamechange ) {
			this.onnamechange( name );
		}
	}
};
