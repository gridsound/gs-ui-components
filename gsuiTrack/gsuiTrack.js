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
		this.$elements.$inpNameWrap.ondblclick = this.#ondblclickName.bind( this );
		this.$elements.$inpName.onblur = this.#onblur.bind( this );
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: ( _, b ) => {
				GSUdomSetAttr( this, "mute", !b );
				this.$this.$dispatch( GSEV_TRACK_TOGGLE, b );
			},
			[ GSEV_TOGGLE_TOGGLESOLO ]: () => {
				GSUdomRmAttr( this, "mute" );
				this.$this.$dispatch( GSEV_TRACK_TOGGLESOLO );
			},
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
				this.$elements.$inpName.value = val;
				break;
			case "order":
				this.$elements.$inpName.placeholder = `track ${ +val + 1 }`;
				break;
		}
	}

	// .........................................................................
	#ondblclickName() {
		this.$elements.$inpName.disabled = false;
		this.$elements.$inpName.select();
		GSUdomFocus( this.$elements.$inpName );
	}
	#onkeydown( e ) {
		if ( e.target === this.$elements.$inpName ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": this.$elements.$inpName.value = GSUdomGetAttr( this, "name" );
				case "Enter": this.$elements.$inpName.blur();
			}
		}
	}
	#onchange() {
		const n = this.$elements.$inpName.value.trim();

		this.$elements.$inpName.disabled = true;
		GSUdomSetAttr( this, "name", n );
		this.$this.$dispatch( GSEV_TRACK_RENAME, n );
	}
	#onblur() {
		this.$elements.$inpName.disabled = true;
	}
}

GSUdomDefine( "gsui-track", gsuiTrack );
