"use strict";

function gsuiBeatLines( el ) {
	this.rootElement =
	el = el || document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
	el.setAttribute( "preserveAspectRatio", "none" );
	el.classList.add( "gsuiBeatLines" );
	this.setResolution( 256 );
	this.offset = 0;
	this.beatsPerMeasure =
	this.stepsPerBeat = 4;
	this.steps = [];
}

gsuiBeatLines.prototype = {
	setResolution( w ) {
		this.width = w;
		this.rootElement.setAttribute( "viewBox", "0 0 " + w + " 1" );
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
			elStep = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );
			elStep.setAttribute( "y", 0 );
			elStep.setAttribute( "height", 1 );
			this.rootElement.appendChild( elStep );
			elSteps.push( elStep );
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
	}
};
