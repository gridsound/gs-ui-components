"use strict";

class gsuiTitleUser extends gsui0ne {
	#justSavedTimeout = null;
	#loginPromise = null;
	#logoutPromise = null;
	#loginPopup = GSUdomFind( GSUgetTemplate( "gsui-titleuser-popup" ), {
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
		this.$elements.$login.$on( "click", this.#onclickLogin.bind( this ) );
		this.$elements.$logout.$on( "click", this.#onclickLogout.bind( this ) );
		this.$elements.$save.$on( "click", () => this.$this.$dispatch( GSEV_TITLEUSER_SAVE ) );
		this.$elements.$cmpEditBtn.$on( "click", () => !this.$this.$hasAttr( "readonly" ) && this.$this.$addAttr( "renaming" ) );
		this.$elements.$cmpEditInp.$on( {
			blur: () => this.$this.$hasAttr( "renaming" ) && this.#onkeydownRename( "Enter" ),
			keydown: e => {
				e.stopPropagation();
				this.#onkeydownRename( e.key );
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "name", "username", "avatar", "cmpname", "cmpdur", "just-saved", "saved", "saving", "connecting", "disconnecting", "renaming" ];
		// "connected"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "name": this.$elements.$name.$text( val ); break;
			case "avatar": this.$elements.$avatar.$css( "backgroundImage", `url(${ val })` ); break;
			case "username":
				this.$elements.$username.$text( val );
				this.$elements.$userLink.$setAttr( "href", `//gridsound.com/#/u/${ val }` );
				break;
			case "cmpdur": {
				const dur = GSUsplitSeconds( +val );

				this.$elements.$cmpDur.$text( `${ dur.m }:${ dur.s }` );
			} break;
			case "saved":
			case "cmpname": this.#updateCmpName(); break;
			case "saving": this.$elements.$save.$setAttr( "data-spin", val === "" ? "on" : false ); break;
			case "connecting": this.$elements.$login.$setAttr( "data-spin", val === "" ? "on" : false ); break;
			case "disconnecting": this.$elements.$logout.$setAttr( "data-spin", val === "" ? "on" : false ); break;
			case "just-saved":
				if ( val === "" ) {
					GSUclearTimeout( this.#justSavedTimeout );
					this.#justSavedTimeout = GSUsetTimeout( () => this.$this.$rmAttr( "just-saved" ), 2.5 );
				}
				break;
			case "renaming":
				if ( val === "" ) {
					this.$elements.$cmpEditInp.$value( this.$this.$getAttr( "cmpname" ) ).$focus();
				}
				break;
		}
	}

	// .........................................................................
	$showLoginPopup() { return this.#onclickLogin(); }
	$setLoginCallbackPromise( fn ) { this.#loginPromise = fn; }
	$setLogoutCallbackPromise( fn ) { this.#logoutPromise = fn; }
	$setUserInfo( me ) {
		this.$this.$setAttr( {
			name: !me ? "" : `${ me.firstname } ${ me.lastname }`.trim(),
			avatar: !me ? "" : me.avatar,
			username: !me ? "" : me.username,
			connected: !!me,
		} );
		return me;
	}

	// .........................................................................
	#updateCmpName() {
		const name = this.$this.$getAttr( "cmpname" );
		const title = name || "GridSound";

		this.$elements.$cmpName.$text( name );
		document.title = this.$this.$hasAttr( "saved" ) ? title : `*${ title }`;
	}
	#onclickLogout() {
		this.$this.$addAttr( "disconnecting" );
		return this.#logoutPromise?.()
			.then( () => this.$setUserInfo( null ) )
			.finally( () => this.$this.$rmAttr( "disconnecting" ) );
	}
	#onclickLogin() {
		return GSUpopup.$custom( {
			ok: "Sign in",
			title: "Authentication",
			element: this.#loginPopup.$root,
			submit: this.#onsubmitLogin.bind( this ),
		} ).then( () => {
			$( this.#loginPopup.$root, "input" ).$value( "" );
			return this.$this.$rmAttr( "connecting" ).$hasAttr( "connected" );
		} );
	}
	#onsubmitLogin( obj ) {
		this.$this.$addAttr( "connecting" );
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
				if ( this.$elements.$cmpEditInp.$value() !== this.$this.$getAttr( "cmpname" ) ) {
					this.$this.$dispatch( GSEV_TITLEUSER_RENAME, GSUtrim2( this.$elements.$cmpEditInp.$value() ) );
				}
			case "Escape": this.$this.$rmAttr( "renaming" );
		}
	}
}

GSUdomDefine( "gsui-titleuser", gsuiTitleUser );
