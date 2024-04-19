"use strict";

class gsui0ne extends HTMLElement {
	$dispatch = null;
	$element = null;
	$elements = null;
	$isConnected = false;
	#children = null;
	#attributes = null;
	#onresizeBind = null;
	#connectionCount = 0;

	constructor( o = {} ) {
		super();
		this.#attributes = o.$attributes || {};
		this.$dispatch = GSUdispatchEvent.bind( null, this, o.$cmpName );
		this.#children = o.$template || ( GSUhasTemplate( o.$tagName )
			? GSUgetTemplate( o.$tagName, ...( o.$tmpArgs || [] ) )
			: null );
		if ( this.#children ) {
			this.$element = Array.isArray( this.#children ) ? this.#children[ 0 ] : this.#children;
			this.$elements = GSUfindElements( this.#children, o.$elements );
		}
		if ( this.$onresize ) {
			this.#onresizeBind = this.$onresize.bind( this );
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
			GSUrecallAttributes( this, this.#attributes );
			this.#attributes = null;
			this.$firstTimeConnected?.();
		}
		this.$connected?.();
		if ( this.#onresizeBind ) {
			GSUobserveSizeOf( this, this.#onresizeBind );
		}
	}
	disconnectedCallback() {
		GSUunobserveSizeOf( this, this.#onresizeBind );
		this.$isConnected = false;
		this.$disconnected?.();
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			this.$attributeChanged?.( prop, val, prev );
		}
	}
}
