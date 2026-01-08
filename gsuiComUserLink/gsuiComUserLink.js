"use strict";

class gsuiComUserLink extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiComUserLink",
			$tagName: "gsui-com-userlink",
			$template: GSUcreateA( { class: "gsuiComUserLink-a" },
				GSUcreateIcon( { icon: "musician" } ),
				GSUcreateDiv( { class: "gsuiComUserLink-avatar" } ),
				GSUcreateSpan( { class: "gsuiComUserLink-username" } ),
				GSUcreateSpan( { class: "gsuiComUserLink-name" } ),
			),
			$elements: {
				$a: ".gsuiComUserLink-a",
				$name: ".gsuiComUserLink-name",
				$avatar: ".gsuiComUserLink-avatar",
				$username: ".gsuiComUserLink-username",
			},
		} );
		Object.seal( this );
	}

	static get observedAttributes() {
		return [ "username", "firstname", "lastname", "avatar" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "firstname":
			case "lastname": this.#updateName(); break;
			case "avatar": GSUdomStyle( this.$elements.$avatar, "backgroundImage", `url(${ val })` ); break;
			case "username": this.#updateUsername( val ); break;
		}
	}

	#updateUsername( n ) {
		this.$elements.$a.href = `#/u/${ n }`;
		this.$elements.$username.textContent = n;
	}
	#updateName() {
		const a = GSUdomGetAttr( this, "firstname" );
		const b = GSUdomGetAttr( this, "lastname" );

		this.$elements.$name.textContent = a && b
			? `${ a } ${ b }`
			: a || b || "";
	}
}

GSUdomDefine( "gsui-com-userlink", gsuiComUserLink );
