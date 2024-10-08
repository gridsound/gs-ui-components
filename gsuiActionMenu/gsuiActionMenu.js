"use strict";

class gsuiActionMenu {
	#minw = "100px";
	#minh = "100px";
	#maxw = "400px";
	#maxh = "400px";
	#actions = [];
	#onclickFn = GSUnoop;
	#direction = "bottom";
	#closeAfterClick = true;
	#elParent = document.body;
	#elMenu = null;
	#elTarget = null;
	#isOpen = false;
	#timeoutId = null;
	#onptrdownBodyBind = this.#onptrdownBody.bind( this );

	// .........................................................................
	$bindTargetElement( btn ) {
		this.#elTarget = btn;
		btn.addEventListener( "click", this.#onclickTarget.bind( this ) );
	}
	$setDirection( dir ) {
		this.#direction = dir;
	}
	$setMinSize( w, h ) {
		this.#minw = w;
		this.#minh = h;
	}
	$setMaxSize( w, h ) {
		this.#maxw = w;
		this.#maxh = h;
	}
	$setMenuParent( el ) {
		this.#elParent = el;
	}
	$setCallback( fn ) {
		this.#onclickFn = fn;
	}
	$closeAfterClick( b ) {
		this.#closeAfterClick = b;
	}
	$setActions( arr ) {
		this.#actions = arr.filter( Boolean ).map( act => ( { ...act } ) );
	}
	$showAction( id, b ) {
		const act = this.#actions.find( act => act.id === id );

		if ( act ) {
			act.hidden = !b;
		}
	}

	// .........................................................................
	#onclickTarget() {
		this.#isOpen
			? this.#close()
			: this.#open();
	}
	#onclickActions( e ) {
		const act = e.target.dataset.id;

		if ( act ) {
			this.#onclickFn( act );
			if ( this.#closeAfterClick ) {
				this.#close();
			}
		}
	}
	#onptrdownBody( e ) {
		if ( !this.#elTarget.contains( e.target ) && !this.#elMenu.contains( e.target ) ) {
			this.#close();
		}
	}

	// .........................................................................
	#open() {
		if ( !this.#isOpen && this.#actions.length > 0 ) {
			this.#isOpen = true;
			clearTimeout( this.#timeoutId );
			if ( this.#elMenu ) {
				GSUsetAttribute( this.#elMenu, "data-open", true );
			} else {
				this.#elMenu = this.#createMenuElement();
				this.#elMenu.onclick = this.#onclickActions.bind( this );
				this.#elParent.prepend( this.#elMenu );
				document.body.addEventListener( "pointerdown", this.#onptrdownBodyBind );
				this.#timeoutId = setTimeout( () => {
					this.#positionMenuElement();
					GSUsetAttribute( this.#elMenu, "data-open", true );
				}, 10 );
			}
		}
	}
	#close() {
		if ( this.#isOpen ) {
			this.#isOpen = false;
			clearTimeout( this.#timeoutId );
			GSUsetAttribute( this.#elMenu, "data-open", false );
			document.body.removeEventListener( "pointerdown", this.#onptrdownBodyBind );
			this.#timeoutId = setTimeout( () => {
				this.#elMenu.remove();
				this.#elMenu = null;
			}, 250 );
		}
	}
	#createMenuElement() {
		return GSUcreateDiv( { class: "gsuiActionMenu", "data-dir": this.#direction, style: { minWidth: this.#minw, minHeight: this.#minh, maxWidth: this.#maxw, maxHeight: this.#maxh } },
			GSUcreateDiv( { class: "gsuiActionMenu-arrow" } ),
			GSUcreateDiv( { class: "gsuiActionMenu-actions" }, this.#actions.map( act =>
				!act.hidden && GSUcreateButton( { class: "gsuiActionMenu-action", "data-id": act.id },
					act.icon && GSUcreateI( { class: "gsuiIcon", "data-icon": act.icon, inert: true } ),
					GSUcreateDiv( { class: "gsuiActionMenu-action-body", inert: true },
						GSUcreateSpan( { class: "gsuiActionMenu-action-name" }, act.name ),
						act.desc && GSUcreateSpan( { class: "gsuiActionMenu-action-desc" }, act.desc ),
					),
				)
			) ),
		);
	}
	#positionMenuElement() {
		const tarBCR = this.#elTarget.getBoundingClientRect();
		const menuBCR = this.#elMenu.getBoundingClientRect();
		const elArrow = this.#elMenu.querySelector( ".gsuiActionMenu-arrow" );
		const posObj = getAbsPos( this.#direction, tarBCR, this.#elMenu.clientWidth, this.#elMenu.clientHeight, {
			margin: 8,
			withArrow: true,
			absolute: this.#elParent === document.body,
		} );

		GSUsetStyle( this.#elMenu, {
			left: posObj.left,
			top: posObj.top,
		} );
		GSUsetStyle( elArrow, {
			left: posObj.arrowLeft,
			top: posObj.arrowTop,
		} );
	}
}
