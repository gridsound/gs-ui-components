"use strict";

function gsuiTimeLine() {
	var root = this._clone(),
		elCurrentTime = root.querySelector( ".gsui-currentTime" ),
		elLoopBg = root.querySelector( ".gsui-loopBg" );

	this.rootElement = root;
	this._elTime = root.querySelector( ".gsui-cursor" );
	this._elTimeLine = root.querySelector( ".gsui-cursorLine" );
	this._elLoop = root.querySelector( ".gsui-loop" );
	this._elLoopBgCL = elLoopBg.classList;
	this._elLoopBrdACL = root.querySelector( ".gsui-loopBrdA" ).classList;
	this._elLoopBrdBCL = root.querySelector( ".gsui-loopBrdB" ).classList;
	this._offset = 0;
	this._pxPerBeat = 32;
	this._beatsPerMeasure =
	this._stepsPerBeat = 4;
	this._steps = [];
	this.currentTime( 0 );
	this.loop( false );

	elCurrentTime.onmousedown = this._mousedownTime.bind( this );
	elCurrentTime.onmousemove = this._mousemoveTime.bind( this );
	elLoopBg.onmousedown = this._mousedownLoop.bind( this, "ab" );
	root.querySelector( ".gsui-loopA" ).onmousedown = this._mousedownLoop.bind( this, "a" );
	root.querySelector( ".gsui-loopB" ).onmousedown = this._mousedownLoop.bind( this, "b" );
	root.querySelector( ".gsui-loopLine" ).onmousedown = this._mousedownLoopLine.bind( this );
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
	loop: function( a, b ) {
		if ( arguments.length === 1 ) {
			this._loop = !!a;
			this._elLoop.style.display = a ? "block" : "none";
		} else {
			this._loopA = Math.min( a, b );
			this._loopB = Math.max( a, b );
		}
		this._updateLoop();
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
			var la = this._lockA,
				lb = this._lockB,
				a = this._loopA,
				b = this._loopB,
				bt = e.movementX / this._pxPerBeat;

			if ( la || lb ) {
				la ? a += bt : b += bt;
				if ( a > b ) {
					this._lockA = lb;
					this._lockB = la;
					this._elLoopBrdACL.toggle( "gsui-hover", lb );
					this._elLoopBrdBCL.toggle( "gsui-hover", la );
				}
			} else {
				if ( a + bt < 0 ) {
					bt = -a;
				}
				a += bt;
				b += bt;
			}
			this.loop( a, b );
		}
	},
	_mouseup: function( e ) {
		this._lock =
		this._lockA =
		this._lockB = false;
		this._elLoopBgCL.remove( "gsui-hover" );
		this._elLoopBrdACL.remove( "gsui-hover" );
		this._elLoopBrdBCL.remove( "gsui-hover" );
		delete gsuiTimeLine._focused;
	},
	_mousedownTime: function( e ) {
		this.currentTime( this._offset + e.layerX / this._pxPerBeat, true );
	},
	_mousemoveTime: function( e ) {
		var x = e.layerX / this.width * 100;

		this._elTimeLine.style.backgroundImage =
			"linear-gradient(90deg,transparent " + ( x - 15 ) +
			"%,currentColor " + x + "%,transparent " + ( x + 15 ) + "%)";
	},
	_mousedownLoop: function( side ) {
		this._lock = true;
		this._lockA = side === "a";
		this._lockB = side === "b";
		this._elLoopBgCL.toggle( "gsui-hover", side === "ab" );
		this._elLoopBrdACL.toggle( "gsui-hover", this._lockA );
		this._elLoopBrdBCL.toggle( "gsui-hover", this._lockB );
		gsuiTimeLine._focused = this;
	},
	_mousedownLoopLine: function( e ) {
		var now = Date.now(),
			bt = this._offset + e.layerX / this._pxPerBeat;

		if ( !this._loopClick || now - this._loopClick > 500 ) {
			this._loopClick = now;
		} else {
			this.loop( bt, bt );
			this.loop( true );
			this._mousedownLoop( "b" );
		}
	},
	_updateTime: function( isUserAction ) {
		this._elTime.classList.toggle( "gsui-trans", !!isUserAction );
		this._elTime.style.left =
			( this._currentTime - this._offset ) * this._pxPerBeat + "px";
	},
	_updateLoop: function() {
		if ( this._loop ) {
			var s = this._elLoop.style,
				px = this._pxPerBeat,
				off = this._offset;

			s.left = ( this._loopA - off ) * px + "px";
			s.right = this.width - ( this._loopB - off ) * px + "px";
		}
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
		this._updateLoop();
	}
};
