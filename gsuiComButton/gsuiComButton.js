"use strict";

class gsuiComButton extends gsui0ne {
	#href = null;

	constructor() {
		super( {
			$cmpName: "gsuiComButton",
			$tagName: "gsui-com-button",
			$template: GSUcreateButton( null,
				GSUcreateSpan( { inert: true } ),
				GSUcreateIcon( { inert: true } ),
			),
			$elements: {
				$text: "span",
				$icon: ".gsuiIcon",
			},
		} );
		Object.seal( this );
		gsuiRipple.$init( this.$element.$get( 0 ) );
		this.$element.$on( "click", this.#onclick.bind( this ) );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "text", "icon", "loading", "disabled", "type", "href" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "disabled":
			case "loading": this.#updateDisabled(); break;
			case "text": this.$elements.$text.$text( val ); break;
			case "type": this.$element.$prop( "type", val === "submit" ? val : "button" ); break;
			case "href": this.#href = val; break;
			case "icon": this.$elements.$icon.$setAttr( "data-icon", val ); break;
		}
	}

	// .........................................................................
	#updateDisabled() {
		this.$element.$setAttr( "disabled",
			this.$this.$hasAttr( "disabled" ) ||
			this.$this.$hasAttr( "loading" ) );
	}
	#onclick( e ) {
		const [ dl, hr ] = this.$this.$getAttr( "download", "href" );

		if ( dl ) {
			e.preventDefault();
			GSUdownloadURL( dl, hr );
		} else if ( hr ) {
			window.location = this.#href;
		}
	}
}

GSUdomDefine( "gsui-com-button", gsuiComButton );
