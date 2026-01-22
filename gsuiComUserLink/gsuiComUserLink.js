"use strict";

class gsuiComUserLink extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiComUserLink",
			$tagName: "gsui-com-userlink",
			$jqueryfy: true,
			$template: GSUcreateA( null,
				GSUcreateIcon( { icon: "musician" } ),
				GSUcreateDiv(),
				GSUcreateElement( "b" ),
				GSUcreateSpan(),
			),
			$elements: {
				$a: "a",
				$name: "span",
				$avatar: "div",
				$username: "b",
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
			case "avatar": this.$elements.$avatar.$css( "backgroundImage", `url(${ val })` ); break;
			case "username": this.#updateUsername( val ); break;
		}
	}

	#updateUsername( n ) {
		this.$elements.$a.$attr( "href", `#/u/${ n }` );
		this.$elements.$username.$text( n );
	}
	#updateName() {
		const a = this.$this.$attr( "firstname" );
		const b = this.$this.$attr( "lastname" );

		this.$elements.$name.$text( a && b
			? `${ a } ${ b }`
			: a || b || "" );
	}
}

GSUdomDefine( "gsui-com-userlink", gsuiComUserLink );
