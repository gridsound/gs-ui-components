"use strict";

class gsuiBeatlines {
	constructor( el ) {
		this.rootElement = el;
		this._beatsPerMeasure =
		this._stepsPerBeat = 4;
		this._pxPerBeat = 32;
		this._width = this._pxPerBeat * this._beatsPerMeasure;
		Object.seal( this );

		el.classList.add( "gsuiBeatlines" );
		el.style.backgroundAttachment = "local";
	}

	pxPerBeat( pxBeat ) {
		this._pxPerBeat = pxBeat;
		this._width = pxBeat * this._beatsPerMeasure;
		this.rootElement.style.backgroundSize = `${ this._width }px 1px`;
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
		this._width = this._pxPerBeat * this._beatsPerMeasure;
		this.render();
	}
	render() {
		const el = this.rootElement,
			alpha = Math.min( this._pxPerBeat / 32, 1 ),
			stepPx = this._width / this._beatsPerMeasure / this._stepsPerBeat,
			mesrSteps = this._stepsPerBeat * this._beatsPerMeasure,
			mesrColor = `rgba(0,0,0,${ 1 * alpha })`,
			beatColor = `rgba(0,0,0,${ .5 * alpha })`,
			stepColor = `rgba(0,0,0,${ .2 * alpha })`,
			steps = [ `<rect x='0' y='0' height='1px' width='1.25px' fill='${ mesrColor }'/>` ];

		for ( let step = 1; step < mesrSteps; ++step ) {
			const x = stepPx + stepPx * ( step - 1 ) - .5,
				col = step % this._stepsPerBeat ? stepColor : beatColor;

			steps.push( `<rect height='1px' width='1px' y='0' x='${ x }' fill='${ col }'/>` );
		}
		steps.push( `<rect y='0' height='1px' width='1.25px' fill='${ mesrColor }' x='${
			stepPx + stepPx * ( mesrSteps - 1 ) - .5 }'/>` );
		el.style.backgroundImage = `url("${ encodeURI(
			"data:image/svg+xml,<svg preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg' " +
			`viewBox='0 0 ${ this._width } 1'>${ steps.join( " " ) }</svg>`
		) }")`;
		el.style.backgroundSize = `${ this._width }px 1px`;
	}
}

Object.freeze( gsuiBeatlines );
