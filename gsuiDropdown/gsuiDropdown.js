"use strict";

class gsuiDropdown {
	#elBtn = null;
	#elem = null;
	#isOpen = false;
	#direction = "bottom";
	#elParent = GSUdomBody;
	#elContent = null;
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
		if ( !this.#elBtn.contains( e.target ) && !this.#elem.contains( e.target ) ) {
			this.#close();
		}
	}
	#open() {
		if ( !this.#isOpen && this.#onbeforeOpening() !== false ) {
			this.#isOpen = true;
			GSUclearTimeout( this.#timeoutId );
			if ( this.#elem ) {
				GSUdomSetAttr( this.#elem, "data-open" );
			} else {
				this.#elem = this.#createElement();
				this.#elParent.prepend( this.#elem );
				GSUdomBody.addEventListener( "pointerdown", this.#onptrdownBodyBind );
				this.#timeoutId = GSUsetTimeout( () => {
					this.#positionElement();
					GSUdomSetAttr( this.#elem, "data-open" );
				}, .01 );
			}
		}
	}
	#close() {
		if ( this.#isOpen ) {
			this.#isOpen = false;
			GSUclearTimeout( this.#timeoutId );
			GSUdomRmAttr( this.#elem, "data-open" );
			GSUdomBody.removeEventListener( "pointerdown", this.#onptrdownBodyBind );
			this.#timeoutId = GSUsetTimeout( () => {
				this.#elem.remove();
				this.#elem = null;
				this.#elContent = null;
			}, .25 );
		}
	}
	#createElement() {
		this.#elContent = this.#onopenCreateElement?.();

		return GSUcreateDiv( { class: "gsuiDropdown", "data-dir": this.#direction },
			GSUcreateDiv( { class: "gsuiDropdown-arrow", inert: true } ),
			GSUcreateDiv( { class: "gsuiDropdown-content" }, this.#elContent ),
		);
	}
	#positionElement() {
		const tarBCR = GSUdomBCR( this.#elBtn );
		const elArrow = GSUdomQS( this.#elem, ".gsuiDropdown-arrow" );
		const posObj = getAbsPos( this.#direction, tarBCR, this.#elem.clientWidth, this.#elem.clientHeight, {
			margin: 8,
			withArrow: true,
			absolute: this.#elParent === GSUdomBody,
		} );

		GSUdomStyle( this.#elem, {
			left: posObj.left,
			top: posObj.top,
		} );
		GSUdomStyle( elArrow, {
			left: posObj.arrowLeft,
			top: posObj.arrowTop,
		} );
	}
}
