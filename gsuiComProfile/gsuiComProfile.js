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
		this.$elements.$cancel.onclick = () => GSUsetAttribute( this, "editing", false );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "email", "emailpublic", "emailtoverify", "username", "lastname", "firstname", "avatar" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "email": this.$elements.$email.textContent = val; break;
			case "emailpublic": this.$elements.$emailpub.dataset.icon = val === "" ? "public" : "private"; break;
			case "username": this.$elements.$username.textContent = val; break;
			case "lastname": this.$elements.$lastname.textContent = val; break;
			case "firstname": this.$elements.$firstname.textContent = val; break;
			case "avatar": GSUsetAttribute( this.$elements.$avatar, "src", val || false ); break;
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
		if ( !GSUhasAttribute( this, "editing" ) ) {
			this.$elements.$inputs[ 0 ].value = GSUgetAttribute( this, "firstname" );
			this.$elements.$inputs[ 1 ].value = GSUgetAttribute( this, "lastname" );
			this.$elements.$inputs[ 2 ].value = GSUgetAttribute( this, "email" );
			this.$elements.$inputs[ 3 ].checked = GSUhasAttribute( this, "emailpublic" );
		}
		this.$elements.$error.textContent = "";
		GSUtoggleAttribute( this, "editing" );
	}
	#onclickVerify() {
		if ( !GSUhasAttribute( this, "emailsending" ) ) {
			GSUsetAttribute( this, "emailsending", true );
			this.$elements.$emailVerifyText.textContent = gsuiComProfile.#emailTexts.$sending;
			this.#verifyPromise?.()
				.then( () => this.$elements.$emailVerifyText.textContent = gsuiComProfile.#emailTexts.$sent )
				.catch( err => this.$elements.$emailVerifyText.textContent = err )
				.finally( () => GSUsetAttribute( this, "emailsending", false ) );
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

		GSUsetAttribute( this.$elements.$submit, "loading", true );
		this.#savingPromise?.( obj )
			.then( obj => {
				GSUsetAttribute( this, obj );
				GSUsetAttribute( this, "editing", false );
			} )
			.catch( err => this.$elements.$error.textContent = err )
			.finally( () => GSUsetAttribute( this.$elements.$submit, "loading", false ) );
		return false;
	}
}

GSUdefineElement( "gsui-com-profile", gsuiComProfile );
