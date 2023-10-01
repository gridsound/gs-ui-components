"use strict";

function lg( a ) { return console.log.apply( console, arguments ), a; }

(() => {
	document.addEventListener( "gsuiEvents", e => {
		const { component, eventName, args } = e.detail;

		console.warn( `gsuiEvent: [${ component }][${ eventName }]`, args );
	} );

	document.body.append(
		GSUcreateDiv( { id: "testBody" },
			GSUcreateDiv( { id: "testHead" },
				GSUcreateSpan( { id: "testTitle" }, "GSUI components testing" ),
				GSUcreateSelect( { id: "testSelect" },
					GSUcreateOption( { value: "" }, "--" ),
					GSUcreateOption( { value: "gsuiDAW" } ),
					GSUcreateOption( { value: "gsuiAnalyser" } ),
					GSUcreateOption( { value: "gsuiBeatlines" } ),
					GSUcreateOption( { value: "gsuiChannel" } ),
					GSUcreateOption( { value: "gsuiClock" } ),
					GSUcreateOption( { value: "gsuiDrums" } ),
					GSUcreateOption( { value: "gsuiDrumrows" } ),
					GSUcreateOption( { value: "gsuiDotline" } ),
					GSUcreateOption( { value: "gsuiEnvelope" } ),
					GSUcreateOption( { value: "gsuiFxDelay" } ),
					GSUcreateOption( { value: "gsuiFxFilter" } ),
					GSUcreateOption( { value: "gsuiKeys" } ),
					GSUcreateOption( { value: "gsuiLFO" } ),
					GSUcreateOption( { value: "gsuiLibrary" } ),
					GSUcreateOption( { value: "gsuiLibraries" } ),
					GSUcreateOption( { value: "gsuiMixer" } ),
					GSUcreateOption( { value: "gsuiOscillator" } ),
					GSUcreateOption( { value: "gsuiPanels" } ),
					GSUcreateOption( { value: "gsuiPianoroll" } ),
					GSUcreateOption( { value: "gsuiScrollShadow" } ),
					GSUcreateOption( { value: "gsuiSlicer" } ),
					GSUcreateOption( { value: "gsuiSlider" } ),
					GSUcreateOption( { value: "gsuiSliderGroup" } ),
					GSUcreateOption( { value: "gsuiSpectrum" } ),
					GSUcreateOption( { value: "gsuiSVGPatterns" } ),
					GSUcreateOption( { value: "gsuiSynthesizer" } ),
					GSUcreateOption( { value: "gsuiTimeline" } ),
					GSUcreateOption( { value: "gsuiTimewindow" } ),
					GSUcreateOption( { value: "gsuiToggle" } ),
					GSUcreateOption( { value: "gsuiTrack" } ),
					GSUcreateOption( { value: "gsuiWindows" } ),
				),
			),
			GSUcreateDiv( { id: "testContent" },
				GSUcreateDiv( { id: "testWrap" } ),
				GSUcreateDiv( { id: "testCtrls" } ),
			),
		),
		GSUcreateDiv( { id: "testFoot" },
			GSUcreateDiv( { id: "testCopyright" },
				GSUcreateSpan( null, "© 2023 " ),
				GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
				GSUcreateSpan( null, " all rights reserved" ),
			),
		),
	);

	const elTEST = document.querySelector( "#TEST" );
	const elCTRLS = document.querySelector( "#TEST-CTRLS" );
	elTEST && Array.from( elTEST.children ).forEach( el => document.querySelector( "#testWrap" ).append( el ) );
	elCTRLS && Array.from( elCTRLS.children ).forEach( el => document.querySelector( "#testCtrls" ).append( el ) );

	function getPath() {
		return location.pathname.split( "/" ).filter( Boolean );
	}

	const select = document.querySelector( "#testSelect" );
	const path = getPath();
	const curr = path.pop();

	document.title = `${ curr } (dev)`;
	select.value = curr;
	select.onchange = e => {
		const path = getPath();

		path.pop();
		path.push( e.target.value );
		location.href = `${ location.origin }/${ path.join( "/" ) }`;
	}
} )();
