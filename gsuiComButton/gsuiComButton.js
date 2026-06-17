"use strict";

class gsuiComButton extends gsui0ne {
	#href = null;

	constructor() {
		super( {
			$tagName: "gsui-com-button",
			$template: $.$button( null,
				$.$div( { inert: true },
					$.$span(),
					$.$icon(),
				),
			),
			$elements: {
				$text: "span",
				$icon: "gsui-icon",
			},
		} );
		gsuiRipple.$init( this.$element, this.$elements.$text.$parent() );
		this.$this.$addEventListener( "click", this.#onclick.bind( this ) );
		this.$element.$on( "contextmenu", e => e.preventDefault() );
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
			case "icon": this.$elements.$icon.$setAttr( "icon", val ); break;
		}
	}

	// .........................................................................
	#updateDisabled() {
		this.$element.$disabled(
			this.$this.$hasAttr( "disabled" ) ||
			this.$this.$hasAttr( "loading" ) );
	}
	#onclick( e ) {
		const tar = $( e.target );

		if ( tar.$tag() === "button" ) {
			e.stopImmediatePropagation();
			this.$this.$click();
		} else {
			const [ dl, hr ] = this.$this.$getAttr( "download", "href" );

			if ( dl ) {
				e.preventDefault();
				GSUdownloadURL( dl, hr );
			} else if ( hr ) {
				window.location = this.#href;
			}
		}
	}
}

$.$define( "gsui-com-button", gsuiComButton );
