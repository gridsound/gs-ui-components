"use strict";

class gsuiComButton extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiComButton",
			$tagName: "gsui-com-button",
			$template: GSUcreateButton( { class: "gsuiComButton-btn" },
				GSUcreateSpan( { class: "gsuiComButton-text" } ),
			),
		} );
		Object.seal( this );
		gsuiRipple.$init( this.$element );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "text", "loading", "disabled", "type" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "disabled":
			case "loading": this.#updateDisabled(); break;
			case "text": this.$element.firstChild.textContent = val; break;
			case "type": this.$element.type = val === "submit" ? val : "button"; break;
		}
	}

	// .........................................................................
	#updateDisabled() {
		this.$element.disabled = GSUhasAttribute( this, "disabled" ) || GSUhasAttribute( this, "loading" );
	}
}

GSUdefineElement( "gsui-com-button", gsuiComButton );
