"use strict";

class gsuiChannel extends gsui0ne {
	$analyser = null;

	constructor() {
		super( {
			$cmpName: "gsuiChannel",
			$tagName: "gsui-channel",
			$elements: {
				$toggle: "gsui-toggle",
				$nameWrap: ".gsuiChannel-nameWrap",
				$name: ".gsuiChannel-name",
				$analyser: "gsui-analyser-hist",
				$effects: ".gsuiChannel-effects",
				pan: ".gsuiChannel-pan gsui-slider",
				gain: ".gsuiChannel-gain gsui-slider",
				connecta: ".gsuiChannel-connectA",
				connectb: ".gsuiChannel-connectB",
			},
			$attributes: {
				name: "chan",
				pan: 0,
				gain: 1,
				connecta: "down",
			},
		} );
		Object.seal( this );

		this.$analyser = this.$elements.$analyser;
		this.$analyser.onclick =
		this.$elements.$nameWrap.onclick = () => {
			this.$dispatch( "selectChannel" );
		};
		this.$elements.$effects.onclick = e => {
			if ( e.target.dataset.id ) {
				this.$dispatch( "selectChannel" );
				this.$dispatch( "selectEffect", e.target.dataset.id );
			}
		};
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: d => {
					GSUdomSetAttr( this, "muted", !d.args[ 0 ] );
					this.$dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: () => {
					GSUdomRmAttr( this, "muted" );
					this.$dispatch( "toggleSolo" );
				},
			},
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, sli ) => {
					this.$dispatch( "liveChange", sli.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.$dispatch( "change", sli.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "order", "name", "muted", "pan", "gain", "connecta", "connectb" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "order":
				this.style.order = val;
				break;
			case "name":
				this.$elements.$name.textContent = val;
				break;
			case "muted":
				GSUdomSetAttr( this.$elements.$toggle, "off", val !== null );
				break;
			case "pan":
			case "gain":
				GSUdomSetAttr( this.$elements[ prop ], "value", val );
				break;
			case "connecta":
			case "connectb":
				this.$elements[ prop ].dataset.icon = val ? `caret-${ val }` : "";
				break;
		}
	}

	// .........................................................................
	$addEffect( id, obj ) {
		this.$elements.$effects.append( GSUgetTemplate( "gsui-channel-effect", id, obj.type ) );
	}
	$removeEffect( id ) {
		this.#getEffect( id ).remove();
	}
	$updateEffect( id, obj ) {
		if ( "order" in obj ) {
			this.#getEffect( id ).style.order = obj.order;
		}
		if ( "toggle" in obj ) {
			GSUdomSetAttr( this.#getEffect( id ), "data-enable", obj.toggle );
		}
	}
	#getEffect( id ) {
		return GSUdomQS( this.$elements.$effects, `[data-id="${ id }"]` );
	}
}

GSUdefineElement( "gsui-channel", gsuiChannel );
