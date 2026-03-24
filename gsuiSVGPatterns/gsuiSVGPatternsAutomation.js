"use strict";

class gsuiSVGPatternsAutomation {
	static $render( data, dur ) {
		const svg = GSUcreateElement( "gsui-dotlinesvg" );

		svg.$setSVGSize( dur * 10, 1 );
		svg.$setDataBox( "0 0 10 1" );
		svg.$setCurve( data.curve );
		return [ svg.$getPath().$get( 0 ) ];
	}
}

Object.freeze( gsuiSVGPatternsAutomation );
