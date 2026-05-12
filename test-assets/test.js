"use strict";

const TESTcmpList = Object.freeze( [
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

$body.$setAttr( "data-skin", localStorage.getItem( "skin" ) || "gray" );

function TESTinit() {
	document.addEventListener( "gsui", ( { detail: d } ) => console.warn( `gsui event: "${ d.$event }"`, d.$args, d.$target ) );

	$body.$append(
		$.$div( { id: "testBody" },
			$.$flex( { y: true, xcenter: true, g6: true },
				$.$flex( { x: true, xcenter: true, g10: true },
					$.$select( { id: "testSelect" },
						$.$option( { value: "" }, "--" ),
					),
					$.$button( { id: "testSkin", icon: "adjust" } ),
				),
			),
			$.$div( { id: "testContent" },
				$.$div( { id: "testWrap" } ),
				$.$div( { id: "testCtrls" } ),
			),
		),
		$.$div( { id: "testFoot" },
			$.$div( { id: "testCopyright" },
				$.$span( null, `© ${ new Date().getFullYear() } ` ),
				$.$link( { href: "https://gridsound.com" }, "gridsound.com" ),
				$.$span( null, " all rights reserved" ),
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

	$( "#testSkin" ).$onclick( () => {
		const skin = $body.$getAttr( "data-skin" ) === "white"
			? "gray"
			: "white";

		localStorage.setItem( "skin", skin );
		$body.$setAttr( "data-skin", skin );
	} );

	document.title = `${ curr } (dev)`;
	$( "#testSelect" )
		.$append( ...TESTcmpList.map( s => $.$option( { value: s } ) ) )
		.$onchange( e => {
			const path = getPath();

			path.pop();
			path.push( e.target.value );
			location.href = `${ location.origin }/${ path.join( "/" ) }`;
		} )
		.$value( curr );
}

const locationLast = location.pathname.split( "/" ).filter( Boolean ).at( -1 );

if ( locationLast !== "gs-ui-components" && locationLast !== "gsds.html" ) {
	TESTinit();
}
