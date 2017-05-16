"use strict";

function gsuiBeatLines( el ) {
	this.rootElement =
	el = el || document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
	el.setAttribute( "preserveAspectRatio", "none" );
	el.classList.add( "gsuiBeatLines" );
	this.elTime = this._newRect();
	this._elLoopA = this._newRect();
	this._elLoopB = this._newRect();
	this.elTime.setAttribute( "class", "gsui-currentTime" );
	this._elLoopA.setAttribute( "class", "gsui-hlStart" );
	this._elLoopB.setAttribute( "class", "gsui-hlEnd" );
	this._elLoopA.setAttribute( "x", 0 );
	this._elLoopB.setAttribute( "width", "10000%" );
	this._offset = 0;
	this._pxPerBeat = 32;
	this._beatsPerMeasure =
	this._stepsPerBeat = 4;
	this.steps = [];
	this.currentTime( 0 );
	this.loop( false );
}

gsuiBeatLines.prototype = {
	resized() {
		var rt = this.rootElement;

		this.width = rt.getBoundingClientRect().width;
		rt.setAttribute( "viewBox", "0 0 " + this.width + " 1" );
	},
	currentTime( beat ) {
		this._currentTime = beat;
		this._timeUpdate();
	},
	offset( beat, pxBeat ) {
		this._offset = Math.max( 0, beat );
		this._pxPerBeat = Math.max( 0, pxBeat );
		this._render();
	},
	timeSignature( a, b ) {
		this._beatsPerMeasure = Math.max( 1, ~~a );
		this._stepsPerBeat = Math.min( Math.max( 1, ~~b ), 16 );
		this._render();
	},
	loop( a, b ) {
		if ( a === false ) {
			this._loop = a;
		} else {
			this._loop = true;
			this._loopA = a;
			this._loopB = b;
			this._updateLoop();
		}
		this._elLoopA.style.display =
		this._elLoopB.style.display = this._loop ? "block" : "none";
	},
	render() {
		this._render();
	},

	// private:
	_render() {
		var rectClass,
			elStep,
			elSteps = this.steps,
			beatPx = this._pxPerBeat,
			stepsBeat = this._stepsPerBeat,
			stepsMeasure = stepsBeat * this._beatsPerMeasure,
			stepPx = beatPx / stepsBeat,
			stepEm = 1 / stepsBeat,
			stepId = 0,
			stepsDuration = Math.ceil( this.width / stepPx ),
			step = ~~( this._offset * stepsBeat ) + 1,
			em = -this._offset % stepEm + stepEm;

		while ( elSteps.length < stepsDuration ) {
			elSteps.push( this._newRect() );
		}
		for ( ; stepId < stepsDuration; ++stepId ) {
			rectClass = "gsui-" + ( step % stepsMeasure ? step % stepsBeat ?
				"step" : "beat" : "measure" );
			elStep = elSteps[ stepId ];
			elStep.style.display = "block";
			elStep.setAttribute( "x", em * beatPx + "px" );
			elStep.setAttribute( "class", rectClass );
			elStep.setAttribute( "width", rectClass !== "gsui-measure" ? "1px" : "2px" );
			++step;
			em += stepEm;
		}
		while ( ( elStep = elSteps[ stepId++ ] ) && elStep.style.display !== "none" ) {
			elStep.style.display = "none";
		}
		this._timeUpdate();
		if ( this._loop ) {
			this._updateLoop();
		}
	},
	_newRect() {
		var rc = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );

		rc.setAttribute( "y", 0 );
		rc.setAttribute( "height", "1px" );
		rc.setAttribute( "width", "1px" );
		rc.style.display = "none";
		this.rootElement.prepend( rc );
		return rc;
	},
	_timeUpdate() {
		var x = this._currentTime - this._offset;

		this.elTime.style.display = x > 0 ? "block" : "none";
		this.elTime.setAttribute( "x", x * this._pxPerBeat + "px" );
	},
	_updateLoop() {
		this._elLoopA.setAttribute( "width",
			Math.max( 0, this._loopA - this._offset ) * this._pxPerBeat + "px" );
		this._elLoopB.setAttribute( "x",
			( this._loopB - this._offset ) * this._pxPerBeat + "px" );
	}
};
