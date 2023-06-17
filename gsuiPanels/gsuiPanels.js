"use strict";

class gsuiPanels extends HTMLElement {
	#dir = "";
	#pos = "";
	#dirX = false;
	#pageN = 0;
	#extend = null;
	#pans = null;
	#panBefore = null;
	#panAfter = null;
	#panAfterMinSize = 0;

	constructor() {
		super();
		Object.seal( this );
		this.onpointerdown = this.#onpointerdown.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this.#init();
	}

	// .........................................................................
	#init() {
		const size = this.#dirX ? this.clientWidth : this.clientHeight;

		this.#pans = Array.from( this.children );
		this.#dirX = GSUI.$getAttribute( this, "dir" ) === "x";
		this.#dir = this.#dirX ? "width" : "height";
		this.#pos = this.#dirX ? "left" : "top";
		this.querySelectorAll( ".gsuiPanels-extend" ).forEach( el => el.remove() );
		this.querySelectorAll( ".gsuiPanels-last" ).forEach( el => el.classList.remove( "gsuiPanels-last" ) );
		this.#pans.at( -1 ).classList.add( "gsuiPanels-last" );
		this.#pans.map( p => [ p, p.getBoundingClientRect()[ this.#dir ] / size * 100 ] )
			.reduce( ( x, [ p, perc ] ) => {
				p.classList.add( 'gsuiPanels-panel' );
				p.style[ this.#dir ] = `${ perc }%`;
				p.style[ this.#pos ] = `${ x }%`;
				if ( x > 0 ) {
					p.append( GSUI.$createElement( "div", { class: "gsuiPanels-extend" } ) );
				}
				return x + perc;
			}, 0 );
	}
	static #incrSizePans( dir, mov, parentsize, pans ) {
		return pans.reduce( ( mov, pan ) => {
			const style = getComputedStyle( pan );
			const size = Math.round( pan.getBoundingClientRect()[ dir ] );
			const minsize = parseFloat( style[ `min-${ dir }` ] ) || 10;
			const maxsize = parseFloat( style[ `max-${ dir }` ] ) || Infinity;
			const newsizeCorrect = Math.round( Math.max( minsize, Math.min( size + mov, maxsize ) ) );
			let ret = mov;

			if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
				pan.style[ dir ] = `${ GSUI.$round( newsizeCorrect / parentsize * 100, 10 ) }%`;
				ret -= newsizeCorrect - size;
				pan.onresizing?.( pan );
			}
			return ret;
		}, mov );
	}

	// .........................................................................
	#onpointerdown( e ) {
		const tar = e.target;
		const pan = tar.parentNode;

		if ( pan.parentNode === this && tar.classList.contains( "gsuiPanels-extend" ) ) {
			const pInd = this.#pans.indexOf( pan );

			this.#extend = tar;
			this.#pageN = this.#dirX ? e.pageX : e.pageY;
			this.#panBefore = this.#pans.slice( 0, pInd ).reverse();
			this.#panAfter = this.#pans.slice( pInd );
			this.#panAfterMinSize = this.#panAfter.reduce( ( n, p ) => {
				return n + parseFloat( getComputedStyle( p )[ `min-${ this.#dir }` ] ) || 10;
			}, 0 );
			this.style.cursor = this.#dirX ? "col-resize" : "row-resize";
			tar.classList.add( "gsui-hover" );
			GSUI.$unselectText();
			this.setPointerCapture( e.pointerId );
			this.onpointerup = this.#onpointerup.bind( this );
			this.onpointermove = this.#onpointermove.bind( this );
		}
	}
	#onpointerup( e ) {
		this.style.cursor = "";
		this.#extend.classList.remove( "gsui-hover" );
		this.releasePointerCapture( e.pointerId );
		this.onpointermove =
		this.onpointerup = null;
	}
	#onpointermove( e ) {
		const px = Math.round( ( this.#dirX ? e.pageX : e.pageY ) - this.#pageN );
		const parentsize = this.#dirX ? this.clientWidth : this.clientHeight;
		const currBeforeSize = this.#panBefore.reduce( ( n, p ) => {
			return n + parseFloat( getComputedStyle( p )[ this.#dir ] );
		}, 0 );
		const px2 = px <= 0 ? px : Math.min( px, parentsize - currBeforeSize - this.#panAfterMinSize );
		const mov = px2 - gsuiPanels.#incrSizePans( this.#dir, px2, parentsize, this.#panBefore );

		this.#pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			gsuiPanels.#incrSizePans( this.#dir, -mov, parentsize, this.#panAfter );
		}
		this.#pans.reduce( ( x, p ) => {
			p.style[ this.#pos ] = `${ x }%`;
			return x + parseFloat( p.style[ this.#dir ] );
		}, 0 );
	}
}

Object.freeze( gsuiPanels );
customElements.define( "gsui-panels", gsuiPanels );
