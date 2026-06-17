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
			$tagName: "gsui-com-profile",
			$elements: {
				$avatar: "gsui-com-avatar",
				$email: "gsui-com-profile-email-addr span",
				$emailpub: "gsui-com-profile-email-addr gsui-icon",
				$name: "gsui-com-profile-name",
				$username: "gsui-com-profile-name :first-child",
				$fullname: "gsui-com-profile-name :last-child",
				$emailVerifyText: "[data-what=verify] span",
				$followers: "[data-what=followers] b",
				$following: "[data-what=following] b",
				$followBtn: "[data-what=follow]",
			},
			$attributes: {
				email: "",
				followers: 0,
				following: 0,
			},
		} );
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
			case "avatar": this.$elements.$avatar.$setAttr( "src", val || false ); break;
			case "emailtoverify": this.$elements.$emailVerifyText.$text( val !== "" ? "" : gsuiComProfile.#emailTexts.$verify ); break;
			case "followed": this.#updateFollowed( val === "" ); break;
			case "followers": this.$elements.$followers.$text( val ); break;
			case "following": this.$elements.$following.$text( val ); break;
		}
		if ( prop === "username" || prop === "firstname" || prop === "lastname" ) {
			const fullname = this.$this.$getAttr( "firstname", "lastname" ).join( " " ).trim();

			this.$elements.$fullname.$text( fullname );
			this.$elements.$name.$setAttr( "title", `/u/${ this.$this.$getAttr( "username" ) } : ${ fullname || "--" }` );
		}
	}

	// .........................................................................
	$isSmall() { return this.$elements.$avatar.$css( "--xs" ) === "1"; }
	$setFollowCallbackPromise( fn ) { this.#followPromise = fn; }
	$setVerifyEmailCallbackPromise( fn ) { this.#verifyPromise = fn; }

	// .........................................................................
	#updateFollowed( b ) {
		this.$elements.$followBtn.$setAttr( "data-tooltip", b ? GSTX.$profile_unfollow : GSTX.$profile_follow );
	}
	#updateFollowLoading( b ) {
		this.$elements.$followBtn.$disabled( b ).$child( 0 ).$setAttr( "data-spin", b );
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
			.catch( err => $popup.$alert( `Error ${ err.code }`, err.msg ) )
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

$.$define( "gsui-com-profile", gsuiComProfile );
