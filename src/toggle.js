"use strict";

gsUIComponents[ "gs-ui-toggle" ] = function( element, data ) {
	var circleClass = element.querySelector( ".gs-ui--circle" ).classList;

	element._isOn = false;
	element._toggle = function( b ) {
		if ( b !== element._isOn ) {
			element._isOn = b;
			circleClass.toggle( "gs-ui--on", b );
			data.onchange && data.onchange( b );
		}
	};
	element._groupWith = function( el ) {
		var group = element._group;

		el._group = el._group || [ el ];
		if ( el !== element && group !== el._group ) {
			if ( group ) {
				group.splice( group.indexOf( element ), 1 );
			}
			( element._group = el._group ) && el._group.push( element );
		}
	};

	element.oncontextmenu = function() { return false; };
	element.onmousedown = function( e ) {
		if ( e.button === 0 ) {
			element._toggle( !element._isOn );
		} else if ( e.button === 2 ) {
			if ( element._group ) {
				var b = element._group.every( function( el ) {
						return el === element || !el._isOn;
					} );

				element._group.forEach( function( el ) {
					if ( el !== element ) {
						el._toggle( b );
					}
				} );
			}
			element._toggle( true );
		}
	};
};
