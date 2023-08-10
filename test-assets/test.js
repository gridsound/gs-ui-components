"use strict";

function lg( a ) { return console.log.apply( console, arguments ), a; }

(() => {
	document.addEventListener( "gsuiEvents", e => {
		const { component, eventName, args } = e.detail;

		console.warn( `gsuiEvent: [${ component }][${ eventName }]`, args );
	} );

	document.body.append(
		GSUcreateElement( "div", { id: "testBody" },
			GSUcreateElement( "div", { id: "testHead" },
				GSUcreateElement( "span", { id: "testTitle" }, "GSUI components testing" ),
				GSUcreateElement( "select", { id: "testSelect" },
					GSUcreateElement( "option", { value: "" }, "--" ),
					GSUcreateElement( "option", { value: "gsuiDAW" }, "gsuiDAW" ),
					GSUcreateElement( "option", { value: "gsuiAnalyser" }, "gsuiAnalyser" ),
					GSUcreateElement( "option", { value: "gsuiBeatlines" }, "gsuiBeatlines" ),
					GSUcreateElement( "option", { value: "gsuiChannel" }, "gsuiChannel" ),
					GSUcreateElement( "option", { value: "gsuiClock" }, "gsuiClock" ),
					GSUcreateElement( "option", { value: "gsuiDrums" }, "gsuiDrums" ),
					GSUcreateElement( "option", { value: "gsuiDrumrows" }, "gsuiDrumrows" ),
					GSUcreateElement( "option", { value: "gsuiDotline" }, "gsuiDotline" ),
					GSUcreateElement( "option", { value: "gsuiEnvelope" }, "gsuiEnvelope" ),
					GSUcreateElement( "option", { value: "gsuiFxDelay" }, "gsuiFxDelay" ),
					GSUcreateElement( "option", { value: "gsuiFxFilter" }, "gsuiFxFilter" ),
					GSUcreateElement( "option", { value: "gsuiKeys" }, "gsuiKeys" ),
					GSUcreateElement( "option", { value: "gsuiLFO" }, "gsuiLFO" ),
					GSUcreateElement( "option", { value: "gsuiLibrary" }, "gsuiLibrary" ),
					GSUcreateElement( "option", { value: "gsuiLibraries" }, "gsuiLibraries" ),
					GSUcreateElement( "option", { value: "gsuiMixer" }, "gsuiMixer" ),
					GSUcreateElement( "option", { value: "gsuiOscillator" }, "gsuiOscillator" ),
					GSUcreateElement( "option", { value: "gsuiPanels" }, "gsuiPanels" ),
					GSUcreateElement( "option", { value: "gsuiPianoroll" }, "gsuiPianoroll" ),
					GSUcreateElement( "option", { value: "gsuiScrollShadow" }, "gsuiScrollShadow" ),
					GSUcreateElement( "option", { value: "gsuiSlicer" }, "gsuiSlicer" ),
					GSUcreateElement( "option", { value: "gsuiSlider" }, "gsuiSlider" ),
					GSUcreateElement( "option", { value: "gsuiSliderGroup" }, "gsuiSliderGroup" ),
					GSUcreateElement( "option", { value: "gsuiSpectrum" }, "gsuiSpectrum" ),
					GSUcreateElement( "option", { value: "gsuiSVGPatterns" }, "gsuiSVGPatterns" ),
					GSUcreateElement( "option", { value: "gsuiSynthesizer" }, "gsuiSynthesizer" ),
					GSUcreateElement( "option", { value: "gsuiTimeline" }, "gsuiTimeline" ),
					GSUcreateElement( "option", { value: "gsuiTimewindow" }, "gsuiTimewindow" ),
					GSUcreateElement( "option", { value: "gsuiToggle" }, "gsuiToggle" ),
					GSUcreateElement( "option", { value: "gsuiTrack" }, "gsuiTrack" ),
					GSUcreateElement( "option", { value: "gsuiWindows" }, "gsuiWindows" ),
				),
			),
			GSUcreateElement( "div", { id: "testContent" },
				GSUcreateElement( "div", { id: "testWrap" } ),
				GSUcreateElement( "div", { id: "testCtrls" } ),
			),
			GSUcreateElement( "div", { id: "testDeps" } ),
		),
		GSUcreateElement( "div", { id: "testFoot" },
			GSUcreateElement( "div", { id: "testCopyright" },
				GSUcreateElement( "span", null, "© 2023 " ),
				GSUcreateElement( "a", { href: "https://gridsound.com" }, "gridsound.com" ),
				GSUcreateElement( "span", null, " all rights reserved" ),
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
