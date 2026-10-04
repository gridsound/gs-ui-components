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

		if ( act ) {
			this.$this.$dispatch( GSEV_DROPDOWN_CLICK, act );
			if ( this.$this.$hasAttr( "clicknclose" ) ) {
				this.$this.$togglePopover( false );
			}
		}
	}
}

$.$define( "gsui-dropdown", gsuiDropdown );

// .............................................................................
class gsuiDropdownOption extends gsui0ne {
	#radio = $noop;

	constructor() {
		super( {
			$tagName: "gsui-dropdown-option",
			$template: $.$label( null,
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
		return [ "value", "icon", "name", "desc", "radio" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "value": this.#setValue( val ); break;
			case "radio": this.#setRadio( val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "desc": this.$elements.$desc.$text( val ); break;
			case "icon": this.$elements.$icon.$setAttr( "icon", val ); break;
		}
	}

	// .........................................................................
	#setValue( val ) {
		this.$element.$dataProp( val );
		this.#radio.$setAttr( "value", val );
	}
	#setRadio( name ) {
		if ( !name ) {
			this.#radio.$remove();
			this.#radio = $noop;
		} else if ( this.#radio.$size() ) {
			this.#radio.$setAttr( "name", name );
		} else {
			this.#radio = $( "<input>" )
				.$setAttr( { type: "radio", name, value: this.$this.$getAttr( "value" ) } )
				.$prependTo( this.$element );
		}
	}
}

$.$define( "gsui-dropdown-option", gsuiDropdownOption );
