"use strict";

class gsui0ne extends HTMLElement {
	$dispatch = null;
	$elements = null;
	$isConnected = false;
	#children = null;
	#attributes = null;
	#connectionCount = 0;

	constructor( o = {} ) {
		super();
		this.#attributes = o.$attributes || {};
		this.$dispatch = GSUdispatchEvent.bind( null, this, o.$cmpName );
		this.#children = o.$template || ( GSUhasTemplate( o.$tagName )
			? GSUgetTemplate( o.$tagName, ...( o.$tmpArgs || [] ) )
			: null );
		if ( this.#children ) {
			this.$elements = GSUfindElements( this.#children, o.$elements );
		}
	}

	// .........................................................................
	connectedCallback() {
		this.$isConnected = true;
		if ( ++this.#connectionCount === 1 ) {
			if ( this.#children ) {
				Array.isArray( this.#children )
					? this.append( ...this.#children )
					: this.append( this.#children );
				this.#children = null;
			}
			this.$firstTimeConnected?.();
			GSUrecallAttributes( this, this.#attributes );
			this.#attributes = null;
		}
		this.$connected?.();
	}
	disconnectedCallback() {
		this.$isConnected = false;
		this.$disconnected?.();
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			this.$attributeChanged?.( prop, val, prev );
		}
	}
}
