"use strict";

function lg( a ) { return console.log.apply( console, arguments ), a; }

(() => {
	document.addEventListener( "gsui", ( { detail: d } ) => console.warn( `gsui event: "${ d.$event }"`, d.$args, d.$target ) );

	document.body.append(
		GSUcreateDiv( { id: "testBody" },
			GSUcreateFlex( { y: true, xcenter: true, g6: true },
				GSUcreateFlex( { x: true, xcenter: true, g10: true },
					GSUcreateSelect( { id: "testSelect" },
						GSUcreateOption( { value: "" }, "--" ),
						GSUcreateOption( { value: "gsuiComAvatar" } ),
						GSUcreateOption( { value: "gsuiComButton" } ),
						GSUcreateOption( { value: "gsuiComProfile" } ),
						GSUcreateOption( { value: "gsuiComPlayer" } ),
						GSUcreateOption( { value: "gsuiComPlaylist" } ),
						GSUcreateOption( { value: "gsuiDropdown" } ),
						GSUcreateOption( { value: "" }, "--" ),
						GSUcreateOption( { value: "gsuiGlitchText", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiDAW", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiWindows", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiPopup", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiPanels", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiClock", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiTempo", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiTitleUser", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiLibraries" } ),
						GSUcreateOption( { value: "gsuiLibrary" } ),
						GSUcreateOption( { value: "gsuiMixer", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiChannel", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiFxDelay" } ),
						GSUcreateOption( { value: "gsuiFxFilter" } ),
						GSUcreateOption( { value: "gsuiFxReverb" } ),
						GSUcreateOption( { value: "gsuiFxWaveShaper" } ),
						GSUcreateOption( { value: "gsuiAnalyserHz", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiAnalyserTd", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiAnalyserVu", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiAnalyserHist", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiTimewindow" } ),
						GSUcreateOption( { value: "gsuiTimeline" } ),
						GSUcreateOption( { value: "gsuiBeatlines" } ),
						GSUcreateOption( { value: "gsuiStepSelect" } ),
						GSUcreateOption( { value: "gsuiPianoroll", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiKeys", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiSliderGroup", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiDrums" } ),
						GSUcreateOption( { value: "gsuiDrumrows" } ),
						GSUcreateOption( { value: "gsuiPropSelect" } ),
						GSUcreateOption( { value: "gsuiSynthesizer", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiNoise", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiOscillator", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiEnvelope", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiLFO", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiWavetable", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiWavetableGraph", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiWaveEditor", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiTrack" } ),
						GSUcreateOption( { value: "gsuiSlicer", "data-hl": true } ),
						GSUcreateOption( { value: "gsuiDotline" } ),
						GSUcreateOption( { value: "gsuiScrollShadow" } ),
						GSUcreateOption( { value: "gsuiSlider" } ),
						GSUcreateOption( { value: "gsuiJoystick" } ),
						GSUcreateOption( { value: "gsuiSVGPatterns" } ),
						GSUcreateOption( { value: "gsuiToggle" } ),
						GSUcreateOption( { value: "gsuiActionMenu" } ),
						GSUcreateOption( { value: "gsuiReorder" } ),
					),
					GSUcreateButton( { id: "testSkin", icon: "adjust" } ),
				),
			),
			GSUcreateDiv( { id: "testContent" },
				GSUcreateDiv( { id: "testWrap" } ),
				GSUcreateDiv( { id: "testCtrls" } ),
			),
		),
		GSUcreateDiv( { id: "testFoot" },
			GSUcreateDiv( { id: "testCopyright" },
				GSUcreateSpan( null, `© ${ ( new Date() ).getFullYear() } ` ),
				GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
				GSUcreateSpan( null, " all rights reserved" ),
			),
		),
	);

	const elTEST = GSUdomQS( "#TEST" );
	const elCTRLS = GSUdomQS( "#TEST-CTRLS" );
	const elSkin = GSUdomQS( "#testSkin" );
	const elWrap = GSUdomQS( "#testWrap" );
	const elCtrls = GSUdomQS( "#testCtrls" );
	elTEST && Array.from( elTEST.children ).forEach( el => elWrap.append( el ) );
	elCTRLS && Array.from( elCTRLS.children ).forEach( el => elCtrls.append( el ) );
	if ( elTEST.dataset.minAuto === "" ) { GSUdomQS( "#testContent" ).dataset.minAuto = ""; }
	if ( elTEST.dataset.minXAuto === "" ) { GSUdomQS( "#testContent" ).dataset.minXAuto = ""; }
	if ( elTEST.dataset.minYAuto === "" ) { GSUdomQS( "#testContent" ).dataset.minYAuto = ""; }
	elTEST.remove();

	function getPath() {
		return location.pathname.split( "/" ).filter( Boolean );
	}

	const select = GSUdomQS( "#testSelect" );
	const path = getPath();
	const curr = path.pop();

	document.body.dataset.skin = localStorage.getItem( "skin" ) || "gray";
	elSkin.onclick = () => {
		const skin = document.body.dataset.skin === "white"
			? "gray"
			: "white";

		localStorage.setItem( "skin", skin );
		document.body.dataset.skin = skin;
	};

	document.title = `${ curr } (dev)`;
	select.value = curr;
	select.onchange = e => {
		const path = getPath();

		path.pop();
		path.push( e.target.value );
		location.href = `${ location.origin }/${ path.join( "/" ) }`;
	};
} )();
