"use strict";

class gsuiActionMenu {
	#dropdown = new gsuiDropdown();
	#minw = "100px";
	#minh = "32px";
	#maxw = "400px";
	#maxh = "400px";
	#actions = [];
	#onclickFn = GSUnoop;
	#closeAfterClick = true;

	constructor() {
		this.#dropdown.$onopenCreateElement( this.#createOptions.bind( this ) );
		this.#dropdown.$onbeforeOpening( () => {
			return this.#actions.length > 0;
		} );
	}

	// .........................................................................
	$open() { this.#dropdown.$open(); }
	$close() { this.#dropdown.$close(); }
	$bindTargetElement( btn ) { this.#dropdown.$bindTargetElement( btn ); }
	$setTarget( tar ) { this.#dropdown.$setTarget( tar ); }
	$setDirection( dir ) { this.#dropdown.$setDirection( dir ); }
	$setMenuParent( el ) { this.#dropdown.$setParent( el ); }
	$setMinSize( w, h ) {
		this.#minw = w;
		this.#minh = h;
	}
	$setMaxSize( w, h ) {
		this.#maxw = w;
		this.#maxh = h;
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
	$changeAction( id, prop, val ) {
		const act = this.#actions.find( act => act.id === id );
		const elActions = this.#dropdown.$getContent();

		if ( act ) {
			act[ prop ] = val;
			if ( elActions ) {
				switch ( prop ) {
					case "icon":
						elActions.querySelector( `.gsuiActionMenu-action[data-id='${ act.id }'] .gsuiIcon` ).dataset.icon = val;
						break;
				}
			}
		}
	}

	// .........................................................................
	#onclickActions( e ) {
		const act = e.target.dataset.id;

		if ( act ) {
			this.#onclickFn( act );
			if ( this.#closeAfterClick ) {
				this.#dropdown.$close();
			}
		}
	}
	#createOptions() {
		const style = {
			minWidth: this.#minw,
			minHeight: this.#minh,
			maxWidth: this.#maxw,
			maxHeight: this.#maxh,
		};
		const elem = GSUcreateDiv( { class: "gsuiActionMenu-actions", style }, this.#actions.map( act =>
			!act.hidden && GSUcreateButton( { class: "gsuiActionMenu-action", "data-id": act.id },
				act.icon && GSUcreateI( { class: "gsuiIcon", "data-icon": act.icon, inert: true } ),
				GSUcreateDiv( { class: "gsuiActionMenu-action-body", inert: true },
					GSUcreateSpan( { class: "gsuiActionMenu-action-name" }, act.name ),
					act.desc && GSUcreateSpan( { class: "gsuiActionMenu-action-desc" }, act.desc ),
				),
			)
		) );

		elem.onclick = this.#onclickActions.bind( this );
		return elem;
	}
}
