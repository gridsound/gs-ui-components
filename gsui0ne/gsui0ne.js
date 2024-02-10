"use strict";

class gsui0ne extends HTMLElement {
	$dispatch = null;
	$elements = null;
	#children = null;
	#attributes = null;
	#isConnected = false;
	#connectionCount = 0;

	constructor( o ) {
		super();
		this.#attributes = o.$attributes || {};
		this.#children = GSUgetTemplate( o.$tagName, ...( o.$tmpArgs || [] ) );
		this.$elements = GSUfindElements( this.#children, o.$elements );
		this.$dispatch = GSUdispatchEvent.bind( null, this, o.$cmpName );
	}

	// .........................................................................
	connectedCallback() {
		this.#isConnected = true;
		if ( ++this.#connectionCount === 1 ) {
			if ( this.#children ) {
				this.append( ...this.#children );
				this.#children = null;
			}
			this.$firstTimeConnected?.();
			GSUrecallAttributes( this, this.#attributes );
			this.#attributes = null;
		} else {
			this.$connected?.();
		}
	}
	disconnectedCallback() {
		this.#isConnected = false;
		this.$disconnected?.();
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			this.$attributeChanged?.( prop, prev, val );
		}
	}
}
