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
						GSUcreateOption( { value: "gsuiActionMenu" } ),
						GSUcreateOption( { value: "gsuiAnalyserHist" } ),
						GSUcreateOption( { value: "gsuiAnalyserHz" } ),
						GSUcreateOption( { value: "gsuiAnalyserTd" } ),
						GSUcreateOption( { value: "gsuiAnalyserVu" } ),
						GSUcreateOption( { value: "gsuiBeatlines" } ),
						GSUcreateOption( { value: "gsuiChannel" } ),
						GSUcreateOption( { value: "gsuiClock" } ),
						GSUcreateOption( { value: "gsuiComAvatar" } ),
						GSUcreateOption( { value: "gsuiComButton" } ),
						GSUcreateOption( { value: "gsuiComPlayer" } ),
						GSUcreateOption( { value: "gsuiComPlaylist" } ),
						GSUcreateOption( { value: "gsuiComProfile" } ),
						GSUcreateOption( { value: "gsuiComUserLink" } ),
						GSUcreateOption( { value: "gsuiDAW" } ),
						GSUcreateOption( { value: "gsuiDotline" } ),
						GSUcreateOption( { value: "gsuiDropdown" } ),
						GSUcreateOption( { value: "gsuiDrumrows" } ),
						GSUcreateOption( { value: "gsuiDrums" } ),
						GSUcreateOption( { value: "gsuiEnvelope" } ),
						GSUcreateOption( { value: "gsuiFxDelay" } ),
						GSUcreateOption( { value: "gsuiFxFilter" } ),
						GSUcreateOption( { value: "gsuiFxReverb" } ),
						GSUcreateOption( { value: "gsuiFxWaveShaper" } ),
						GSUcreateOption( { value: "gsuiGlitchText" } ),
						GSUcreateOption( { value: "gsuiJoystick" } ),
						GSUcreateOption( { value: "gsuiKeys" } ),
						GSUcreateOption( { value: "gsuiLFO" } ),
						GSUcreateOption( { value: "gsuiLibraries" } ),
						GSUcreateOption( { value: "gsuiLibrary" } ),
						GSUcreateOption( { value: "gsuiMixer" } ),
						GSUcreateOption( { value: "gsuiNoise" } ),
						GSUcreateOption( { value: "gsuiOscillator" } ),
						GSUcreateOption( { value: "gsuiPanels" } ),
						GSUcreateOption( { value: "gsuiPianoroll" } ),
						GSUcreateOption( { value: "gsuiPopup" } ),
						GSUcreateOption( { value: "gsuiPropSelect" } ),
						GSUcreateOption( { value: "gsuiReorder" } ),
						GSUcreateOption( { value: "gsuiScrollShadow" } ),
						GSUcreateOption( { value: "gsuiSlicer" } ),
						GSUcreateOption( { value: "gsuiSlider" } ),
						GSUcreateOption( { value: "gsuiSliderGroup" } ),
						GSUcreateOption( { value: "gsuiStepSelect" } ),
						GSUcreateOption( { value: "gsuiSVGPatterns" } ),
						GSUcreateOption( { value: "gsuiSynthesizer" } ),
						GSUcreateOption( { value: "gsuiTempo" } ),
						GSUcreateOption( { value: "gsuiTimeline" } ),
						GSUcreateOption( { value: "gsuiTimewindow" } ),
						GSUcreateOption( { value: "gsuiTitleUser" } ),
						GSUcreateOption( { value: "gsuiToggle" } ),
						GSUcreateOption( { value: "gsuiTrack" } ),
						GSUcreateOption( { value: "gsuiWaveEditor" } ),
						GSUcreateOption( { value: "gsuiWavetable" } ),
						GSUcreateOption( { value: "gsuiWavetableGraph" } ),
						GSUcreateOption( { value: "gsuiWindows" } ),
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
