"use strict";

class gsuiEffect extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiEffect",
			$tagName: "gsui-effect",
			$jqueryfy: true,
			$elements: {
				$toggle: "gsui-toggle",
				$name: ".gsuiEffect-name",
				$help: "gsui-help-link",
				$expand: ".gsuiEffect-expand",
				$remove: ".gsuiEffect-remove",
				$content: ".gsuiEffect-content",
			},
		} );
		Object.seal( this );
		this.$elements.$remove.$on( "click", () => this.$this.$dispatch( GSEV_EFFECT_REMOVE ) );
		this.$elements.$expand.$on( "click", () => {
			this.$this.$togAttr( "expanded" );
			this.$this.$dispatch( GSEV_EFFECT_EXPAND );
		} );
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: () => {
				this.$this.$togAttr( "enable" );
				this.$this.$dispatch( GSEV_EFFECT_TOGGLE );
			},
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
				this.$elements.$toggle.$attr( "off", val !== "" );
				this.$elements.$content.$child( 0 ).$attr( "off", val !== "" );
				break;
			case "name":
				this.$elements.$name.$text( val );
				this.$elements.$help.$attr( "page", `mixer-effects-${ val }` );
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

GSUdomDefine( "gsui-effect", gsuiEffect );
