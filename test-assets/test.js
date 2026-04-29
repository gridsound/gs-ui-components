"use strict";

const TESTcmpList = Object.freeze( [
	"gsuiActionMenu",
	"gsuiAnalyserHist",
	"gsuiAnalyserHz",
	"gsuiAnalyserTd",
	"gsuiAnalyserVu",
	"gsuiAutomation",
	"gsuiBeatlines",
	"gsuiChannel",
	"gsuiClock",
	"gsuiComAvatar",
	"gsuiComButton",
	"gsuiComPlayer",
	"gsuiComProfile",
	"gsuiComUserLink",
	"gsuiCursor",
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
	"gsuiIcon",
	"gsuiJoystick",
	"gsuiKeys",
	"gsuiLFO",
	"gsuiLibraries",
	"gsuiLibrary",
	"gsuiMixer",
	"gsuiNoise",
	"gsuiOscillator",
	"gsuiPanels",
	"gsuiPeriodicWave",
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
	"gsuiTimeCursors",
	"gsuiTimeline",
	"gsuiTimewindow",
	"gsuiTitleUser",
	"gsuiToggle",
	"gsuiTrack",
	"gsuiWaveEditor",
	"gsuiWaveletBrowser",
	"gsuiWavetable",
	"gsuiWavetableGraph",
	"gsuiWindows",
] );

function TESTinit() {
	document.addEventListener( "gsui", ( { detail: d } ) => console.warn( `gsui event: "${ d.$event }"`, d.$args, d.$target ) );

	$body.$append(
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

	const elTEST = $( "#TEST" );

	$( "#testWrap" ).$append( elTEST.$children() );
	$( "#testCtrls" ).$append( $( "#TEST-CTRLS" ).$children() );
	$( "#testContent" ).$setAttr( {
		"data-min-auto":   elTEST.$hasAttr( "data-min-auto"   ),
		"data-min-x-auto": elTEST.$hasAttr( "data-min-x-auto" ),
		"data-min-y-auto": elTEST.$hasAttr( "data-min-y-auto" ),
	} );
	elTEST.$remove();

	function getPath() {
		return location.pathname.split( "/" ).filter( Boolean );
	}

	const path = getPath();
	const curr = path.pop();

	$body.$setAttr( "data-skin", localStorage.getItem( "skin" ) || "gray" );
	$( "#testSkin" ).$onclick( () => {
		const skin = $body.$getAttr( "data-skin" ) === "white"
			? "gray"
			: "white";

		localStorage.setItem( "skin", skin );
		$body.$setAttr( "data-skin", skin );
	} );

	document.title = `${ curr } (dev)`;
	$( "#testSelect" )
		.$append( ...TESTcmpList.map( s => GSUcreateOption( { value: s } ) ) )
		.$onchange( e => {
			const path = getPath();

			path.pop();
			path.push( e.target.value );
			location.href = `${ location.origin }/${ path.join( "/" ) }`;
		} )
		.$value( curr );
}

if ( !$( "#testLinks" ).$size() ) {
	TESTinit();
}
