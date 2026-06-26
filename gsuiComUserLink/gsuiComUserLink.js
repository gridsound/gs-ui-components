"use strict";

class gsuiComUserLink extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-com-userlink",
			$template: $.$link( null,
				$.$elem( "gsui-com-avatar" ),
				$.$bold(),
				$.$span(),
			),
			$elements: {
				$name: "span",
				$avatar: "gsui-com-avatar",
				$username: "b",
			},
		} );
	}

	static get observedAttributes() {
		return [ "username", "firstname", "lastname", "avatar" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "firstname":
			case "lastname": this.#updateName(); break;
			case "avatar": this.$elements.$avatar.$setAttr( "src", val ); break;
			case "username": this.#updateUsername( val ); break;
		}
	}

	#updateUsername( n ) {
		this.$element.$setAttr( "href", `#/u/${ n }` );
		this.$elements.$username.$text( n );
	}
	#updateName() {
		const [ a, b ] = this.$this.$getAttr( "firstname", "lastname" );

		this.$elements.$name.$text( a && b
			? `${ a } ${ b }`
			: a || b || "" );
	}
}

$.$define( "gsui-com-userlink", gsuiComUserLink );
