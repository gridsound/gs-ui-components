"use strict";

class gsui0ne extends HTMLElement {
	$dispatch = null;
	$element = null;
	$elements = null;
	$isActive = false;
	$isConnected = false;
	#ptrMap = new Map();
	#ptrlock = false;
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
		if ( this.$onptrdown && this.$onptrup ) {
			this.oncontextmenu = GSUnoopFalse;
			this.onpointerdown = this.#onptrdown.bind( this );
			this.#ptrlock = o.$ptrlock || false;
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

	// .........................................................................
	#onptrdown( e ) {
		this.$isActive = true;
		if ( this.$onptrdown( e ) === false ) {
			this.$isActive = false;
		} else {
			this.#ptrlock
				? this.requestPointerLock()
				: this.setPointerCapture( e.pointerId );
			this.#ptrMap.set( e.pointerId );
			if ( this.#ptrMap.size < 2 ) {
				this.onpointerup =
				this.onpointerleave = this.#onptrup.bind( this );
				if ( this.$onptrmove ) {
					this.onpointermove = this.$onptrmove.bind( this );
				}
			}
		}
	}
	#onptrup( e ) {
		if ( this.$isActive ) {
			this.#ptrlock
				? document.exitPointerLock()
				: this.releasePointerCapture( e.pointerId );
			this.#ptrMap.delete( e.pointerId );
			if ( this.#ptrMap.size < 1 ) {
				this.$isActive = false;
				this.onpointermove =
				this.onpointerup =
				this.onpointerleave = null;
			}
			this.$onptrup( e );
		}
	}
}
