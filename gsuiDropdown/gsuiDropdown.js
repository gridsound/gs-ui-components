"use strict";

class gsuiDropdown {
	#elBtn = $noop;
	#elem = $noop;
	#isOpen = false;
	#direction = "bottom";
	#elParent = $body;
	#elContent = $noop;
	#timeoutId = null;
	#onptrdownBodyBind = this.#onptrdownBody.bind( this );
	#onbeforeOpening = GSUnoop;
	#onopenCreateElement = GSUnoop;

	$isOpen() { return this.#isOpen; }
	$open() { this.#open(); }
	$close() { this.#close(); }
	$setParent( el ) { this.#elParent = el; }
	$setDirection( dir ) { this.#direction = dir; }
	$onbeforeOpening( fn ) { this.#onbeforeOpening = fn; }
	$onopenCreateElement( fn ) { this.#onopenCreateElement = fn; }
	$setTarget( el ) {
		this.#elBtn = el;
		if ( this.#isOpen ) {
			this.#positionElement();
		}
	}
	$bindTargetElement( btn ) {
		this.#elBtn = btn;
		btn.$addEventListener( "click", this.#onclickTarget.bind( this ) );
	}
	$getContent() {
		return this.#elContent;
	}

	// .........................................................................
	#onclickTarget() {
		this.#isOpen
			? this.#close()
			: this.#open();
	}
	#onptrdownBody( e ) {
		if ( !this.#elBtn.$contains( e.target ) && !this.#elem.$contains( e.target ) ) {
			this.#close();
		}
	}
	#open() {
		if ( !this.#isOpen && this.#onbeforeOpening() !== false ) {
			this.#isOpen = true;
			GSUclearTimeout( this.#timeoutId );
			if ( this.#elem.$size() ) {
				this.#elem.$addAttr( "data-open" );
			} else {
				this.#elem = this.#createElement().$prependTo( this.#elParent );
				$body.$addEventListener( "pointerdown", this.#onptrdownBodyBind );
				this.#timeoutId = GSUsetTimeout( () => {
					this.#positionElement();
					this.#elem.$addAttr( "data-open" );
				}, .01 );
			}
		}
	}
	#close() {
		if ( this.#isOpen ) {
			this.#isOpen = false;
			GSUclearTimeout( this.#timeoutId );
			this.#elem.$rmAttr( "data-open" );
			$body.$rmEventListener( "pointerdown", this.#onptrdownBodyBind );
			this.#timeoutId = GSUsetTimeout( () => {
				this.#elem.$remove();
				this.#elem =
				this.#elContent = $noop;
			}, .25 );
		}
	}
	#createElement() {
		this.#elContent = this.#onopenCreateElement();

		return $( "<div>" ).$addClass( "gsuiDropdown" ).$setAttr( "data-dir", this.#direction ).$append(
			$( "<div>" ).$addClass( "gsuiDropdown-arrow" ).$addAttr( "inert" ),
			$( "<div>" ).$addClass( "gsuiDropdown-content" ).$append( this.#elContent ),
		);
	}
	#positionElement() {
		const posObj = gsuiCalcAbsPos.$calc(
			this.#direction,
			this.#elBtn.$bcr(),
			this.#elem.$width(),
			this.#elem.$height(), {
				margin: 8,
				withArrow: true,
				absolute: this.#elParent.$is( $body ),
			} );

		this.#elem.$css( {
			left: posObj.left,
			top: posObj.top,
		} ).$query( ".gsuiDropdown-arrow" ).$css( {
			left: posObj.arrowLeft,
			top: posObj.arrowTop,
		} );
	}
}
