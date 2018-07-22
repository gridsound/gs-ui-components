"use strict";

class gsuiBeatlines {
	constructor( el ) {
		this.rootElement = el;
		this._beatsPerMeasure =
		this._stepsPerBeat = 4;
		this._pxPerBeat = 32;
		this._viewBox = this._pxPerBeat * this._beatsPerMeasure;
		el.classList.add( "gsuiBeatlines" );
		el.style.backgroundAttachment = "local";
	}

	pxPerBeat( pxBeat ) {
		this._pxPerBeat = Math.max( 0, pxBeat );
		this._viewBox = this._pxPerBeat * this._beatsPerMeasure;
		this.rootElement.style.backgroundSize = `${ this._viewBox }px 1px`;
	}
	timeSignature( a, b ) {
		this._beatsPerMeasure = Math.max( 1, ~~a );
		this._stepsPerBeat = Math.max( 1, ~~b );
		this._viewBox = this._pxPerBeat * this._beatsPerMeasure;
		this.render();
	}
	render() {
		const el = this.rootElement,
			stepPx = this._viewBox / this._beatsPerMeasure / this._stepsPerBeat,
			measureSteps = this._stepsPerBeat * this._beatsPerMeasure,
			measureColor = "rgb(0,0,0)",
			beatColor = "rgba(0,0,0,.4)",
			stepColor = "rgba(0,0,0,.1)",
			steps = [ `<rect x='0' y='0' height='1px' width='1px' fill='${ measureColor }'/>` ];

		for ( let step = 1; step < measureSteps; ++step ) {
			steps.push( `<rect height='1px' width='1px' y='0' x='${
				stepPx + stepPx * ( step - 1 ) - .5
			}' fill='${
				step % this._stepsPerBeat ? stepColor : beatColor
			}'/>` );
		}
		steps.push( `<rect y='0' height='1px' width='1px' fill='${ measureColor }' x='${
			stepPx + stepPx * ( measureSteps - 1 ) - .5 }'/>` );
		el.style.backgroundImage = `url("${ encodeURI(
			"data:image/svg+xml,<svg preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg' " +
			`viewBox='0 0 ${ this._viewBox } 1'>${ steps.join( " " ) }</svg>`
			) }")`;
		el.style.backgroundSize = `${ this._viewBox }px 1px`;
	}
}
