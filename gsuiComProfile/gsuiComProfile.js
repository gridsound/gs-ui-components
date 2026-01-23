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
			$jqueryfy: true,
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
		this.onmouseleave = () => this.$this.$rmAttr( "followedjustnow" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "avatar", "email", "emailpublic", "emailtoverify", "username", "lastname", "firstname", "followed", "followers", "following" ];
		// + "itsme"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "username": this.$elements.$username.$text( val ); break;
			case "email": this.$elements.$email.$text( val ); break;
			case "emailpublic": this.$elements.$emailpub.$setAttr( "data-icon", val === "" ? "public" : "private" ); break;
			case "lastname": this.$elements.$lastname.$text( val ); break;
			case "firstname": this.$elements.$firstname.$text( val ); break;
			case "avatar": this.$elements.$avatar.$setAttr( "src", val || false ); break;
			case "emailtoverify": this.$elements.$emailVerifyText.$text( val !== "" ? "" : gsuiComProfile.#emailTexts.$verify ); break;
			case "followed": this.#updateFollowed( val === "" ); break;
			case "followers": this.$elements.$followersBtn.$text( val ); break;
			case "following": this.$elements.$followingBtn.$text( val ); break;
		}
		switch ( prop ) {
			case "username":
			case "lastname":
			case "firstname":
				this.$elements.$name.$setAttr( "title",
					`/u/${ this.$elements.$username.$text()
					} : ${ this.$elements.$firstname.$text() || "--"
					} ${ this.$elements.$lastname.$text() || "--" }` );
				break;
		}
	}

	// .........................................................................
	$setFollowCallbackPromise( fn ) { this.#followPromise = fn; }
	$setVerifyEmailCallbackPromise( fn ) { this.#verifyPromise = fn; }

	// .........................................................................
	#updateFollowed( b ) {
		this.$elements.$followBtn.$setAttr( b
			? { "data-icon": "follow", title: "Follow" }
			: { "data-icon": "followed", title: "Unfollow" } );
	}
	#updateFollowLoading( b ) {
		this.$elements.$followBtn
			.$togClass( "gsuiIcon", b )
			.$setAttr( b
				? { "data-spin": "on", disabled: true }
				: { "data-spin": false, disabled: false } );
	}
	#onclick( e ) {
		switch ( e.target.dataset.what ) {
			case "edit": this.$this.$dispatch( GSEV_COMPROFILE_EDIT ); break;
			case "followers": this.$this.$dispatch( GSEV_COMPROFILE_FOLLOWERS ); break;
			case "following": this.$this.$dispatch( GSEV_COMPROFILE_FOLLOWING ); break;
			case "follow": this.#onclickFollow(); break;
			case "verify": this.#onclickVerify(); break;
		}
	}
	#onclickFollow() {
		const willFollow = !this.$this.$hasAttr( "followed" );

		this.#updateFollowLoading( true );
		this.#followPromise?.( willFollow )
			.then( () => {
				this.$this.$setAttr( {
					followed: willFollow,
					followers: +this.$this.$getAttr( "followers" ) + willFollow * 2 - 1,
					followedjustnow: willFollow,
				} );
			} )
			.catch( err => GSUpopup.$alert( `Error ${ err.code }`, err.msg ) )
			.finally( () => this.#updateFollowLoading( false ) );
	}
	#onclickVerify() {
		if ( !this.$this.$hasAttr( "emailsending" ) ) {
			this.$this.$addAttr( "emailsending" );
			this.$elements.$emailVerifyText.$text( gsuiComProfile.#emailTexts.$sending );
			this.#verifyPromise?.()
				.then( () => this.$elements.$emailVerifyText.$text( gsuiComProfile.#emailTexts.$sent ) )
				.catch( err => this.$elements.$emailVerifyText.$text( err ) )
				.finally( () => this.$this.$rmAttr( "emailsending" ) );
		}
	}
}

GSUdomDefine( "gsui-com-profile", gsuiComProfile );
