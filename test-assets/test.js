"use strict";

function lg( a, ...rest ) { return console.log( a, ...rest ), a; }

const TESTcmpList = Object.freeze( [
	"gsuiActionMenu",
	"gsuiAnalyserHist",
	"gsuiAnalyserHz",
	"gsuiAnalyserTd",
	"gsuiAnalyserVu",
	"gsuiBeatlines",
	"gsuiChannel",
	"gsuiClock",
	"gsuiComAvatar",
	"gsuiComButton",
	"gsuiComPlayer",
	"gsuiComProfile",
	"gsuiComUserLink",
	"gsuiDAW",
	"gsuiDotline",
	"gsuiDropdown",
	"gsuiDrumrows",
	"gsuiDrums",
	"gsuiEnvelope",
	"gsuiFxDelay",
	"gsuiFxFilter",
	"gsuiFxReverb",
	"gsuiFxWaveShaper",
	"gsuiGlitchText",
	"gsuiJoystick",
	"gsuiKeys",
	"gsuiLFO",
	"gsuiLibraries",
	"gsuiLibrary",
	"gsuiMixer",
	"gsuiNoise",
	"gsuiOscillator",
	"gsuiPanels",
	"gsuiPianoroll",
	"gsuiPopup",
	"gsuiPropSelect",
	"gsuiReorder",
	"gsuiScrollShadow",
	"gsuiSlicer",
	"gsuiSlider",
	"gsuiSliderGroup",
	"gsuiStepSelect",
	"gsuiSVGPatterns",
	"gsuiSynthesizer",
	"gsuiTempo",
	"gsuiTimeline",
	"gsuiTimewindow",
	"gsuiTitleUser",
	"gsuiToggle",
	"gsuiTrack",
	"gsuiWaveEditor",
	"gsuiWavetable",
	"gsuiWavetableGraph",
	"gsuiWindows",
] );

function TESTinit() {
	document.addEventListener( "gsui", ( { detail: d } ) => console.warn( `gsui event: "${ d.$event }"`, d.$args, d.$target ) );

	GSUdomBody.append(
		GSUcreateDiv( { id: "testBody" },
			GSUcreateFlex( { y: true, xcenter: true, g6: true },
				GSUcreateFlex( { x: true, xcenter: true, g10: true },
					GSUcreateSelect( { id: "testSelect" },
						GSUcreateOption( { value: "" }, "--" ),
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
				GSUcreateSpan( null, `© ${ new Date().getFullYear() } ` ),
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

	GSUdomBody.dataset.skin = localStorage.getItem( "skin" ) || "gray";
	elSkin.onclick = () => {
		const skin = GSUdomBody.dataset.skin === "white"
			? "gray"
			: "white";

		localStorage.setItem( "skin", skin );
		GSUdomBody.dataset.skin = skin;
	};

	document.title = `${ curr } (dev)`;
	select.append( ...TESTcmpList.map( s => GSUcreateOption( { value: s } ) ) );
	select.onchange = e => {
		const path = getPath();

		path.pop();
		path.push( e.target.value );
		location.href = `${ location.origin }/${ path.join( "/" ) }`;
	};
	select.value = curr;
}

if ( !GSUdomQS( "#testLinks" ) ) {
	TESTinit();
}
