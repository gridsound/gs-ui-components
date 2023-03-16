"use strict";

function lg( a ) { return console.log.apply( console, arguments ), a; }

(() => {

	document.addEventListener( "gsuiEvents", e => {
		const { component, eventName, args } = e.detail;

		console.warn( `gsuiEvent: [${ component }][${ eventName }]`, args );
	} );

	document.body.append(
		GSUI.$createElement( "div", { id: "testBody" },
			GSUI.$createElement( "div", { id: "testHead" },
				GSUI.$createElement( "span", { id: "testTitle" }, "GSUI components testing" ),
				GSUI.$createElement( "select", { id: "testSelect" },
					GSUI.$createElement( "option", { value: "" }, "--" ),
					GSUI.$createElement( "option", { value: "gsuiDAW" }, "gsuiDAW" ),
					GSUI.$createElement( "option", { value: "gsuiAnalyser" }, "gsuiAnalyser" ),
					GSUI.$createElement( "option", { value: "gsuiBeatlines" }, "gsuiBeatlines" ),
					GSUI.$createElement( "option", { value: "gsuiChannel" }, "gsuiChannel" ),
					GSUI.$createElement( "option", { value: "gsuiClock" }, "gsuiClock" ),
					GSUI.$createElement( "option", { value: "gsuiEnvelope" }, "gsuiEnvelope" ),
					GSUI.$createElement( "option", { value: "gsuiFxDelay" }, "gsuiFxDelay" ),
					GSUI.$createElement( "option", { value: "gsuiFxFilter" }, "gsuiFxFilter" ),
					GSUI.$createElement( "option", { value: "gsuiKeys" }, "gsuiKeys" ),
					GSUI.$createElement( "option", { value: "gsuiLFO" }, "gsuiLFO" ),
					GSUI.$createElement( "option", { value: "gsuiLibrary" }, "gsuiLibrary" ),
					GSUI.$createElement( "option", { value: "gsuiLibraries" }, "gsuiLibraries" ),
					GSUI.$createElement( "option", { value: "gsuiMixer" }, "gsuiMixer" ),
					GSUI.$createElement( "option", { value: "gsuiOscillator" }, "gsuiOscillator" ),
					GSUI.$createElement( "option", { value: "gsuiPanel" }, "gsuiPanel" ),
					GSUI.$createElement( "option", { value: "gsuiScrollShadow" }, "gsuiScrollShadow" ),
					GSUI.$createElement( "option", { value: "gsuiSlicer" }, "gsuiSlicer" ),
					GSUI.$createElement( "option", { value: "gsuiSlider" }, "gsuiSlider" ),
					GSUI.$createElement( "option", { value: "gsuiSliderGroup" }, "gsuiSliderGroup" ),
					GSUI.$createElement( "option", { value: "gsuiSpectrum" }, "gsuiSpectrum" ),
					GSUI.$createElement( "option", { value: "gsuiSynthesizer" }, "gsuiSynthesizer" ),
					GSUI.$createElement( "option", { value: "gsuiTimeline" }, "gsuiTimeline" ),
					GSUI.$createElement( "option", { value: "gsuiTimewindow" }, "gsuiTimewindow" ),
					GSUI.$createElement( "option", { value: "gsuiToggle" }, "gsuiToggle" ),
					GSUI.$createElement( "option", { value: "gsuiTrack" }, "gsuiTrack" ),
					GSUI.$createElement( "option", { value: "gsuiWindows" }, "gsuiWindows" ),
				),
			),
			GSUI.$createElement( "div", { id: "testContent" },
				GSUI.$createElement( "div", { id: "testWrap" } ),
				GSUI.$createElement( "div", { id: "testCtrls" } ),
			),
			GSUI.$createElement( "div", { id: "testDeps" } ),
		),
		GSUI.$createElement( "div", { id: "testFoot" },
			GSUI.$createElement( "div", { id: "testCopyright" },
				GSUI.$createElement( "span", null, "© 2023 " ),
				GSUI.$createElement( "a", { href: "https://gridsound.com" }, "gridsound.com" ),
				GSUI.$createElement( "span", null, " all rights reserved" ),
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
