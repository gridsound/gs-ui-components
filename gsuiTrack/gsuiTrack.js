"use strict";

class gsuiTrack extends gsui0ne {
	rowElement = GSUgetTemplate( "gsui-track-row" );

	constructor() {
		super( {
			$cmpName: "gsuiTrack",
			$tagName: "gsui-track",
			$elements: {
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
		this.ondblclick = this.#ondblclick.bind( this );
		this.$elements.$inpName.onblur = this.#onblur.bind( this );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: d => {
					GSUsetAttribute( this, "mute", !d.args[ 0 ] );
					this.$dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: () => {
					GSUdomRmAttr( this, "mute" );
					this.$dispatch( "toggleSolo" );
				},
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
				this.rowElement.classList.toggle( "gsui-mute", val !== null );
				GSUsetAttribute( this.firstElementChild, "off", val !== null );
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
	#ondblclick( e ) {
		if ( e.target.classList.contains( "gsuiTrack-nameWrap" ) ) {
			this.$elements.$inpName.disabled = false;
			this.$elements.$inpName.select();
			this.$elements.$inpName.focus();
		}
	}
	#onkeydown( e ) {
		if ( e.target === this.$elements.$inpName ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": this.$elements.$inpName.value = GSUgetAttribute( this, "name" );
				case "Enter": this.$elements.$inpName.blur();
			}
		}
	}
	#onchange() {
		const n = this.$elements.$inpName.value.trim();

		this.$elements.$inpName.disabled = true;
		GSUsetAttribute( this, "name", n );
		this.$dispatch( "rename", n );
	}
	#onblur() {
		this.$elements.$inpName.disabled = true;
	}
}

GSUdefineElement( "gsui-track", gsuiTrack );
