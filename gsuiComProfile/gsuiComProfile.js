"use strict";

class gsuiComProfile extends gsui0ne {
	#savingPromise = null;
	#verifyPromise = null;
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
				$email: ".gsuiComProfile-main-email-addr span",
				$emailpub: ".gsuiComProfile-main-email-addr .gsuiIcon",
				$username: ".gsuiComProfile-main-username",
				$lastname: ".gsuiComProfile-main-lastname",
				$firstname: ".gsuiComProfile-main-firstname",
				$emailVerify: ".gsuiComProfile-main-email-not",
				$emailVerifyText: ".gsuiComProfile-main-email-not span",
				$edit: ".gsuiComProfile-main-edit",
				$form: ".gsuiComProfile-form",
				$cancel: "gsui-com-button:not([type='submit'])",
				$submit: "gsui-com-button[type='submit']",
				$error: ".gsuiComProfile-form-error",
				$inputs: "[].gsuiComProfile-form input",
			},
			$attributes: {
				email: "",
			},
		} );
		Object.seal( this );
		this.$elements.$edit.onclick = this.#onclickEdit.bind( this );
		this.$elements.$form.onsubmit = this.#onsubmit.bind( this );
		this.$elements.$emailVerify.onclick = this.#onclickVerify.bind( this );
		this.$elements.$cancel.onclick = () => GSUdomRmAttr( this, "editing" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "itsme", "email", "emailpublic", "emailtoverify", "username", "lastname", "firstname", "avatar" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsme": val !== "" && GSUtoggleAttribute( this, "editing", false ); break;
			case "email": this.$elements.$email.textContent = val; break;
			case "emailpublic": this.$elements.$emailpub.dataset.icon = val === "" ? "public" : "private"; break;
			case "username": this.$elements.$username.textContent = val; break;
			case "lastname": this.$elements.$lastname.textContent = val; break;
			case "firstname": this.$elements.$firstname.textContent = val; break;
			case "avatar": GSUdomSetAttr( this.$elements.$avatar, "src", val || false ); break;
			case "emailtoverify": this.$elements.$emailVerifyText.textContent = val !== "" ? "" : gsuiComProfile.#emailTexts.$verify; break;
		}
	}

	// .........................................................................
	$setSavingCallbackPromise( fn ) {
		this.#savingPromise = fn;
	}
	$setVerifyEmailCallbackPromise( fn ) {
		this.#verifyPromise = fn;
	}

	// .........................................................................
	#onclickEdit() {
		if ( !GSUdomHasAttr( this, "editing" ) ) {
			this.$elements.$inputs[ 0 ].value = GSUdomGetAttr( this, "firstname" );
			this.$elements.$inputs[ 1 ].value = GSUdomGetAttr( this, "lastname" );
			this.$elements.$inputs[ 2 ].value = GSUdomGetAttr( this, "email" );
			this.$elements.$inputs[ 3 ].checked = GSUdomHasAttr( this, "emailpublic" );
		}
		this.$elements.$error.textContent = "";
		GSUtoggleAttribute( this, "editing" );
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

GSUdefineElement( "gsui-com-profile", gsuiComProfile );
