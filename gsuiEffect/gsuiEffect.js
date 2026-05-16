"use strict";

class gsuiEffect extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-effect",
			$elements: {
				$toggle: "gsui-toggle",
				$name: ".gsuiEffect-name",
				$help: "gsui-help-link",
				$expand: ".gsuiEffect-expand",
				$remove: ".gsuiEffect-remove",
				$content: ".gsuiEffect-content",
			},
		} );
		this.$this.$listen( {
			[ GSEV_TOGGLE_TOGGLE ]: () => {
				this.$this.$togAttr( "enable" );
				this.$this.$dispatch( GSEV_EFFECT_TOGGLE );
			},
		} );
		this.$elements.$remove.$onclick( () => this.$this.$dispatch( GSEV_EFFECT_REMOVE ) );
		this.$elements.$expand.$onclick( () => {
			this.$this.$togAttr( "expanded" );
			this.$this.$dispatch( GSEV_EFFECT_EXPAND );
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "order", "enable", "name" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "order":
				this.$this.$css( "order", val );
				break;
			case "enable":
				this.$elements.$toggle
					.$setAttr( "off", val !== "" )
					.$setAttr( "data-tooltip", val !== "" ? GSTX.$effect_unmute : GSTX.$effect_mute );
				this.$elements.$content.$child( 0 ).$setAttr( "off", val !== "" );
				break;
			case "name":
				this.$elements.$name.$text( val );
				this.$elements.$help.$setAttr( "page", `mixer-effects-${ val.toLowerCase() }` );
				break;
		}
	}

	// .........................................................................
	$setFxElement( elFx ) {
		this.$elements.$content.$append( elFx );
	}
	$getFxElement() {
		return this.$elements.$content.$child( 0 );
	}
}

$.$define( "gsui-effect", gsuiEffect );
