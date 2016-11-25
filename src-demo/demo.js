// Creation of the whole demo's HTML
var k, tpl = Handlebars.templates,
	demoTpl = Handlebars.compile( document.querySelector( "#demo-tpl" ).innerHTML );

for ( k in tpl ) {
	Handlebars.registerPartial( k, tpl[ k ] );
}
document.querySelector( "#demo" ).innerHTML = demoTpl();


// gs-ui-toggle
var toggles = Array.from( document.querySelectorAll( ".gs-ui-toggle" ) ),
	togglesData = {
		onchange: function( b ) {
			lg( "onchange", b );
		}
	};

toggles.forEach( function( el, i, arr ) {
	gsUIComponents( el, togglesData );
	if ( i > 0 ) {
		el._groupWith( arr[ 0 ] );
	}
} );
toggles[ 0 ]._toggle( true );


// gs-ui-span-editable
var spans = Array.from( document.querySelectorAll( ".gs-ui-span-editable" ) ),
	spansData = {
		onchange: function( val ) {
			lg( "onchange", val );
		}
	};

spans.forEach( function( el, i, arr ) {
	gsUIComponents( el, spansData );
	el._setPlaceholder( "Placeholder..." );
} );
