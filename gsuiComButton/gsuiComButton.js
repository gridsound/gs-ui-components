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
				$btn: "button",
				$text: "span",
				$icon: ".gsuiIcon",
			},
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
		return [ "text", "icon", "loading", "disabled", "type", "href" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "disabled":
			case "loading": this.#updateDisabled(); break;
			case "text": this.$elements.$text.textContent = val; break;
			case "type": this.$element.type = val === "submit" ? val : "button"; break;
			case "href": this.#href = val; break;
			case "icon": GSUdomSetAttr( this.$elements.$icon, "data-icon", val ); break;
		}
	}

	// .........................................................................
	#updateDisabled() {
		this.$element.disabled = GSUdomHasAttr( this, "disabled" ) || GSUdomHasAttr( this, "loading" );
	}
}

GSUdomDefine( "gsui-com-button", gsuiComButton );
