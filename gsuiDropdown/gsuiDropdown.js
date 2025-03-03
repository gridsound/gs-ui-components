"use strict";

class gsuiDropdown {
	#elBtn = null;
	#elem = null;
	#isOpen = false;
	#direction = "bottom";
	#elParent = document.body;
	#timeoutId = null;
	#onptrdownBodyBind = this.#onptrdownBody.bind( this );
	#onbeforeOpening = GSUnoop;
	#onopenCreateElement = null;

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
		btn.addEventListener( "click", this.#onclickTarget.bind( this ) );
	}

	// .........................................................................
	#onclickTarget() {
		this.#isOpen
			? this.#close()
			: this.#open();
	}
	#onptrdownBody( e ) {
		if ( !this.#elBtn.contains( e.target ) && !this.#elem.contains( e.target ) ) {
			this.#close();
		}
	}
	#open() {
		if ( !this.#isOpen && this.#onbeforeOpening() !== false ) {
			this.#isOpen = true;
			clearTimeout( this.#timeoutId );
			if ( this.#elem ) {
				GSUsetAttribute( this.#elem, "data-open", true );
			} else {
				this.#elem = this.#createElement();
				this.#elParent.prepend( this.#elem );
				document.body.addEventListener( "pointerdown", this.#onptrdownBodyBind );
				this.#timeoutId = setTimeout( () => {
					this.#positionElement();
					GSUsetAttribute( this.#elem, "data-open", true );
				}, 10 );
			}
		}
	}
	#close() {
		if ( this.#isOpen ) {
			this.#isOpen = false;
			clearTimeout( this.#timeoutId );
			GSUsetAttribute( this.#elem, "data-open", false );
			document.body.removeEventListener( "pointerdown", this.#onptrdownBodyBind );
			this.#timeoutId = setTimeout( () => {
				this.#elem.remove();
				this.#elem = null;
			}, 250 );
		}
	}
	#createElement() {
		return GSUcreateDiv( { class: "gsuiDropdown", "data-dir": this.#direction },
			GSUcreateDiv( { class: "gsuiDropdown-arrow", inert: true } ),
			GSUcreateDiv( { class: "gsuiDropdown-content" }, this.#onopenCreateElement?.() ),
		);
	}
	#positionElement() {
		const tarBCR = this.#elBtn.getBoundingClientRect();
		const menuBCR = this.#elem.getBoundingClientRect();
		const elArrow = this.#elem.querySelector( ".gsuiDropdown-arrow" );
		const posObj = getAbsPos( this.#direction, tarBCR, this.#elem.clientWidth, this.#elem.clientHeight, {
			margin: 8,
			withArrow: true,
			absolute: this.#elParent === document.body,
		} );

		GSUsetStyle( this.#elem, {
			left: posObj.left,
			top: posObj.top,
		} );
		GSUsetStyle( elArrow, {
			left: posObj.arrowLeft,
			top: posObj.arrowTop,
		} );
	}
}
