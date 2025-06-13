"use strict";

class gsuiTitleUser extends gsui0ne {
	#justSavedTimeout = null;
	#loginPromise = null;
	#logoutPromise = null;
	#loginPopup = GSUfindElements( GSUgetTemplate( "gsui-titleuser-popup" ), {
		$root: ".gsuiTitleUser-popup",
		$error: ".gsuiTitleUser-popup-error",
	} );

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
		this.$elements.$login.onclick = this.#onclickLogin.bind( this );
		this.$elements.$logout.onclick = this.#onclickLogout.bind( this );
		this.$elements.$save.onclick = () => this.$dispatch( "save" );
		this.$elements.$cmpEditBtn.onclick = () => !GSUdomHasAttr( this, "readonly" ) && GSUsetAttribute( this, "renaming", true );
		this.$elements.$cmpEditInp.onblur = e => GSUdomHasAttr( this, "renaming" ) && this.#onkeydownRename( "Enter" );
		this.$elements.$cmpEditInp.onkeydown = e => { e.stopPropagation(); this.#onkeydownRename( e.key ); };
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
					GSUclearTimeout( this.#justSavedTimeout );
					this.#justSavedTimeout = GSUsetTimeout( () => GSUdomRmAttr( this, "just-saved" ), 2.5 );
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
	$showLoginPopup() { return this.#onclickLogin(); }
	$setLoginCallbackPromise( fn ) { this.#loginPromise = fn; }
	$setLogoutCallbackPromise( fn ) { this.#logoutPromise = fn; }
	$setUserInfo( me ) {
		GSUsetAttribute( this, {
			name: !me ? "" : `${ me.firstname } ${ me.lastname }`,
			avatar: !me ? "" : me.avatar,
			username: !me ? "" : me.username,
			connected: !!me,
		} );
		return me;
	}

	// .........................................................................
	#updateCmpName() {
		const name = GSUgetAttribute( this, "cmpname" );
		const title = name || "GridSound";

		this.$elements.$cmpName.textContent = name;
		document.title = GSUdomHasAttr( this, "saved" ) ? title : `*${ title }`;
	}
	#onclickLogout() {
		GSUsetAttribute( this, "disconnecting", true );
		return this.#logoutPromise?.()
			.then( () => this.$setUserInfo( null ) )
			.finally( () => GSUdomRmAttr( this, "disconnecting" ) );
	}
	#onclickLogin() {
		return GSUpopup.$custom( {
			ok: "Sign in",
			title: "Authentication",
			element: this.#loginPopup.$root,
			submit: this.#onsubmitLogin.bind( this ),
		} ).then( () => {
			GSUdomQSA( this.#loginPopup.$root, "input" ).forEach( inp => inp.value = "" );
			GSUdomRmAttr( this, "connecting" );
			return GSUdomHasAttr( this, "connected" );
		} );
	}
	#onsubmitLogin( obj ) {
		GSUsetAttribute( this, "connecting", true );
		this.#loginPopup.$error.textContent = "";
		return this.#loginPromise?.( obj.email, obj.password )
			.then( me => this.$setUserInfo( me ) )
			.catch( res => {
				this.#loginPopup.$error.textContent = res.msg;
				return false;
			} );
	}
	#onkeydownRename( key ) {
		switch ( key ) {
			case "Enter":
				if ( this.$elements.$cmpEditInp.value !== GSUgetAttribute( this, "cmpname" ) ) {
					this.$dispatch( "rename", GSUtrim2( this.$elements.$cmpEditInp.value ) );
				}
			case "Escape": GSUdomRmAttr( this, "renaming" );
		}
	}
}

GSUdefineElement( "gsui-titleuser", gsuiTitleUser );
