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
					GSUcreateOption( { value: "gsuiComAvatar" } ),
					GSUcreateOption( { value: "gsuiComButton" } ),
					GSUcreateOption( { value: "gsuiComProfile" } ),
					GSUcreateOption( { value: "gsuiComPlayer" } ),
					GSUcreateOption( { value: "gsuiComPlaylist" } ),
					GSUcreateOption( { value: "gsuiDropdown" } ),
					GSUcreateOption( { value: "" }, "--" ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiGlitchText" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiDAW" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiWindows" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiPopup" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiPanels" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiClock" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiTempo" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiTitleUser" } ),
					GSUcreateOption( { value: "gsuiLibraries" } ),
					GSUcreateOption( { value: "gsuiLibrary" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiMixer" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiChannel" } ),
					GSUcreateOption( { value: "gsuiFxDelay" } ),
					GSUcreateOption( { value: "gsuiFxFilter" } ),
					GSUcreateOption( { value: "gsuiFxReverb" } ),
					GSUcreateOption( { value: "gsuiFxWaveShaper" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserHz" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserTd" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserVu" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserHist" } ),
					GSUcreateOption( { value: "gsuiTimewindow" } ),
					GSUcreateOption( { value: "gsuiTimeline" } ),
					GSUcreateOption( { value: "gsuiBeatlines" } ),
					GSUcreateOption( { value: "gsuiStepSelect" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiPianoroll" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiKeys" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiSliderGroup" } ),
					GSUcreateOption( { value: "gsuiDrums" } ),
					GSUcreateOption( { value: "gsuiDrumrows" } ),
					GSUcreateOption( { value: "gsuiPropSelect" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiSynthesizer" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiNoise" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiOscillator" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiEnvelope" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiLFO" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiWavetable" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiWavetableGraph" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiWaveEditor" } ),
					GSUcreateOption( { value: "gsuiTrack" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiSlicer" } ),
					GSUcreateOption( { value: "gsuiDotline" } ),
					GSUcreateOption( { value: "gsuiScrollShadow" } ),
					GSUcreateOption( { value: "gsuiSlider" } ),
					GSUcreateOption( { value: "gsuiSVGPatterns" } ),
					GSUcreateOption( { value: "gsuiToggle" } ),
					GSUcreateOption( { value: "gsuiActionMenu" } ),
					GSUcreateOption( { value: "gsuiReorder" } ),
				),
				GSUcreateButton( { id: "testSkin", icon: "adjust" } ),
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

	const hasLightSkin = Array.from( GSUdomQSA( document.head, "link" ) ).some( ln => ln.href.endsWith( "gsuiSkins-light.css" ) );

	if ( !hasLightSkin ) {
		elSkin.remove();
	} else {
		document.body.dataset.skin = localStorage.getItem( "skin" ) || "";
		elSkin.onclick = () => {
			const skin = document.body.dataset.skin === "white"
				? ""
				: "white";

			localStorage.setItem( "skin", skin );
			document.body.dataset.skin = skin;
		};
	}

	document.title = `${ curr } (dev)`;
	select.value = curr;
	select.onchange = e => {
		const path = getPath();

		path.pop();
		path.push( e.target.value );
		location.href = `${ location.origin }/${ path.join( "/" ) }`;
	};
} )();
