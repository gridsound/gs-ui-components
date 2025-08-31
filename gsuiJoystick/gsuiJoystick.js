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
		GSUdomSetAttr( this, "moving" );
		this.#moveJoystick( e );
		GSUdomDispatch( this, "gsuiJoystick-start", ...this.#coord );
	}
	$onptrup() {
		GSUdomRmAttr( this, "moving" );
		GSUdomDispatch( this, "gsuiJoystick-end", ...this.#coord );
	}
	$onptrmove( e ) {
		const old = [ ...this.#coord ];

		this.#moveJoystick( e );
		if ( !GSUarrayEq( old, this.#coord ) ) {
			GSUdomDispatch( this, "gsuiJoystick-move", ...this.#coord );
		}
	}

	// .........................................................................
	#moveJoystick( e ) {
		this.#coord[ 0 ] = GSUmathClamp( e.offsetX / this.offsetWidth, 0, 1 );
		this.#coord[ 1 ] = GSUmathClamp( e.offsetY / this.offsetHeight, 0, 1 );
		GSUsetStyle( this.$element, {
			left: `${ this.#coord[ 0 ] * 100 }%`,
			top: `${ this.#coord[ 1 ] * 100 }%`,
		} );
	}
}

GSUdefineElement( "gsui-joystick", gsuiJoystick );
