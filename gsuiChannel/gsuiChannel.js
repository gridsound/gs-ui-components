"use strict";

class gsuiChannel extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-channel",
			$elements: {
				$toggle: "gsui-toggle",
				$head: "[data-action=rename]",
				$name: "[data-action=rename] span",
				$effects: "gsui-channel-effects",
				pan: "gsui-channel-pan gsui-slider",
				gain: "gsui-channel-gain gsui-slider",
				connecta: "[data-action=connect] :nth-child(1)",
				connectb: "[data-action=connect] :nth-child(2)",
			},
			$attributes: {
				pan: 0,
				gain: 1,
				connecta: "down",
			},
		} );
		this.$this
			.$onclick( this.#onclick.bind( this ) )
			.$listen( {
				[ GSEV_TOGGLE_TOGGLE ]: ( d, b ) => {
					this.$this.$setAttr( "muted", !b ).$dispatch( GSEV_CHANNEL_TOGGLE, b );
				},
				[ GSEV_TOGGLE_TOGGLESOLO ]: () => {
					this.$this.$rmAttr( "muted" ).$dispatch( GSEV_CHANNEL_TOGGLESOLO );
				},
				[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
				[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
				[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.$this.$dispatch( GSEV_CHANNEL_LIVECHANGE, d.$target.$dataProp(), val ),
				[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.$this.$dispatch( GSEV_CHANNEL_CHANGE, d.$target.$dataProp(), val ),
			} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$this.$dataId() === "0"
			? this.$elements.$head.$rmAttr( "data-tooltip" )
			: this.$elements.$head.$on( "dblclick", () => {
				$popup.$prompt( "Rename channel", "", this.$this.$getAttr( "name" ) )
					.then( name => this.$this.$dispatch( GSEV_CHANNEL_RENAME, name ) );
			} );
	}
	static get observedAttributes() {
		return [ "order", "name", "muted", "pan", "gain", "connecta", "connectb" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "order":
				this.$this.$css( "order", val );
				break;
			case "name":
				this.$elements.$name.$text( val );
				break;
			case "muted":
				this.$elements.$toggle.$setAttr( {
					off: val !== null,
					"data-tooltip": val !== null
						? GSTX.$channel_unmute
						: GSTX.$channel_mute,
				} );
				break;
			case "pan":
			case "gain":
				this.$elements[ prop ].$setAttr( "value", val );
				break;
			case "connecta":
			case "connectb":
				this.$elements[ prop ].$setAttr( "icon", val ? `caret-${ val }` : "" );
				break;
		}
	}

	// .........................................................................
	$addEffect( id, obj ) {
		this.$elements.$effects.$append( $.$button( {
			"data-id": id,
			"data-action": "effect",
			"data-enable": true,
			"data-content": obj.type,
		} ) );
	}
	$removeEffect( id ) {
		this.#getEffect( id ).$remove();
	}
	$updateEffect( id, obj ) {
		if ( "order" in obj ) {
			this.#getEffect( id ).$css( "order", obj.order );
		}
		if ( "toggle" in obj ) {
			this.#getEffect( id ).$setAttr( "data-enable", obj.toggle );
		}
	}
	#getEffect( id ) {
		return this.$elements.$effects.$query( `[data-id="${ id }"]` );
	}

	// .........................................................................
	#onclick( e ) {
		const tar = $( e.target );

		switch ( tar.$getAttr( "data-action" ) ) {
			case "rename":
			case "select": this.$this.$dispatch( GSEV_CHANNEL_SELECTCHANNEL ); break;
			case "delete": this.$this.$dispatch( GSEV_CHANNEL_REMOVE ); break;
			case "connect": this.$this.$dispatch( GSEV_CHANNEL_CONNECT ); break;
			case "effect":
				this.$this
					.$dispatch( GSEV_CHANNEL_SELECTCHANNEL )
					.$dispatch( GSEV_CHANNEL_SELECTEFFECT, tar.$dataId() );
				break;
		}
	}
}

$.$define( "gsui-channel", gsuiChannel );
