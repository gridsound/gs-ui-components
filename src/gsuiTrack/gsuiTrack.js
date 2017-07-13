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

	this.data = {};
	this.uiToggle.onchange = this._evocToggle.bind( this );
	this.uiSpan.onchange = this._evocSpan.bind( this );
	this.toggle( true );
}

gsuiTrack.prototype = {
	remove() {
		this.rootElement.remove();
		this.rowElement.remove();
	},
	change( obj ) {
		"toggle" in obj && this.toggle( obj.toggle );
		"name" in obj && this.name( obj.name );
	},
	toggle( b ) {
		this._evocToggle( b, false );
	},
	name( n ) {
		this._evocSpan( n, false );
	},
	setPlaceholder( p ) {
		this.uiSpan.setPlaceholder( p );
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
		if ( isUserAction === false ) {
			this.uiToggle.toggle( b );
		} else {
			this.onchange( { redo: { toggle: b }, undo: { toggle: !b } } );
		}
		this.data.toggle = b;
	},
	_evocSpan( name, isUserAction ) {
		if ( isUserAction === false ) {
			this.uiSpan.setValue( name );
		} else {
			this.onchange( { redo: { name: name }, undo: { name: this.data.name } } );
		}
		this.data.name = name;
	}
};
