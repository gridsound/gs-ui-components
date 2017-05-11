"use strict";

function gsuiTimeLine() {
	var root = this._clone();

	this.rootElement = root;
	this._elTime = root.querySelector( ".gsui-currentTime" );
	this._elLoop = root.querySelector( ".gsui-loop" );
	this._offset = 0;
	this._pxPerBeat = 32;
	this._beatsPerMeasure =
	this._stepsPerBeat = 4;
	this._steps = [];
	this.currentTime( 0 );
	this.loop( false );
}

gsuiTimeLine.prototype = {
	resized: function() {
		var rc = this.rootElement.getBoundingClientRect();

		this.width = rc.width;
		this.height = rc.height;
	},
	currentTime: function( beat ) {
		this._currentTime = beat;
		this._upTime();
	},
	offset: function( beat, pxBeat ) {
		this._offset = Math.max( 0, +beat || 0 );
		this._pxPerBeat = +pxBeat;
		this._render();
	},
	timeSignature: function( a, b ) {
		this._beatsPerMeasure = Math.max( 1, ~~a );
		this._stepsPerBeat = Math.min( Math.max( 1, ~~b ), 16 );
		this._render();
	},
	loop: function( b ) {
		this._loop = !!b;
		this._elLoop.style.display = b ? "block" : "none";
		if ( this._loop ) {
			this._upLoopA();
			this._upLoopB();
		}
	},
	loopA: function( beat ) {
		this._loopA = +beat;
		this._loop && this._upLoopA();
	},
	loopB: function( beat ) {
		this._loopB = +beat;
		this._loop && this._upLoopB();
	},

	// private:
	_clone: function() {
		var div = document.createElement( "div" );

		gsuiTimeLine.template = gsuiTimeLine.template ||
			document.getElementById( "gsuiTimeLine" );
		div.appendChild( document.importNode( gsuiTimeLine.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_upTime: function() {
		this._elTime.style.left =
			( this._currentTime - this._offset ) * this._pxPerBeat + "px";
	},
	_upLoopA: function() {
		this._elLoop.style.left =
			( this._loopA - this._offset ) * this._pxPerBeat + "px";
	},
	_upLoopB: function() {
		this._elLoop.style.right =
			this.width - ( this._loopB - this._offset ) * this._pxPerBeat + "px";
	},
	_render: function() {
		var stepRel,
			elStep,
			rootCL = this.rootElement.classList,
			elSteps = this._steps,
			beatPx = this._pxPerBeat,
			stepsBeat = this._stepsPerBeat,
			stepsMeasure = stepsBeat * this._beatsPerMeasure,
			stepPx = beatPx / stepsBeat,
			stepEm = 1 / stepsBeat,
			stepId = 0,
			stepsDuration = Math.ceil( this.width / stepPx + 2 ),
			beatsDuration = this.width / beatPx,
			step = ~~( this._offset * stepsBeat ),
			em = -this._offset % stepEm;

		rootCL.remove( "gsui-step", "gsui-beat", "gsui-measure" );
		rootCL.add( "gsui-" + ( beatPx > 24 ? beatPx > 72 ?
				"step" : "beat" : "measure" ) );
		while ( elSteps.length < stepsDuration ) {
			elStep = document.createElement( "div" );
			elSteps.push( elStep );
		}
		for ( ; stepId < stepsDuration; ++stepId ) {
			stepRel = step % stepsBeat;
			elStep = elSteps[ stepId ];
			elStep.style.left = em * beatPx + "px";
			elStep.className = "gsui-" + ( step % stepsMeasure ? stepRel ?
				"step" : "beat" : "measure" );
			elStep.textContent = elStep.className !== "gsui-step"
				? ~~( 1 + step / stepsBeat ) : "." ;
			if ( !elStep.parentNode ) {
				this.rootElement.append( elStep );
			}
			++step;
			em += stepEm;
		}
		for ( ; stepId < elSteps.length; ++stepId ) {
			elStep = elSteps[ stepId ];
			if ( !elStep.parentNode ) {
				break;
			}
			elStep.remove();
		}
		this._upTime();
		if ( this._loop ) {
			this._upLoopA();
			this._upLoopB();
		}
	}
};
