// Globales here :
var g_wabuf,
	g_wactx = new AudioContext();

fetch( "src-demo/120bpm-4s.wav" )
	.then( function( res ) {
		res.arrayBuffer().then( function( arraybuf ) {
			g_wactx.decodeAudioData( arraybuf, function( wabuf ) {
				g_wabuf = wabuf;
			} );
		} );
	} );


// Creation of the whole demo's HTML
// ------------------------------------------------------------------
( function() {
	var k, tpl = Handlebars.templates,
		demoTpl = Handlebars.compile( document.querySelector( "#demo-tpl" ).innerHTML );

	for ( k in tpl ) {
		Handlebars.registerPartial( k, tpl[ k ] );
	}
	document.querySelector( "#demo" ).innerHTML = demoTpl();
} )();


// gsuiToggle
// ------------------------------------------------------------------
( function() {
	var toggles = [],
		elToggles = Array.from( document.querySelectorAll( ".gsuiToggle" ) ),
		togglesData = {
			onchange: function( b ) {
				lg( "onchange", b );
			}
		};

	elToggles.forEach( function( el, i ) {
		var toggle = new gsuiToggle( el, togglesData );

		toggles.push( toggle );
		if ( i > 0 ) {
			toggle.groupWith( toggles[ 0 ] );
		}
	} );
	toggles[ 0 ].toggle( true );
} )();


// gsuiSpanEditable
// ------------------------------------------------------------------
( function() {
	var elem = document.querySelector( ".gsuiSpanEditable" ),
		uiSpanEditable = new gsuiSpanEditable( elem, {
			onchange: function( val ) {
				lg( "gsuiSpanEditable, onchange", val );
			}
		} );

	uiSpanEditable.setPlaceholder( "Placeholder..." );
} )();


// gsuiWaveform
// ------------------------------------------------------------------
( function() {
	var n = Math.PI / 2,
		elem = document.querySelector( ".gsuiWaveform" ),
		rect = elem.getBoundingClientRect(),
		uiWaveform = new gsuiWaveform( elem );

	uiWaveform.setResolution( rect.width, rect.height );
	requestAnimationFrame( frame );

	function frame() {
		g_wabuf && drawZoom( g_wabuf, n += .005 );
		requestAnimationFrame( frame );
	}
	function drawZoom( wabuf, zoom ) {
		var sin = ( 1 + Math.sin( n ) ) / 2,
			dur = wabuf.duration,
			dur2 = dur / 2,
			data0 = wabuf.getChannelData( 0 ),
			data1 = wabuf.numberOfChannels < 2 ? data0 : wabuf.getChannelData( 1 );

		uiWaveform.draw( data0, data1, dur,
			dur2 - dur2 * sin,
			dur * sin );
	}
} )();
