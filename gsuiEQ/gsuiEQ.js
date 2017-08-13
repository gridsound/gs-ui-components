"use strict";

function gsuiEQ() {
	var root = this._clone(),
		canvas = root.querySelector( "canvas" );

	this.rootElement = root;
	this.uiSpectrum = new gsuiSpectrum( canvas );
	this.uiSpectrum.setResolution( 256 );
};

gsuiEQ.prototype = {
	drawSpectrum: function( data ) {
		this.uiSpectrum.draw( data );
	},

	// private:
	_clone: function() {
		var div = document.createElement( "div" );

		gsuiEQ.template = gsuiEQ.template || this._init();
		div.appendChild( document.importNode( gsuiEQ.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init: function() {
		// ...
		return document.getElementById( "gsuiEQ" );
	}
};
