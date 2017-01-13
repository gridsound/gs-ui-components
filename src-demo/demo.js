// Globales here :
var g_wabuf,
	g_analyserData,
	g_wactx = new AudioContext(),
	g_wabufsrc = g_wactx.createBufferSource(),
	g_analyserNode = g_wactx.createAnalyser();
	g_gainNode = g_wactx.createGain();

g_gainNode.connect( g_wactx.destination );
g_analyserNode.connect( g_gainNode );
g_wabufsrc.connect( g_analyserNode );
g_gainNode.gain.value = 0;
g_analyserNode.fftSize = 256;
g_wabufsrc.loop = true;
g_analyserData = new Uint8Array( g_analyserNode.frequencyBinCount );

fetch( "src-demo/120bpm-4s.wav" )
	.then( function( res ) {
		res.arrayBuffer().then( function( arraybuf ) {
			g_wactx.decodeAudioData( arraybuf, function( wabuf ) {
				g_wabufsrc.buffer =
				g_wabuf = wabuf;
				g_wabufsrc.start();
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
	var elem = document.querySelector( ".gsuiSpanEditable" );

	window.uiSpanEditable = new gsuiSpanEditable( elem, {
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
		rect = elem.getBoundingClientRect();

	window.uiWave = new gsuiWaveform( elem );
	uiWave.setResolution( rect.width, rect.height );
	requestAnimationFrame( frame );

	function frame() {
		g_wabuf && drawZoom( g_wabuf, ( 1 + Math.sin( n += .005 ) ) / 2 );
		requestAnimationFrame( frame );
	}
	function drawZoom( wabuf, zoom ) {
		var dur = wabuf.duration,
			dur2 = dur / 2,
			data0 = wabuf.getChannelData( 0 ),
			data1 = wabuf.numberOfChannels < 2 ? data0 : wabuf.getChannelData( 1 );

		uiWave.draw( data0, data1, dur,
			dur2 - dur2 * zoom,
			dur * zoom );
	}
} )();


// gsuiOscilloscope
// ------------------------------------------------------------------
( function() {
	var elem = document.querySelector( ".gsuiOscilloscope" ),
		rect = elem.getBoundingClientRect();

	window.uiOsc = new gsuiOscilloscope( elem );
	uiOsc.setResolution( rect.width, rect.height );
	uiOsc.setPinch( 1 );
	uiOsc.dataFunction( function() {
		g_analyserNode.getByteTimeDomainData( g_analyserData );
		return g_analyserData;
	} );
	uiOsc.startAnimation();

	// We overload the draw with :
	uiOsc.drawBegin( function( ctx, max, w, h ) {
		ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = "rgba(" +
			Math.round( 255 - max * 128 ) + "," +
			Math.round( max * 64 ) + "," +
			Math.round( max * 255 ) + "," +
			( .95 - .25 * ( 1 - Math.cos( max * Math.PI / 4 ) ) ) +
		")";
		ctx.fillRect( 0, 0, w, h );
		ctx.globalCompositeOperation = "source-over";
	} );
	uiOsc.drawEnd( function( ctx, max ) {
		ctx.lineJoin = "round";
		ctx.lineWidth = 1 + Math.round( 2 * max );
		ctx.strokeStyle = "rgba(255,255,255," + Math.min( .4 + .6 * max, 1 ) + ")";
	} );
} )();

// gsuiPopup
// ------------------------------------------------------------------
( function() {
	var elem = document.querySelector( ".gsuiPopup" ),
		btns = document.querySelectorAll( "#gsuiPopup-wrapper button" );

	window.uiPopup = new gsuiPopup( elem );
	Array.from( btns ).forEach( function( btn ) {
		btn.onclick = function() {
			eval( "uiPopup" + this.textContent );
		};
	} );
} )();
