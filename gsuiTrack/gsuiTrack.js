"use strict";

class gsuiTrack extends gsui0ne {
	rowElement = GSUgetTemplate( "gsui-track-row" );

	constructor() {
		super( {
			$cmpName: "gsuiTrack",
			$tagName: "gsui-track",
			$elements: {
				$inpNameWrap: ".gsuiTrack-nameWrap",
				$inpName: ".gsuiTrack-name",
			},
			$attributes: {
				name: "",
				order: 0,
			},
		} );
		Object.seal( this );
		this.onchange = this.#onchange.bind( this );
		this.onkeydown = this.#onkeydown.bind( this );
		this.$elements.$inpNameWrap.$on( "dblclick", this.#ondblclickName.bind( this ) );
		this.$elements.$inpName.$on( "blur", this.#onblur.bind( this ) );
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: ( _, b ) => { this.$this.$setAttr( "mute", !b ).$dispatch( GSEV_TRACK_TOGGLE, b ); },
			[ GSEV_TOGGLE_TOGGLESOLO ]: () => { this.$this.$rmAttr( "mute" ).$dispatch( GSEV_TRACK_TOGGLESOLO ); },
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "mute", "name", "order" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "mute":
				GSUdomSetAttr( this.rowElement, "data-mute", val !== null );
				GSUdomSetAttr( this.firstElementChild, "off", val !== null );
				break;
			case "name":
				this.$elements.$inpName.$value( val );
				break;
			case "order":
				this.$elements.$inpName.$setAttr( "placeholder", `track ${ +val + 1 }` );
				break;
		}
	}

	// .........................................................................
	#ondblclickName() {
		this.$elements.$inpName.$rmAttr( "disabled" ).$trigger( "select" );
		GSUdomFocus( this.$elements.$inpName.$get( 0 ) );
	}
	#onkeydown( e ) {
		if ( e.target === this.$elements.$inpName.$get( 0 ) ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": this.$elements.$inpName.$value( this.$this.$getAttr( "name" ) );
				case "Enter": this.$elements.$inpName.$trigger( "blur" );
			}
		}
	}
	#onchange() {
		const n = this.$elements.$inpName.$value().trim();

		this.$elements.$inpName.$addAttr( "disabled" );
		this.$this.$setAttr( "name", n ).$dispatch( GSEV_TRACK_RENAME, n );
	}
	#onblur() {
		this.$elements.$inpName.$addAttr( "disabled" );
	}
}

GSUdomDefine( "gsui-track", gsuiTrack );
