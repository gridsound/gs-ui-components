"use strict";

class gsuiJoystick extends gsui0ne {
	#coord = [ 0, 0 ];

	constructor() {
		super( {
			$cmpName: "gsuiJoystick",
			$tagName: "gsui-joystick",
			$template: GSUcreateElement( "div", { inert: true } ),
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		gsuiRipple.$init( this );
	}
	$onptrdown( e ) {
		e.preventDefault();
		this.#moveJoystick( e );
		this.$this.$addAttr( "moving" )
			.$dispatch( GSEV_JOYSTICK_START, ...this.#coord );
	}
	$onptrup() {
		this.$this.$rmAttr( "moving" )
			.$dispatch( GSEV_JOYSTICK_END, ...this.#coord );
	}
	$onptrmove( e ) {
		const old = [ ...this.#coord ];

		this.#moveJoystick( e );
		if ( !GSUarrayEq( old, this.#coord ) ) {
			this.$this.$dispatch( GSEV_JOYSTICK_MOVE, ...this.#coord );
		}
	}

	// .........................................................................
	#moveJoystick( e ) {
		this.#coord[ 0 ] = GSUmathClamp( e.offsetX / this.offsetWidth, 0, 1 );
		this.#coord[ 1 ] = GSUmathClamp( e.offsetY / this.offsetHeight, 0, 1 );
		this.$element
			.$left( this.#coord[ 0 ] * 100, "%" )
			.$top( this.#coord[ 1 ] * 100, "%" );
	}
}

GSUdomDefine( "gsui-joystick", gsuiJoystick );
