"use strict";

class gsuiPanels extends gsui0ne {
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
		super( {
			$cmpName: "gsuiPanels",
			$tagName: "gsui-panels",
		} );
		Object.seal( this );
		this.onpointerdown = this.#onpointerdown.bind( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#init();
	}

	// .........................................................................
	#init() {
		const dirX = GSUdomGetAttr( this, "dir" ) === "x";
		const size = dirX ? this.clientWidth : this.clientHeight;

		this.#pans = Array.from( this.children );
		this.#dirX = dirX;
		this.#dir = dirX ? "width" : "height";
		this.#pos = dirX ? "left" : "top";
		GSUdomQSA( this, ".gsuiPanels-extend" ).forEach( el => el.remove() );
		this.#pans.map( p => [ p, GSUdomBCR( p )[ this.#dir ] / size * 100 ] )
			.reduce( ( x, [ p, perc ] ) => {
				const perc2 = GSUmathFix( perc, 1 );

				GSUdomAddClass( p, "gsuiPanels-panel" );
				p.style[ this.#dir ] = `${ perc2 }%`;
				p.style[ this.#pos ] = `${ x }%`;
				if ( x > 0 ) {
					p.append( GSUcreateDiv( { class: "gsuiPanels-extend" } ) );
				}
				return x + perc2;
			}, 0 );
	}
	static #incrSizePans( dir, mov, parentsize, pans ) {
		return pans.reduce( ( mov, pan ) => {
			const style = GSUgetStyle( pan );
			const size = Math.round( GSUdomBCR( pan )[ dir ] );
			const minsize = parseFloat( style[ `min-${ dir }` ] ) || 10;
			const maxsize = parseFloat( style[ `max-${ dir }` ] ) || Infinity;
			const newsizeCorrect = Math.round( Math.max( minsize, Math.min( size + mov, maxsize ) ) );
			let ret = mov;

			if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
				pan.style[ dir ] = `${ GSUmathFix( newsizeCorrect / parentsize * 100, 2 ) }%`;
				ret -= newsizeCorrect - size;
				pan.onresizing?.( pan );
			}
			return ret;
		}, mov );
	}

	// .........................................................................
	$onresize() {
		const tot = GSUdomBCR( this )[ this.#dir ];
		const tot2 = this.#pans.reduce( ( sz, p ) => sz + GSUdomBCR( p )[ this.#dir ], 0 );

		if ( Math.abs( tot2 - tot ) > 0 ) {
			const mindir = this.#dirX ? "minWidth" : "minHeight";
			let pmax;
			let pmin;
			let pmaxPerc = 0;
			let pminPerc = Infinity;

			this.#pans.forEach( p => {
				const st = GSUgetStyle( p );
				const perc = parseFloat( st[ this.#dir ] ) / parseFloat( st[ mindir ] );

				if ( perc > pmaxPerc ) {
					pmax = p;
					pmaxPerc = perc;
				}
				if ( perc < pminPerc ) {
					pmin = p;
					pminPerc = perc;
				}
			} );

			const pan = tot2 / tot > 1
				? pmaxPerc > 1 ? pmax : null
				: pminPerc < Infinity ? pmin : null;

			if ( pan ) {
				const perc = tot2 / tot * 100 - 100;

				pan.style[ this.#dir ] = `${ parseFloat( pan.style[ this.#dir ] ) - perc }%`;
			}
		}
		this.#pans.reduce( ( x, p ) => {
			p.style[ this.#pos ] = `${ GSUmathFix( x / tot * 100, 2 ) }%`;
			return x + GSUdomBCR( p )[ this.#dir ];
		}, 0 );
	}
	#onpointerdown( e ) {
		const tar = e.target;
		const pan = tar.parentNode;

		if ( e.button === 0 && pan.parentNode === this && GSUdomHasClass( tar, "gsuiPanels-extend" ) ) {
			const pInd = this.#pans.indexOf( pan );

			this.#extend = tar;
			this.#pageN = this.#dirX ? e.pageX : e.pageY;
			this.#panBefore = this.#pans.slice( 0, pInd ).reverse();
			this.#panAfter = this.#pans.slice( pInd );
			this.#panAfterMinSize = this.#panAfter.reduce( ( n, p ) => {
				return n + parseFloat( GSUgetStyle( p )[ `min-${ this.#dir }` ] ) || 10;
			}, 0 );
			this.style.cursor = this.#dirX ? "col-resize" : "row-resize";
			GSUdomAddClass( tar, "gsui-hover" );
			GSUdomUnselect();
			this.setPointerCapture( e.pointerId );
			this.onpointerup = this.#onpointerup.bind( this );
			this.onpointermove = this.#onpointermove.bind( this );
		}
	}
	#onpointerup( e ) {
		this.style.cursor = "";
		GSUdomRmClass( this.#extend, "gsui-hover" );
		this.releasePointerCapture( e.pointerId );
		this.onpointermove =
		this.onpointerup = null;
	}
	#onpointermove( e ) {
		const px = Math.round( ( this.#dirX ? e.pageX : e.pageY ) - this.#pageN );
		const parentsize = this.#dirX ? this.clientWidth : this.clientHeight;
		const currBeforeSize = this.#panBefore.reduce( ( n, p ) => n + parseFloat( GSUgetStyle( p )[ this.#dir ] ), 0 );
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

GSUdomDefine( "gsui-panels", gsuiPanels );
