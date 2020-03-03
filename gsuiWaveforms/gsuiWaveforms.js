"use strict";

class gsuiWaveforms extends gsuiSVGDefs {
	hdMode( b ) {
		this._optResolution = b ? Infinity : 48;
	}
	update( id, buf ) {
		const polygon = gsuiSVGDefs.create( "polygon" ),
			w = this._optResolution === Infinity ? 260 : buf.duration * 48 | 0,
			h = 48;

		gsuiWaveform.drawBuffer( polygon, w, h, buf );
		return super.update( id, w, h, polygon );
	}
	setSVGViewbox( svg, x, w, bps ) {
		if ( this._optResolution === Infinity ) {
			return super.setSVGViewbox( svg, x * 260, w * 260 );
		}
		return super.setSVGViewbox( svg, x / bps * 48, w / bps * 48 );
	}
}
