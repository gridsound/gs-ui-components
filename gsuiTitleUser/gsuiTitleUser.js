"use strict";

class gsuiTitleUser extends gsui0ne {
	#justSavedTimeout = null;

	constructor() {
		super( {
			$cmpName: "gsuiTitleUser",
			$tagName: "gsui-titleuser",
			$elements: {
				$name: ".gsuiTitleUser-name",
				$userLink: ".gsuiTitleUser-user",
				$username: ".gsuiTitleUser-username",
				$avatar: ".gsuiTitleUser-avatar",
				$cmpEditBtn: ".gsuiTitleUser-rename",
				$cmpEditInp: ".gsuiTitleUser-rename-inp",
				$cmpName: ".gsuiTitleUser-cmpName",
				$cmpDur: ".gsuiTitleUser-cmpDur",
				$login: ".gsuiTitleUser-login",
				$logout: ".gsuiTitleUser-logout",
				$save: ".gsuiTitleUser-save",
			},
			$attributes: {
				saved: true,
				cmpdur: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$login.onclick = () => this.$dispatch( "login" );
		this.$elements.$logout.onclick = () => this.$dispatch( "logout" );
		this.$elements.$save.onclick = () => this.$dispatch( "save" );
		this.$elements.$cmpEditBtn.onclick = () => GSUsetAttribute( this, "renaming", true );
		this.$elements.$cmpEditInp.onblur = e => GSUhasAttribute( this, "renaming" ) && this.#onkeydownRename( "Enter" );
		this.$elements.$cmpEditInp.onkeydown = e => this.#onkeydownRename( e.key );
	}

	#onkeydownRename( key ) {
		switch ( key ) {
			case "Enter":
				if ( this.$elements.$cmpEditInp.value !== GSUgetAttribute( this, "cmpname" ) ) {
					this.$dispatch( "rename", GSUtrim2( this.$elements.$cmpEditInp.value ) );
				}
			case "Escape": GSUsetAttribute( this, "renaming", false );
		}
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "name", "username", "avatar", "cmpname", "cmpdur", "just-saved", "saved", "saving", "connecting", "disconnecting", "renaming" ];
		// "connected"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "name": this.$elements.$name.textContent = val; break;
			case "avatar": this.$elements.$avatar.style.backgroundImage = `url(${ val })`; break;
			case "username": {
				this.$elements.$username.textContent = val;
				GSUsetAttribute( this.$elements.$userLink, "href", `//gridsound.com/#/u/${ val }` );
			} break;
			case "cmpdur": {
				const dur = GSUsplitSeconds( +val );

				this.$elements.$cmpDur.textContent = `${ dur.m }:${ dur.s }`;
			} break;
			case "saved":
			case "cmpname": this.#updateCmpName(); break;
			case "saving": GSUsetAttribute( this.$elements.$save, "data-spin", val === "" ? "on" : false ); break;
			case "connecting": GSUsetAttribute( this.$elements.$login, "data-spin", val === "" ? "on" : false ); break;
			case "disconnecting": GSUsetAttribute( this.$elements.$logout, "data-spin", val === "" ? "on" : false ); break;
			case "just-saved":
				if ( val === "" ) {
					clearTimeout( this.#justSavedTimeout );
					this.#justSavedTimeout = setTimeout( () => GSUsetAttribute( this, "just-saved", false ), 2500 );
				}
				break;
			case "renaming":
				if ( val === "" ) {
					this.$elements.$cmpEditInp.value = GSUgetAttribute( this, "cmpname" );
					this.$elements.$cmpEditInp.focus();
				}
				break;
		}
	}

	// .........................................................................
	#updateCmpName() {
		const name = GSUgetAttribute( this, "cmpname" );
		const title = name || "GridSound";

		this.$elements.$cmpName.textContent = name;
		document.title = GSUhasAttribute( this, "saved" ) ? title : `*${ title }`;
	}
}

GSUdefineElement( "gsui-titleuser", gsuiTitleUser );
