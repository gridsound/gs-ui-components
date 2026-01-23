"use strict";

class gsuiChannel extends gsui0ne {
	$analyser = null;

	constructor() {
		super( {
			$cmpName: "gsuiChannel",
			$tagName: "gsui-channel",
			$jqueryfy: true,
			$elements: {
				$toggle: "gsui-toggle",
				$nameWrap: ".gsuiChannel-nameWrap",
				$name: ".gsuiChannel-name",
				$rename: ".gsuiChannel-rename",
				$remove: ".gsuiChannel-delete",
				$connect: ".gsuiChannel-connect",
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
		this.$analyser = this.$elements.$analyser.$get( 0 );
		GSUjq( [
			this.$analyser,
			this.$elements.$nameWrap,
		] ).$on( "click", () => this.$this.$dispatch( GSEV_CHANNEL_SELECTCHANNEL ) );
		this.$elements.$remove.$on( "click", () => this.$this.$dispatch( GSEV_CHANNEL_REMOVE ) );
		this.$elements.$connect.$on( "click", () => this.$this.$dispatch( GSEV_CHANNEL_CONNECT ) );
		this.$elements.$effects.$on( "click", e => {
			if ( e.target.dataset.id ) {
				this.$this
					.$dispatch( GSEV_CHANNEL_SELECTCHANNEL )
					.$dispatch( GSEV_CHANNEL_SELECTEFFECT, e.target.dataset.id );
			}
		} );
		this.$elements.$rename.$on( "click", () => {
			GSUpopup.$prompt( "Rename channel", "", this.$this.$getAttr( "name" ) )
				.then( name => this.$this.$dispatch( GSEV_CHANNEL_RENAME, name ) );
		} );
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: ( d, b ) => {
				this.$this.$attr( "muted", !b ).$dispatch( GSEV_CHANNEL_TOGGLE, b );
			},
			[ GSEV_TOGGLE_TOGGLESOLO ]: () => {
				this.$this.$rmAttr( "muted" ).$dispatch( GSEV_CHANNEL_TOGGLESOLO );
			},
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.$this.$dispatch( GSEV_CHANNEL_LIVECHANGE, d.$target.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.$this.$dispatch( GSEV_CHANNEL_CHANGE, d.$target.dataset.prop, val ),
		} );
	}

	// .........................................................................
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
				this.$elements.$toggle.$attr( "off", val !== null );
				break;
			case "pan":
			case "gain":
				this.$elements[ prop ].$attr( "value", val );
				break;
			case "connecta":
			case "connectb":
				this.$elements[ prop ].$attr( "data-icon", val ? `caret-${ val }` : "" );
				break;
		}
	}

	// .........................................................................
	$addEffect( id, obj ) {
		this.$elements.$effects.$append( GSUgetTemplate( "gsui-channel-effect", id, obj.type ) );
	}
	$removeEffect( id ) {
		this.#getEffect( id ).$remove();
	}
	$updateEffect( id, obj ) {
		if ( "order" in obj ) {
			this.#getEffect( id ).$css( "order", obj.order );
		}
		if ( "toggle" in obj ) {
			this.#getEffect( id ).$attr( "data-enable", obj.toggle );
		}
	}
	#getEffect( id ) {
		return this.$elements.$effects.$find( `[data-id="${ id }"]` );
	}
}

GSUdomDefine( "gsui-channel", gsuiChannel );
