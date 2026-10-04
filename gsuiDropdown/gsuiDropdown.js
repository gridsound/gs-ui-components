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
				$.$div( null,
					$.$bold(),
					$.$span(),
				),
			),
			$elements: {
				$name: "b",
				$desc: "span",
				$icon: "gsui-icon",
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "value", "icon", "name", "desc" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "value": this.$element.$dataProp( val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "desc": this.$elements.$desc.$text( val ); break;
			case "icon": this.$elements.$icon.$setAttr( "icon", val ); break;
		}
	}
}

$.$define( "gsui-dropdown-option", gsuiDropdownOption );
