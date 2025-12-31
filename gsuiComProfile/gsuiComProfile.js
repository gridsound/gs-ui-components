"use strict";

class gsuiComProfile extends gsui0ne {
	#savingPromise = null;
	#verifyPromise = null;
	#followPromise = null;
	#followersPromise = null;
	#followingPromise = null;
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
				$name: ".gsuiComProfile-main-name",
				$username: ".gsuiComProfile-main-username",
				$lastname: ".gsuiComProfile-main-lastname",
				$firstname: ".gsuiComProfile-main-firstname",
				$emailVerify: ".gsuiComProfile-main-email-not",
				$emailVerifyText: ".gsuiComProfile-main-email-not span",
				$followersBtn: ".gsuiComProfile-main-followers",
				$followingBtn: ".gsuiComProfile-main-following",
				$followBtn: ".gsuiComProfile-main-follow-btn",
				$edit: ".gsuiComProfile-main-edit",
				$panelClose: ".gsuiComProfile-panel-title button",
				$panelTitles: {
					edit: ".gsuiComProfile-panel-title [data-what='edit']",
					following: ".gsuiComProfile-panel-title [data-what='following']",
					followers: ".gsuiComProfile-panel-title [data-what='followers']",
				},
				$panelContents: {
					edit: ".gsuiComProfile-panel-content [data-what='edit']",
					following: ".gsuiComProfile-panel-content [data-what='following']",
					followers: ".gsuiComProfile-panel-content [data-what='followers']",
				},
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
		this.$elements.$cancel.onclick = () => GSUdomRmAttr( this, "panel" );
		this.$elements.$main.onmouseenter =
		this.$elements.$main.onmouseleave = () => GSUdomRmAttr( this, "followedjustnow" );
		this.$elements.$followersBtn.onclick = () => GSUdomSetAttr( this, "panel", "followers" );
		this.$elements.$followingBtn.onclick = () => GSUdomSetAttr( this, "panel", "following" );
		this.$elements.$panelClose.onclick = () => GSUdomRmAttr( this, "panel" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [
			"panel", "itsme", "avatar",
			"email", "emailpublic", "emailtoverify",
			"username", "lastname", "firstname",
			"followed", "followers", "following",
		];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "panel": this.#showPanel( val ); break;
			case "itsme": val !== "" && GSUdomRmAttr( this, "panel" ); break;
			case "username":
				GSUdomRmAttr( this, "panel" );
				this.$elements.$username.textContent = val;
				break;
			case "email": this.$elements.$email.textContent = val; break;
			case "emailpublic": this.$elements.$emailpub.dataset.icon = val === "" ? "public" : "private"; break;
			case "lastname": this.$elements.$lastname.textContent = val; break;
			case "firstname": this.$elements.$firstname.textContent = val; break;
			case "avatar": GSUdomSetAttr( this.$elements.$avatar, "src", val || false ); break;
			case "emailtoverify": this.$elements.$emailVerifyText.textContent = val !== "" ? "" : gsuiComProfile.#emailTexts.$verify; break;
			case "followed": this.#updateFollowed( val === "" ); break;
			case "followers":
				this.$elements.$followersBtn.textContent =
				this.$elements.$panelTitles.followers.firstChild.textContent = val;
				break;
			case "following":
				this.$elements.$followingBtn.textContent =
				this.$elements.$panelTitles.following.firstChild.textContent = val;
				break;
		}
		switch ( prop ) {
			case "username":
			case "lastname":
			case "firstname":
				GSUdomSetAttr( this.$elements.$name, "title",
						`/u/${ this.$elements.$username.textContent
						} : ${ this.$elements.$firstname.textContent || '--'
						} ${ this.$elements.$lastname.textContent || '--' }` );
				break;
		}
	}

	// .........................................................................
	$setSavingCallbackPromise( fn ) { this.#savingPromise = fn; }
	$setFollowCallbackPromise( fn ) { this.#followPromise = fn; }
	$setFollowersCallbackPromise( fn ) { this.#followersPromise = fn; }
	$setFollowingCallbackPromise( fn ) { this.#followingPromise = fn; }
	$setVerifyEmailCallbackPromise( fn ) { this.#verifyPromise = fn; }

	// .........................................................................
	#showPanel( what ) {
		if ( what ) {
			const cnts = this.$elements.$panelContents;

			this.#showPanel2( this.$elements.$panelTitles, what );
			this.#showPanel2( cnts, what );
			switch ( what ) {
				case "followers": gsuiComProfile.#showFollowList( cnts.followers, this.#followersPromise ); break;
				case "following": gsuiComProfile.#showFollowList( cnts.following, this.#followingPromise ); break;
			}
		}
	}
	#showPanel2( elems, what ) {
		GSUforEach( elems, el => el.style.display = el.dataset.what === what ? '' : 'none' );
	}
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
		if ( GSUdomGetAttr( this, "panel" ) !== "edit" ) {
			this.$elements.$inputs[ 0 ].value = GSUdomGetAttr( this, "firstname" );
			this.$elements.$inputs[ 1 ].value = GSUdomGetAttr( this, "lastname" );
			this.$elements.$inputs[ 2 ].value = GSUdomGetAttr( this, "email" );
			this.$elements.$inputs[ 3 ].checked = GSUdomHasAttr( this, "emailpublic" );
		}
		this.$elements.$error.textContent = "";
		GSUdomTogAttr( this, "panel", "edit" );
	}
	static #showFollowList( elCnt, prom ) {
		GSUdomSetAttr( elCnt, "data-loading", true );
		GSUdomEmpty( elCnt.firstChild );
		prom?.()
			.then( arr => elCnt.firstChild.append( ...arr.map( u => GSUcreateElement( "gsui-com-userlink", u ) ) ) )
			.finally( () => GSUdomRmAttr( elCnt, "data-loading" ) );
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
				GSUdomRmAttr( this, "panel" );
			} )
			.catch( err => this.$elements.$error.textContent = err )
			.finally( () => GSUdomRmAttr( this.$elements.$submit, "loading" ) );
		return false;
	}
}

GSUdomDefine( "gsui-com-profile", gsuiComProfile );
