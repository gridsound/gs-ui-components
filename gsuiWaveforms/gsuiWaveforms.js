"use strict";

class gsuiWaveforms extends gsuiSVGDefs {
	add( id, buf ) {
		const polygon = gsuiSVGDefs.create( "polygon" ),
			w = buf.duration * 48 | 0,
			h = 48;

		gsuiWaveform.drawBuffer( polygon, w, h, buf );
		return super.add( id, w, h, polygon );
	}
	setSVGViewbox( svg, x, w, bps ) {
		return super.setSVGViewbox( svg, x / bps * 48, w / bps * 48 );
	}
}
