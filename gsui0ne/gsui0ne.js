"use strict";

class gsui0ne extends HTMLElement {
	$this = $( this );
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
		Object.seal( this );
		this.#attributes = o.$attributes || {};
		this.#children = o.$template || ( GSUhasTemplate( o.$tagName )
			? GSUgetTemplate( o.$tagName, ...o.$tmpArgs || [] )
			: null );
		if ( this.#children ) {
			this.$element = $( GSUisArr( this.#children ) ? this.#children[ 0 ] : this.#children );
			this.$elements = $( this.#children ).$queryMap( o.$elements );
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
				GSUisArr( this.#children )
					? this.append( ...this.#children )
					: this.append( this.#children );
				this.#children = null;
			}
			gsui0ne.#recallAttributes( this.$this, this.#attributes );
			this.$firstTimeConnected?.();
		}
		this.$connected?.();
		if ( this.#onresizeBind ) {
			GSUdomObserveSize( this, this.#onresizeBind );
		}
	}
	disconnectedCallback() {
		GSUdomUnobserveSize( this, this.#onresizeBind );
		this.$isConnected = false;
		this.$disconnected?.();
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			this.#attributes[ prop ] = val;
			this.$attributeChanged?.( prop, val, prev );
		}
	}
	static #recallAttributes( el, attr ) {
		GSUforEach( attr, ( val, p ) => {
			el.$hasAttr( p )
				? el.$get( 0 ).attributeChangedCallback?.( p, null, el.$getAttr( p ) )
				: val !== false
					? el.$setAttr( p, val )
					: el.$get( 0 ).$attributeChanged?.( p, null, null );
		} );
	}

	// .........................................................................
	$ptrDown( e ) {
		this.#onptrdown( e );
	}
	#onptrdown( e ) {
		if ( this.$onptrdown( e ) === false ) {
			this.$isActive = false;
		} else {
			this.$isActive = true;
			if ( this.#ptrlock ) {
				this.requestPointerLock().then( () => this.#onptrdown2( e ) );
			} else {
				this.$this.$setPtrCapture( e.pointerId );
				this.#onptrdown2( e );
			}
		}
	}
	#onptrdown2( e ) {
		this.#ptrMap.set( e.pointerId );
		if ( this.#ptrMap.size < 2 ) {
			this.onpointerup =
			this.onpointerleave = this.#onptrup.bind( this );
			if ( this.$onptrmove ) {
				this.onpointermove = this.$onptrmove.bind( this );
			}
		}
	}
	#onptrup( e ) {
		if ( this.$isActive ) {
			this.#ptrlock
				? document.exitPointerLock()
				: this.$this.$relPtrCapture( e.pointerId );
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
