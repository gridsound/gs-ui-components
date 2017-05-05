"use strict";

function gsuiBeatLines( el ) {
	this.rootElement =
	el = el || document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
	el.setAttribute( "preserveAspectRatio", "none" );
	el.classList.add( "gsuiBeatLines" );
	this.elTime = this._newRect();
	this.elHLstart = this._newRect();
	this.elHLend = this._newRect();
	this.elTime.setAttribute( "class", "gsui-currentTime" );
	this.elHLstart.setAttribute( "class", "gsui-hlStart" );
	this.elHLend.setAttribute( "class", "gsui-hlEnd" );
	this.elHLstart.setAttribute( "x", 0 );
	this.elHLend.setAttribute( "width", "10000%" );
	this.offset = 0;
	this.beatsPerMeasure =
	this.stepsPerBeat = 4;
	this.steps = [];
	this.setCurrentTime( 0 );
	this.setResolution( 256 );
	this.highlight( false );
}

gsuiBeatLines.prototype = {
	setResolution: function( w ) {
		this.width = w;
		this.rootElement.setAttribute( "viewBox", "0 0 " + w + " 1" );
	},
	setCurrentTime: function( beat ) {
		this.currentTime = beat;
		this._timeUpdate();
	},
	highlight: function( b ) {
		this._hl = !!b;
		this.elHLstart.style.display =
		this.elHLend.style.display = b ? "block" : "none";
	},
	highlightStart: function( beat ) {
		this._hlA = +beat;
		this._hlStart();
	},
	highlightEnd: function( beat ) {
		this._hlB = +beat;
		this._hlEnd();
	},
	draw: function() {
		var rectClass,
			elStep,
			elSteps = this.steps,
			rootStyle = getComputedStyle( this.rootElement ),
			fontSize = parseFloat( rootStyle.fontSize ),
			stepsBeat = this.stepsPerBeat,
			stepsMeasure = stepsBeat * this.beatsPerMeasure,
			stepsDuration = Math.ceil( this.width / fontSize * stepsBeat ),
			offset = this.offset * stepsBeat,
			stepEm = 1 / stepsBeat,
			stepId = 0,
			step = ~~offset,
			em = -( offset % 1 ) / stepsBeat;

		++step;
		em += stepEm;
		while ( elSteps.length < stepsDuration ) {
			elSteps.push( this._newRect() );
		}
		for ( ; stepId < stepsDuration; ++stepId ) {
			rectClass = "gsui-" + ( step % stepsMeasure ? step % stepsBeat ?
				"step" : "beat" : "measure" );
			elStep = elSteps[ stepId ];
			elStep.style.display = "block";
			elStep.setAttribute( "x", em + "em" );
			elStep.setAttribute( "class", rectClass );
			elStep.setAttribute( "width", rectClass !== "gsui-measure" ? "1px" : "2px" );
			++step;
			em += stepEm;
		}
		for ( ; stepId < elSteps.length; ++stepId ) {
			elSteps[ stepId ].style.display = "none";
		}
		this._timeUpdate();
		this._hlStart();
		this._hlEnd();
	},

	// private:
	_newRect: function() {
		var rc = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );

		rc.setAttribute( "y", 0 );
		rc.setAttribute( "height", "1px" );
		rc.setAttribute( "width", "1px" );
		this.rootElement.prepend( rc );
		return rc;
	},
	_timeUpdate: function() {
		this.elTime.style.display = this.currentTime > this.offset ? "block" : "none";
		this.elTime.setAttribute( "x", this.currentTime - this.offset + "em" );
	},
	_hlStart: function() {
		var w = this._hlA - this.offset;

		if ( w >= 0 ) {
			this.elHLstart.setAttribute( "width", w + "em" );
		}
	},
	_hlEnd: function() {
		var x = this._hlB - this.offset;

		if ( x >= 0 ) {
			this.elHLend.setAttribute( "x", x + "em" );
		}
	}
};
