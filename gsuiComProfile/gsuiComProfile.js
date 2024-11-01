"use strict";

class gsuiComProfile extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiComProfile",
			$tagName: "gsui-com-profile",
			$elements: {
				$email: ".gsuiComProfile-main-email-addr span",
				$emailpub: ".gsuiComProfile-main-email-addr .gsuiIcon",
				$username: ".gsuiComProfile-main-username",
				$lastname: ".gsuiComProfile-main-lastname",
				$firstname: ".gsuiComProfile-main-firstname",
				$emailVerify: ".gsuiComProfile-main-email-not",
				$edit: ".gsuiComProfile-main-edit",
				$form: ".gsuiComProfile-form",
				$cancel: ".gsuiComProfile-btn:not([type='submit'])",
				$inputs: "[].gsuiComProfile-form input",
			},
			$attributes: {
				email: "",
			},
		} );
		Object.seal( this );
		this.$elements.$form.onsubmit = e => {
			const tar = e.target;

			this.$dispatch( "edit", {
				firstname: tar[ 0 ].value,
				lastname: tar[ 1 ].value,
				email: tar[ 2 ].value,
				emailpublic: tar[ 3 ].checked,
			} );
			return false;
		};
		this.$elements.$emailVerify.onclick = () => {
			if ( !GSUhasAttribute( this, "emailsent" ) && !GSUhasAttribute( this, "emailsending" ) ) {
				this.$dispatch( "verifyEmail" );
			}
		};
		this.$elements.$cancel.onclick = () => GSUsetAttribute( this, "editing", false );
		this.$elements.$edit.onclick = () => {
			if ( !GSUhasAttribute( this, "editing" ) ) {
				this.$elements.$inputs[ 0 ].value = GSUgetAttribute( this, "firstname" );
				this.$elements.$inputs[ 1 ].value = GSUgetAttribute( this, "lastname" );
				this.$elements.$inputs[ 2 ].value = GSUgetAttribute( this, "email" );
				this.$elements.$inputs[ 3 ].checked = GSUhasAttribute( this, "emailpublic" );
			}
			GSUtoggleAttribute( this, "editing" );
		};
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "email", "emailpublic", "username", "lastname", "firstname", "emailtoverify" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "email": this.$elements.$email.textContent = val; break;
			case "emailpublic": this.$elements.$emailpub.dataset.icon = val === "" ? "public" : "private"; break;
			case "username": this.$elements.$username.textContent = val; break;
			case "lastname": this.$elements.$lastname.textContent = val; break;
			case "firstname": this.$elements.$firstname.textContent = val; break;
		}
	}
}

GSUdefineElement( "gsui-com-profile", gsuiComProfile );
