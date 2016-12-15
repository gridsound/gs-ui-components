// Creation of the whole demo's HTML
var k, tpl = Handlebars.templates,
	demoTpl = Handlebars.compile( document.querySelector( "#demo-tpl" ).innerHTML );

for ( k in tpl ) {
	Handlebars.registerPartial( k, tpl[ k ] );
}
document.querySelector( "#demo" ).innerHTML = demoTpl();

// gs-ui-toggle
var toggles = [],
	elToggles = Array.from( document.querySelectorAll( ".gs-ui-toggle" ) ),
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


// gs-ui-span-editable
var span = document.querySelector( ".gs-ui-span-editable" ),
	spanEditable = new gsuiSpanEditable( span, {
		onchange: function( val ) {
			lg( "onchange", val );
		}
	} );

spanEditable.setPlaceholder( "Placeholder..." );
