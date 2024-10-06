"use strict";

class gsuiActionMenu {
	#actions = [];
	#onclickFn = GSUnoop;
	#closeAfterClick = true;
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
				this.#elMenu = gsuiActionMenu.#createMenuElement( this.#actions );
				this.#elMenu.onclick = this.#onclickActions.bind( this );
				document.body.prepend( this.#elMenu );
				document.body.addEventListener( "pointerdown", this.#onptrdownBodyBind );
				this.#timeoutId = setTimeout( () => {
					gsuiActionMenu.#positionMenuElement( this.#elMenu, this.#elTarget );
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
	static #createMenuElement( actions ) {
		return GSUcreateDiv( { class: "gsuiActionMenu" },
			GSUcreateDiv( { class: "gsuiActionMenu-arrow" } ),
			GSUcreateDiv( { class: "gsuiActionMenu-actions" }, actions.map( act =>
				!act.hidden && GSUcreateButton( { class: "gsuiActionMenu-action", "data-id": act.id },
					act.icon && GSUcreateI( { class: "gsuiIcon", "data-icon": act.icon, inert: true } ),
					GSUcreateDiv( { class: "gsuiActionMenu-action-body", inert: true },
						GSUcreateSpan( { class: "gsuiActionMenu-action-name" }, act.name ),
						act.desc && GSUcreateSpan( { class: "gsuiActionMenu-action-desc" }, act.desc ),
					),
				)
			) )
		);
	}
	static #positionMenuElement( elMenu, elTarget ) {
		const tarBCR = elTarget.getBoundingClientRect();
		const elHtml = document.documentElement;

		GSUsetStyle( elMenu, {
			left: `${ elHtml.scrollLeft + tarBCR.x + tarBCR.width / 2 - elMenu.clientWidth / 2 }px`,
			top: `${ elHtml.scrollTop + tarBCR.y + tarBCR.height + 8 }px`,
		} );
	}
}

// const elArrow = elMenu.querySelector( ".gsuiActionMenu-arrow" );
// const posObj = calcAbsolutePosition( "bottom", tarBCR, elMenu.clientWidth, elMenu.clientHeight, {
// 	margin: 8,
// 	withArrow: true,
// 	absolute: true,
// } );

// GSUsetStyle( elMenu, {
// 	left: posObj.left,
// 	top: posObj.top,
// } );
// GSUsetStyle( elArrow, {
// 	left: posObj.arrowLeft,
// 	top: posObj.arrowTop,
// } );
