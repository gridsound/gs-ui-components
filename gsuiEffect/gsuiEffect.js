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
			$attributes: {
				draggable: "true",
			},
		} );
		Object.seal( this );

		this.$elements.$expand.onclick = () => {
			GSUtoggleAttribute( this, "expanded" );
			this.$dispatch( "expand" );
		};
		this.$elements.$remove.onclick = () => this.$dispatch( "remove" );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: ( d, t ) => {
					GSUtoggleAttribute( this, "enable" );
					this.$dispatch( "toggle" );
				},
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
				GSUsetAttribute( this.$elements.$toggle, "off", val !== "" );
				GSUsetAttribute( this.$elements.$content.firstChild, "off", val !== "" );
				break;
			case "name":
				this.$elements.$name.textContent = val;
				GSUsetAttribute( this.$elements.$help, "page", `mixer-effects-${ val }` );
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
