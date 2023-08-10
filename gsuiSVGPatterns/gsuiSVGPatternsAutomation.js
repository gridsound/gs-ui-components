"use strict";

class gsuiSVGPatternsAutomation {
	static $render( data, dur ) {
		const poly = GSUcreateElementSVG( "polyline" );

		GSUsetAttribute( poly, "points", gsuiDotline.$draw( data, dur * 1, 1, dur, 1, 0, 0 ) );
		return [ poly ];
	}
}

Object.freeze( gsuiSVGPatternsAutomation );
