"use strict";

class gsuiSVGPatternsAutomation {
	static $render( _data, _dur ) {
		const poly = $( "<polyline>" );

		// poly.$setAttr( "points", gsuiDotlineSVG.$draw( data, dur * 1, 1, dur, 1, 0, 0 ) );
		return [ poly.$get( 0 ) ];
	}
}

Object.freeze( gsuiSVGPatternsAutomation );
