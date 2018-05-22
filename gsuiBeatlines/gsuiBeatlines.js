"use strict";

class gsuiBeatlines {
	constructor( el ) {
		this.rootElement = el;
		el.classList.add( "gsuiBeatlines" );
		this._viewBox = 256;
		this._beatsPerMeasure =
		this._stepsPerBeat = 4;
	}

	pxPerBeat( pxBeat ) {
		const el = this.rootElement;
		
		this._pxPerBeat = Math.max( 0, pxBeat );
		this._viewBox = this._pxPerBeat * this._beatsPerMeasure;
		el.style.backgroundSize = `${ this._viewBox }px 1px`;
	}
	timeSignature( a, b ) {
		this._beatsPerMeasure = Math.max( 1, ~~a );
		this._stepsPerBeat = Math.min( Math.max( 1, ~~b ), 16 );
		this._viewBox = this._pxPerBeat * this._beatsPerMeasure;
		this._render();
	}
	render() {
		this._render();
	}

	// private:
	_render() {
		const el = this.rootElement,
			steps = [],
			viewBox = this._viewBox,
			measureSteps = this._stepsPerBeat * this._beatsPerMeasure,
			beatPx = viewBox / this._beatsPerMeasure,
			stepPx = beatPx / this._stepsPerBeat,
			measureColor = "#000",
			beatColor = "rgba( 0, 0, 0, .4 )",
			stepColor = "rgba( 0, 0, 0, .1 )";
		
		steps.push( `<rect x='0' height='1px' width='1px' fill='${ measureColor }'/>` );
		for ( let step = 1 ; step <= measureSteps ; ++step ) {
			const c = step === measureSteps ? 
					   		measureColor : 
					   		step % this._beatsPerMeasure ?
							 	stepColor :
							 	beatColor;
			
			steps.push( `<rect x='${ stepPx + ( stepPx * ( step - 1 ) ) - 1 }' height='1px' width='1px' fill='${ c }'/>` );
		}
		el.style.backgroundImage = `url("${
			encodeURI( "data:image/svg+xml,<svg preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'" +
				` viewBox='0 0 ${ viewBox } 1'>${ steps.join( " " ) }</svg>` ).replace( /#/g, "%23" )
		}")`;
		el.style.backgroundSize = `${ viewBox }px 1px`;
	}
}
