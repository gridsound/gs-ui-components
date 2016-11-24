// Creation of the whole demo's HTML
var k, tpl = Handlebars.templates,
	demoTpl = Handlebars.compile( document.querySelector( "#demo-tpl" ).innerHTML );

for ( k in tpl ) {
	Handlebars.registerPartial( k, tpl[ k ] );
}
document.querySelector( "#demo" ).innerHTML = demoTpl();

// gs-ui-toggle
var togglesWrapper = document.querySelector( "#toggles" ),
	toggles = togglesWrapper.querySelectorAll( ".gs-ui-toggle" ),
	toggleData = {
		onchange: function( b ) {
			lg( "onchange", b );
		}
	};

Array.from( toggles ).forEach( function( el, i, arr ) {
	gsUIComponents( el, toggleData );
	if ( i > 0 ) {
		el._groupWith( arr[ 0 ] );
	}
} );
toggles[ 0 ]._toggle( true );
