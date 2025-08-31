"use strict";

class gsuiEffect extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiEffect",
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
		Object.seal( this );
		this.$elements.$remove.onclick = () => GSUdomDispatch( this, "gsuiEffect-remove" );
		this.$elements.$expand.onclick = () => {
			GSUdomTogAttr( this, "expanded" );
			GSUdomDispatch( this, "gsuiEffect-expand" );
		};
		GSUdomListen( this, {
			"gsuiToggle-toggle": () => {
				GSUdomTogAttr( this, "enable" );
				GSUdomDispatch( this, "gsuiEffect-toggle" );
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
				this.style.order = val;
				break;
			case "enable":
				GSUdomSetAttr( this.$elements.$toggle, "off", val !== "" );
				GSUdomSetAttr( this.$elements.$content.firstChild, "off", val !== "" );
				break;
			case "name":
				this.$elements.$name.textContent = val;
				GSUdomSetAttr( this.$elements.$help, "page", `mixer-effects-${ val }` );
				break;
		}
	}

	// .........................................................................
	$setFxElement( elFx ) {
		this.$elements.$content.append( elFx );
	}
	$getFxElement() {
		return this.$elements.$content?.firstChild;
	}
}

GSUdefineElement( "gsui-effect", gsuiEffect );
