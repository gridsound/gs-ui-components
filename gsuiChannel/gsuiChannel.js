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
			GSUdomDispatch( this, GSEV_CHANNEL_SELECTCHANNEL );
		};
		this.$elements.$effects.onclick = e => {
			if ( e.target.dataset.id ) {
				GSUdomDispatch( this, GSEV_CHANNEL_SELECTCHANNEL );
				GSUdomDispatch( this, GSEV_CHANNEL_SELECTEFFECT, e.target.dataset.id );
			}
		};
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: ( d, b ) => {
				GSUdomSetAttr( this, "muted", !b );
				GSUdomDispatch( this, GSEV_CHANNEL_TOGGLE, b );
			},
			[ GSEV_TOGGLE_TOGGLESOLO ]: () => {
				GSUdomRmAttr( this, "muted" );
				GSUdomDispatch( this, GSEV_CHANNEL_TOGGLESOLO );
			},
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => GSUdomDispatch( this, GSEV_CHANNEL_LIVECHANGE, d.$target.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => GSUdomDispatch( this, GSEV_CHANNEL_CHANGE, d.$target.dataset.prop, val ),
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
