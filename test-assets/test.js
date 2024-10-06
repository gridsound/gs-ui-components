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
					GSUcreateOption( { value: "gsuiCmpPlayer" } ),
					GSUcreateOption( { value: "" }, "--" ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiDAW" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiWindows" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiPanels" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiClock" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiTempo" } ),
					GSUcreateOption( { value: "gsuiLibraries" } ),
					GSUcreateOption( { value: "gsuiLibrary" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiMixer" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiChannel" } ),
					GSUcreateOption( { value: "gsuiFxDelay" } ),
					GSUcreateOption( { value: "gsuiFxFilter" } ),
					GSUcreateOption( { value: "gsuiFxWaveShaper" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserHz" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserTd" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserVu" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiAnalyserHist" } ),
					GSUcreateOption( { value: "gsuiTimewindow" } ),
					GSUcreateOption( { value: "gsuiTimeline" } ),
					GSUcreateOption( { value: "gsuiBeatlines" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiPianoroll" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiKeys" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiSliderGroup" } ),
					GSUcreateOption( { value: "gsuiDrums" } ),
					GSUcreateOption( { value: "gsuiDrumrows" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiSynthesizer" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiOscillator" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiEnvelope" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiLFO" } ),
					GSUcreateOption( { value: "gsuiTrack" } ),
					GSUcreateOption( { style: { backgroundColor: "#222" }, value: "gsuiSlicer" } ),
					GSUcreateOption( { value: "gsuiDotline" } ),
					GSUcreateOption( { value: "gsuiScrollShadow" } ),
					GSUcreateOption( { value: "gsuiSlider" } ),
					GSUcreateOption( { value: "gsuiSVGPatterns" } ),
					GSUcreateOption( { value: "gsuiToggle" } ),
					GSUcreateOption( { value: "gsuiActionMenu" } ),
				),
				GSUcreateButton( { id: "testSkin", class: "gsuiIcon", "data-icon": "adjust" } ),
			),
			GSUcreateDiv( { id: "testContent" },
				GSUcreateDiv( { id: "testWrap" } ),
				GSUcreateDiv( { id: "testCtrls" } ),
			),
		),
		GSUcreateDiv( { id: "testFoot" },
			GSUcreateDiv( { id: "testCopyright" },
				GSUcreateSpan( null, "© 2024 " ),
				GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
				GSUcreateSpan( null, " all rights reserved" ),
			),
		),
	);

	const elTEST = document.querySelector( "#TEST" );
	const elCTRLS = document.querySelector( "#TEST-CTRLS" );
	const elSkin = document.querySelector( "#testSkin" );
	const elWrap = document.querySelector( "#testWrap" );
	const elCtrls = document.querySelector( "#testCtrls" );
	elTEST && Array.from( elTEST.children ).forEach( el => elWrap.append( el ) );
	elCTRLS && Array.from( elCTRLS.children ).forEach( el => elCtrls.append( el ) );

	function getPath() {
		return location.pathname.split( "/" ).filter( Boolean );
	}

	const select = document.querySelector( "#testSelect" );
	const path = getPath();
	const curr = path.pop();

	const hasLightSkin = Array.from( document.head.querySelectorAll( "link" ) ).some( ln => ln.href.endsWith( "gsuiSkins-light.css" ) );

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
	setCtrlsHeight();
	setTimeout( setCtrlsHeight, 100 );

	function setCtrlsHeight() {
		const h = `${ elCtrls.scrollHeight }px`;

		elCtrls.style.maxHeight = h;
		GSUsetStyle( document.body, "--test-ctrls-h", h );
	}

	GSUsetStyle( document.body, {
		"--test-content-minw": getComputedStyle( elWrap.firstChild ).minWidth,
		"--test-content-minh": getComputedStyle( elWrap.firstChild ).minHeight,
	} );
	document.title = `${ curr } (dev)`;
	select.value = curr;
	select.onchange = e => {
		const path = getPath();

		path.pop();
		path.push( e.target.value );
		location.href = `${ location.origin }/${ path.join( "/" ) }`;
	};
} )();
