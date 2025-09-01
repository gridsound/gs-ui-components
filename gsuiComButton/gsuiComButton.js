"use strict";

class gsuiComButton extends gsui0ne {
	#href = null;

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
		this.$element.addEventListener( "click", () => {
			if ( GSUdomHasAttr( this, "href" ) ) {
				window.location = this.#href;
			}
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "text", "loading", "disabled", "type", "href" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "disabled":
			case "loading": this.#updateDisabled(); break;
			case "text": this.$element.firstChild.textContent = val; break;
			case "type": this.$element.type = val === "submit" ? val : "button"; break;
			case "href": this.#href = val; break;
		}
	}

	// .........................................................................
	#updateDisabled() {
		this.$element.disabled = GSUdomHasAttr( this, "disabled" ) || GSUdomHasAttr( this, "loading" );
	}
}

GSUdomDefine( "gsui-com-button", gsuiComButton );
