"use strict";

function gsuiToggle( element, data ) {
	this.element = element;
	this.data = data;
	this.isOn = false;
	this._circleClass = element.querySelector( ".gsui-circle" ).classList;

	element.oncontextmenu = function() { return false; };
	element.onmousedown = this.__elementMousedown.bind( this );
}

gsuiToggle.prototype = {
	toggle: function( b ) {
		if ( b !== this.isOn ) {
			this.isOn = b;
			this._circleClass.toggle( "gsui-on", b );
			this.data.onchange && this.data.onchange( b );
		}
	},
	groupWith: function( tgg ) {
		var group = this.group;

		tgg.group = tgg.group || [ tgg ];
		if ( tgg !== this && group !== tgg.group ) {
			group && group.splice( group.indexOf( this ), 1 );
			this.group = tgg.group;
			tgg.group.push( this );
		}
	},

	// private:
	__elementMousedown: function( e ) {
		if ( e.button === 0 ) {
			this.toggle( !this.isOn );
		} else if ( e.button === 2 ) {
			if ( this.group ) {
				var b = this.group.every( function( tgg ) {
						return tgg === this || !tgg.isOn;
					}, this );

				this.group.forEach( function( tgg ) {
					if ( tgg !== this ) {
						tgg.toggle( b );
					}
				}, this );
			}
			this.toggle( true );
		}
	}
};
