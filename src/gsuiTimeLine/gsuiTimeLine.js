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

	root.querySelector( ".gsui-timeClick" ).onmousedown = this._mousedownTime.bind( this );
	root.querySelector( ".gsui-loopA" ).onmousedown = this._mousedownLoop.bind( this, "a" );
	root.querySelector( ".gsui-loopB" ).onmousedown = this._mousedownLoop.bind( this, "b" );
}

gsuiTimeLine.prototype = {
	resized: function() {
		var rc = this.rootElement.getBoundingClientRect();

		this.width = rc.width;
		this.height = rc.height;
	},
	currentTime: function( beat, isUserAction ) {
		this._currentTime = beat;
		this._updateTime( isUserAction );
		if ( isUserAction && this.currentTimeOnchange ) {
			this.currentTimeOnchange( ct );
		}
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
			this._updateLoopA();
			this._updateLoopB();
		}
	},
	loopA: function( beat ) {
		this._loopA = +beat;
		this._loop && this._updateLoopA();
	},
	loopB: function( beat ) {
		this._loopB = +beat;
		this._loop && this._updateLoopB();
	},

	// private:
	_clone: function() {
		var div = document.createElement( "div" );

		gsuiTimeLine.template = gsuiTimeLine.template || this._init();
		div.appendChild( document.importNode( gsuiTimeLine.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init: function() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiTimeLine._focused && gsuiTimeLine._focused._mousemove( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiTimeLine._focused && gsuiTimeLine._focused._mouseup( e );
		} );
		return document.getElementById( "gsuiTimeLine" );
	},
	_mousemove: function( e ) {
		if ( this._lock ) {
			var bt = e.movementX / this._pxPerBeat;

			if ( this._lockA ) {
				this.loopA( this._loopA + bt );
			} else if ( this._lockB ) {
				this.loopB( this._loopB + bt );
			}
		}
	},
	_mouseup: function( e ) {
		this._lock = this._lockA = this._lockB = false;
		delete gsuiTimeLine._focused;
	},
	_mousedownTime: function( e ) {
		this.currentTime( this._offset + e.layerX / this._pxPerBeat, true );
	},
	_mousedownLoop: function( side, e ) {
		this._lock = true;
		this._lockA = side === "a";
		this._lockB = side === "b";
		gsuiTimeLine._focused = this;
	},
	_updateTime: function( isUserAction ) {
		this._elTime.classList.toggle( "gsui-trans", !!isUserAction );
		this._elTime.style.left =
			( this._currentTime - this._offset ) * this._pxPerBeat + "px";
	},
	_updateLoopA: function() {
		this._elLoop.style.left =
			( this._loopA - this._offset ) * this._pxPerBeat + "px";
	},
	_updateLoopB: function() {
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
		this._updateTime();
		if ( this._loop ) {
			this._updateLoopA();
			this._updateLoopB();
		}
	}
};
