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
		this.$elements.$btn.addEventListener( "click", this.#onclick.bind( this ) );
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
	#onclick( e ) {
		const dl = GSUdomGetAttr( this, "download" );
		const hr = GSUdomGetAttr( this, "href" );

		if ( dl ) {
			e.preventDefault();
			GSUdownloadURL( dl, hr );
		} else if ( hr ) {
			window.location = this.#href;
		}
	}
}

GSUdomDefine( "gsui-com-button", gsuiComButton );
