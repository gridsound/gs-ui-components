"use strict";

class gsuiBeatlines {
	constructor( el ) {
		this.rootElement = el;
		this._beatsPerMeasure =
		this._stepsPerBeat = 4;
		this._width =
		this._pxPerBeat = 0;
		Object.seal( this );

		el.classList.add( "gsuiBeatlines" );
		el.style.backgroundAttachment = "local";
		this.pxPerBeat( 32 );
	}

	pxPerBeat( pxBeat ) {
		this._pxPerBeat = pxBeat;
		this._updateWidth();
		this._updateBGSize();
	}
	getBeatsPerMeasure() {
		return this._beatsPerMeasure;
	}
	getStepsPerBeat() {
		return this._stepsPerBeat;
	}
	timeSignature( a, b ) {
		this._beatsPerMeasure = Math.max( 1, ~~a );
		this._stepsPerBeat = Math.max( 1, ~~b );
		this._updateWidth();
		this.render();
	}
	render() {
		const alpha = Math.min( this._pxPerBeat / 32, 1 ),
			bPM = this._beatsPerMeasure,
			sPB = this._stepsPerBeat,
			sPM = sPB * bPM,
			beatW = this._width / bPM,
			stepW = beatW / sPB,
			mesrColor = `rgba(0,0,0,${ 1 * alpha })`,
			beatColor = `rgba(0,0,0,${ .5 * alpha })`,
			stepColor = `rgba(0,0,0,${ .2 * alpha })`,
			beatBg = `rgba(0,0,0,${ .05 * alpha })`,
			elems = [];

		for ( let step = 0; step <= sPM * 2; ++step ) {
			const col = step % sPB ? stepColor :
					step % sPM ? beatColor : mesrColor,
				w = col === mesrColor ? 1.25 : 1,
				x = step * stepW - ( w / 2 );

			elems.push( this._createRect( x + stepW / 2, w, col ) );
		}
		for ( let beat = 0; beat <= bPM; ++beat ) {
			elems.push( this._createRect( beat * 2 * beatW + stepW / 2 - .5, beatW, beatBg ) );
		}
		this._updateBGImage( elems );
		this._updateBGSize();
	}

	// private:
	// .........................................................................
	_createRect( x, w, col ) {
		return `<rect x='${ x }' y='0' height='1' width='${ w }' fill='${ col }'/>`;
	}
	_updateWidth() {
		this._width = this._pxPerBeat * this._beatsPerMeasure;
	}
	_updateBGImage( steps ) {
		this.rootElement.style.backgroundImage = `url("${ encodeURI(
			"data:image/svg+xml,<svg preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg' " +
			`viewBox='0 0 ${ this._width * 2 } 1'>${ steps.join( " " ) }</svg>`
		) }")`;
	}
	_updateBGSize() {
		this.rootElement.style.backgroundSize = `${ this._width * 2 }px 1px`;
		this.rootElement.style.backgroundPositionX = `${ this._pxPerBeat / this._stepsPerBeat * -.5 }px`;
	}
}

Object.freeze( gsuiBeatlines );
