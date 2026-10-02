"use strict";

class gsuiDropdown extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-dropdown",
			$attributes: { popover: true },
		} );
		this.$this.$onclick( this.#onclick.bind( this ) );
	}

	#onclick( e ) {
		const act = $.$dataProp( e.target );

		act && this.$this.$dispatch( GSEV_DROPDOWN_CLICK, act );
	}
}

$.$define( "gsui-dropdown", gsuiDropdown );

// .............................................................................
class gsuiDropdownOption extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-dropdown-option",
			$template: $.$button( null,
				$.$elem( "gsui-icon" ),
				$.$span(),
			),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "value", "icon", "text" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "value": this.$element.$dataProp( val ); break;
			case "icon": this.$this.$query( "gsui-icon" ).$setAttr( "icon", val ); break;
			case "text": this.$this.$query( "span" ).$text( val ); break;
		}
	}
}

$.$define( "gsui-dropdown-option", gsuiDropdownOption );
