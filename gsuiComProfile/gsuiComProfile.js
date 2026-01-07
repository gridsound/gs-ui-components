"use strict";

class gsuiComProfile extends gsui0ne {
	#verifyPromise = null;
	#followPromise = null;
	static #emailTexts = {
		$verify: "Email not verify, send a confirmation email again",
		$sending: "Email sending...",
		$sent: "Email sent",
	};

	constructor() {
		super( {
			$cmpName: "gsuiComProfile",
			$tagName: "gsui-com-profile",
			$elements: {
				$avatar: "gsui-com-avatar",
				$email: ".gsuiComProfile-email-addr span",
				$emailpub: ".gsuiComProfile-email-addr .gsuiIcon",
				$name: ".gsuiComProfile-name",
				$username: ".gsuiComProfile-username",
				$lastname: ".gsuiComProfile-lastname",
				$firstname: ".gsuiComProfile-firstname",
				$emailVerifyText: ".gsuiComProfile-email-not span",
				$followersBtn: ".gsuiComProfile-followers",
				$followingBtn: ".gsuiComProfile-following",
				$followBtn: ".gsuiComProfile-follow-btn",
			},
			$attributes: {
				email: "",
				followers: 0,
				following: 0,
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		this.onmouseenter =
		this.onmouseleave = () => GSUdomRmAttr( this, "followedjustnow" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [
			// "itsme",
			"avatar", "email", "emailpublic", "emailtoverify",
			"username", "lastname", "firstname",
			"followed", "followers", "following",
		];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "username": this.$elements.$username.textContent = val; break;
			case "email": this.$elements.$email.textContent = val; break;
			case "emailpublic": this.$elements.$emailpub.dataset.icon = val === "" ? "public" : "private"; break;
			case "lastname": this.$elements.$lastname.textContent = val; break;
			case "firstname": this.$elements.$firstname.textContent = val; break;
			case "avatar": GSUdomSetAttr( this.$elements.$avatar, "src", val || false ); break;
			case "emailtoverify": this.$elements.$emailVerifyText.textContent = val !== "" ? "" : gsuiComProfile.#emailTexts.$verify; break;
			case "followed": this.#updateFollowed( val === "" ); break;
			case "followers": this.$elements.$followersBtn.textContent = val; break;
			case "following": this.$elements.$followingBtn.textContent = val; break;
		}
		switch ( prop ) {
			case "username":
			case "lastname":
			case "firstname":
				GSUdomSetAttr( this.$elements.$name, "title",
						`/u/${ this.$elements.$username.textContent
						} : ${ this.$elements.$firstname.textContent || "--"
						} ${ this.$elements.$lastname.textContent || "--" }` );
				break;
		}
	}

	// .........................................................................
	$setFollowCallbackPromise( fn ) { this.#followPromise = fn; }
	$setVerifyEmailCallbackPromise( fn ) { this.#verifyPromise = fn; }

	// .........................................................................
	#updateFollowed( b ) {
		GSUdomSetAttr( this.$elements.$followBtn, b
			? { "data-icon": "follow", title: "Follow" }
			: { "data-icon": "followed", title: "Unfollow" } );
	}
	#updateFollowLoading( b ) {
		GSUdomTogClass( this.$elements.$followBtn, "gsuiIcon", b );
		GSUdomSetAttr( this.$elements.$followBtn, b
			? { "data-spin": "on", disabled: true }
			: { "data-spin": false, disabled: false } );
	}
	#onclick( e ) {
		switch ( e.target.dataset.what ) {
			case "edit": GSUdomDispatch( this, GSEV_COMPROFILE_EDIT ); break;
			case "followers": GSUdomDispatch( this, GSEV_COMPROFILE_FOLLOWERS ); break;
			case "following": GSUdomDispatch( this, GSEV_COMPROFILE_FOLLOWING ); break;
			case "follow": this.#onclickFollow(); break;
			case "verify": this.#onclickVerify(); break;
		}
	}
	#onclickFollow() {
		const willFollow = !GSUdomHasAttr( this, "followed" );

		this.#updateFollowLoading( true );
		this.#followPromise?.( willFollow )
			.then( () => {
				GSUdomSetAttr( this, {
					followed: willFollow,
					followers: GSUdomGetAttrNum( this, "followers" ) + willFollow * 2 - 1,
					followedjustnow: willFollow,
				} );
			} )
			.catch( err => GSUpopup.$alert( `Error ${ err.code }`, err.msg ) )
			.finally( () => this.#updateFollowLoading( false ) );
	}
	#onclickVerify() {
		if ( !GSUdomHasAttr( this, "emailsending" ) ) {
			GSUdomSetAttr( this, "emailsending" );
			this.$elements.$emailVerifyText.textContent = gsuiComProfile.#emailTexts.$sending;
			this.#verifyPromise?.()
				.then( () => this.$elements.$emailVerifyText.textContent = gsuiComProfile.#emailTexts.$sent )
				.catch( err => this.$elements.$emailVerifyText.textContent = err )
				.finally( () => GSUdomRmAttr( this, "emailsending" ) );
		}
	}
}

GSUdomDefine( "gsui-com-profile", gsuiComProfile );
