"use strict";

function lg( a ) { return console.log.apply( console, arguments ), a; }

(() => {

	document.addEventListener( "gsuiEvents", e => {
		const { component, eventName, args } = e.detail;

		console.warn( `gsuiEvent: [${ component }][${ eventName }]`, args );
	} );

	document.body.append(
		GSUI.createElem( "div", { id: "testBody" },
			GSUI.createElem( "div", { id: "testHead" },
				GSUI.createElem( "span", { id: "testTitle" }, "GSUI components testing" ),
				GSUI.createElem( "select", { id: "testSelect" },
					GSUI.createElem( "option", { value: "" }, "--" ),
					GSUI.createElem( "option", { value: "gsuiDAW" }, "gsuiDAW" ),
					GSUI.createElem( "option", { value: "gsuiChannel" }, "gsuiChannel" ),
					GSUI.createElem( "option", { value: "gsuiClock" }, "gsuiClock" ),
					GSUI.createElem( "option", { value: "gsuiEnvelope" }, "gsuiEnvelope" ),
					GSUI.createElem( "option", { value: "gsuiKeys" }, "gsuiKeys" ),
					GSUI.createElem( "option", { value: "gsuiLFO" }, "gsuiLFO" ),
					GSUI.createElem( "option", { value: "gsuiOscillator" }, "gsuiOscillator" ),
					GSUI.createElem( "option", { value: "gsuiSlicer" }, "gsuiSlicer" ),
					GSUI.createElem( "option", { value: "gsuiSliderGroup" }, "gsuiSliderGroup" ),
					GSUI.createElem( "option", { value: "gsuiSynthesizer" }, "gsuiSynthesizer" ),
					GSUI.createElem( "option", { value: "gsuiTimeline" }, "gsuiTimeline" ),
					GSUI.createElem( "option", { value: "gsuiTimewindow" }, "gsuiTimewindow" ),
				),
			),
			GSUI.createElem( "div", { id: "testContent" },
				GSUI.createElem( "div", { id: "testWrap" } ),
				GSUI.createElem( "div", { id: "testCtrls" } ),
			),
			GSUI.createElem( "div", { id: "testDeps" } ),
		),
		GSUI.createElem( "div", { id: "testFoot" },
			GSUI.createElem( "div", { id: "testCopyright" },
				GSUI.createElem( "span", null, "© 2022 " ),
				GSUI.createElem( "a", { href: "https://gridsound.com" }, "gridsound.com" ),
				GSUI.createElem( "span", null, " all rights reserved" ),
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
