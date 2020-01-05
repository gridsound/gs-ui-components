"use strict";

class gsuiWaveforms extends gsuiSVGDefs {
	add( id, buf ) {
		const polygon = gsuiSVGDefs.create( "polygon" ),
			w = buf.duration * 48 | 0,
			h = 48;

		gsuiWaveform.drawBuffer( polygon, w, h, buf );
		return super.add( id, w, h, polygon );
	}
	setSVGViewbox( svg, xstart, xsize ) {
		return super.setSVGViewbox( svg, xstart * 48, xsize * 48 );
	}
}
