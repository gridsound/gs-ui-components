"use strict";

class gsuiComProfile extends gsui0ne {
	#savingPromise = null;
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
				$main: ".gsuiComProfile-main",
				$avatar: "gsui-com-avatar",
				$email: ".gsuiComProfile-main-email-addr span",
				$emailpub: ".gsuiComProfile-main-email-addr .gsuiIcon",
				$username: ".gsuiComProfile-main-username",
				$lastname: ".gsuiComProfile-main-lastname",
				$firstname: ".gsuiComProfile-main-firstname",
				$emailVerify: ".gsuiComProfile-main-email-not",
				$emailVerifyText: ".gsuiComProfile-main-email-not span",
				$followers: ".gsuiComProfile-main-followers",
				$following: ".gsuiComProfile-main-following",
				$followBtn: ".gsuiComProfile-main-follow-btn",
				$edit: ".gsuiComProfile-main-edit",
				$form: ".gsuiComProfile-form",
				$cancel: "gsui-com-button:not([type='submit'])",
				$submit: "gsui-com-button[type='submit']",
				$error: ".gsuiComProfile-form-error",
				$inputs: "[].gsuiComProfile-form input",
			},
			$attributes: {
				email: "",
				followers: 0,
				following: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$edit.onclick = this.#onclickEdit.bind( this );
		this.$elements.$followBtn.onclick = this.#onclickFollow.bind( this );
		this.$elements.$form.onsubmit = this.#onsubmit.bind( this );
		this.$elements.$emailVerify.onclick = this.#onclickVerify.bind( this );
		this.$elements.$cancel.onclick = () => GSUdomRmAttr( this, "editing" );
		this.$elements.$main.onmouseenter =
		this.$elements.$main.onmouseleave = () => GSUdomRmAttr( this, "followedjustnow" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [
			"itsme", "avatar",
			"email", "emailpublic", "emailtoverify",
			"username", "lastname", "firstname",
			"followed", "followers", "following",
		];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsme": val !== "" && GSUdomRmAttr( this, "editing" ); break;
			case "email": this.$elements.$email.textContent = val; break;
			case "emailpublic": this.$elements.$emailpub.dataset.icon = val === "" ? "public" : "private"; break;
			case "username": this.$elements.$username.textContent = val; break;
			case "lastname": this.$elements.$lastname.textContent = val; break;
			case "firstname": this.$elements.$firstname.textContent = val; break;
			case "avatar": GSUdomSetAttr( this.$elements.$avatar, "src", val || false ); break;
			case "emailtoverify": this.$elements.$emailVerifyText.textContent = val !== "" ? "" : gsuiComProfile.#emailTexts.$verify; break;
			case "followers": this.$elements.$followers.textContent = val; break;
			case "following": this.$elements.$following.textContent = val; break;
			case "followed": this.#updateFollowed( val === "" ); break;
		}
	}

	// .........................................................................
	$setFollowCallbackPromise( fn ) { this.#followPromise = fn; }
	$setSavingCallbackPromise( fn ) { this.#savingPromise = fn; }
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
	#onclickEdit() {
		if ( !GSUdomHasAttr( this, "editing" ) ) {
			this.$elements.$inputs[ 0 ].value = GSUdomGetAttr( this, "firstname" );
			this.$elements.$inputs[ 1 ].value = GSUdomGetAttr( this, "lastname" );
			this.$elements.$inputs[ 2 ].value = GSUdomGetAttr( this, "email" );
			this.$elements.$inputs[ 3 ].checked = GSUdomHasAttr( this, "emailpublic" );
		}
		this.$elements.$error.textContent = "";
		GSUdomTogAttr( this, "editing" );
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
	#onsubmit( e ) {
		const tar = e.target;
		const obj = {
			firstname: tar[ 0 ].value,
			lastname: tar[ 1 ].value,
			email: tar[ 2 ].value,
			emailpublic: tar[ 3 ].checked,
		};

		GSUdomSetAttr( this.$elements.$submit, "loading" );
		this.#savingPromise?.( obj )
			.then( obj => {
				GSUdomSetAttr( this, obj );
				GSUdomRmAttr( this, "editing" );
			} )
			.catch( err => this.$elements.$error.textContent = err )
			.finally( () => GSUdomRmAttr( this.$elements.$submit, "loading" ) );
		return false;
	}
}

GSUdomDefine( "gsui-com-profile", gsuiComProfile );
