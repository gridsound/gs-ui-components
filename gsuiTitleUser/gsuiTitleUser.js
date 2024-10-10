"use strict";

class gsuiTitleUser extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiTitleUser",
			$tagName: "gsui-titleuser",
			$elements: {
				$name: ".gsuiTitleUser-name",
				$userLink: ".gsuiTitleUser-user",
				$username: ".gsuiTitleUser-username",
				$avatar: ".gsuiTitleUser-avatar",
				$cmpName: ".gsuiTitleUser-cmpName",
				$cmpDur: ".gsuiTitleUser-cmpDur",
				$login: ".gsuiTitleUser-login",
				$logout: ".gsuiTitleUser-logout",
				$save: ".gsuiTitleUser-save",
			},
			$attributes: {
				cmpdur: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$login.onclick = () => this.$dispatch( "login" );
		this.$elements.$logout.onclick = () => this.$dispatch( "logout" );
		this.$elements.$save.onclick = () => this.$dispatch( "save" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "name", "username", "avatar", "cmpname", "cmpdur", "saved", "saving", "connecting", "disconnecting" ];
		// "just-saved", "connected"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "name": this.$elements.$name.textContent = val; break;
			case "cmpname": this.$elements.$cmpName.textContent = val; break;
			case "avatar": this.$elements.$avatar.style.backgroundImage = `url(${ val })`; break;
			case "username": {
				this.$elements.$username.textContent = val;
				GSUsetAttribute( this.$elements.$userLink, "href", `//gridsound.com/#/u/${ val }` );
			} break;
			case "cmpdur": {
				const dur = GSUsplitSeconds( +val );

				this.$elements.$cmpDur.textContent = `${ dur.m }:${ dur.s }`;
			} break;
			case "saving":
				GSUsetAttribute( this.$elements.$save, "data-spin", val === "" ? "on" : false );
				if ( val === "" ) {
					GSUsetAttribute( this, "just-saved", false );
				}
				break;
			case "saved":
				GSUsetAttribute( this, "just-saved", val === "" );
				break;
			case "connecting":
				GSUsetAttribute( this.$elements.$login, "data-spin", val === "" ? "on" : false );
				break;
			case "disconnecting":
				GSUsetAttribute( this.$elements.$logout, "data-spin", val === "" ? "on" : false );
				break;
		}
	}

	// .........................................................................
}

GSUdefineElement( "gsui-titleuser", gsuiTitleUser );
