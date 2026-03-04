"use strict";

class gsuiTimeCursors extends gsui0ne {
	#w = 0;
	#ctx = this.$element.$get( 0 ).getContext( "2d" );
	#rgb = [ 255, 255, 255 ];
	#plays = [];
	#cursorImg = null;

	constructor() {
		super( {
			$cmpName: "gsuiTimeCursors",
			$tagName: "gsui-time-cursors",
			$template: GSUcreateElement( "canvas", { height: 1 } ),
		} );
		Object.seal( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "resolution" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "resolution": this.#resolution( +val ); break;
		}
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_TIMECURSORS_DRAW: this.#draw(); break;
			case GSEV_TIMECURSORS_PLAY: this.#play( val * 1000 ); break;
			case GSEV_TIMECURSORS_STOP: this.#stop(); break;
		}
	}

	// .........................................................................
	#resolution( w ) {
		this.$element.$get( 0 ).width =
		this.#w = w;
	}
	#stop() {
		this.#plays.length = 0;
		this.#ctx.clearRect( 0, 0, this.#w, 1 );
	}
	#play( dur ) {
		this.#plays.push( {
			$duration: dur,
			$startTime: Date.now(),
		} );
	}
	#draw() {
		if ( this.#plays.length ) {
			const now = Date.now();

			GSUarrayRemove( this.#plays, o => ( now - o.$startTime ) / o.$duration >= 2 );
			gsuiTimeCursors.#draw2( this.#ctx, this.#rgb, this.#w, this.#plays, now );
		}
	}

	// .........................................................................
	static #draw2( ctx, rgb, w, plays, now ) {
		const img = ctx.createImageData( w, 1 );
		const imgData = img.data;

		for ( let i = 0; i < w; ++i ) {
			const x = i * 4;

			imgData[ x     ] = rgb[ 0 ];
			imgData[ x + 1 ] = rgb[ 1 ];
			imgData[ x + 2 ] = rgb[ 2 ];
			imgData[ x + 3 ] = 255 * gsuiTimeCursors.#getPixelValue( plays, now, i / w );
		}
		ctx.putImageData( img, 0, 0 );
	}
	static #getPixelValue( arr, now, x ) {
		return Math.min( arr.reduce( ( val, o ) => {
			const ox = ( now - o.$startTime ) / o.$duration;

			return GSUmathApprox( ox, x, .005 )
				? 1
				: ox < x
					? val
					: val + Math.max( 0, ( 1 - ( ox - x ) ) ) / 4;
		}, 0 ), 1 );
	}
}

GSUdomDefine( "gsui-time-cursors", gsuiTimeCursors );
