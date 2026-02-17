"use strict";

class gsuiPanels extends gsui0ne {
	#dirX = false;
	#pos = "";
	#dir = "";
	#mindir = "";
	#maxdir = "";
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
		const dirX = this.$this.$getAttr( "dir" ) === "x";
		const size = dirX ? this.$this.$width() : this.$this.$height();

		this.#pans = Array.from( this.children ).map( p => $( p ) );
		this.#dirX = dirX;
		this.#pos = dirX ? "left" : "top";
		this.#dir = dirX ? "width" : "height";
		this.#mindir = dirX ? "minWidth" : "minHeight";
		this.#maxdir = dirX ? "maxWidth" : "maxHeight";
		this.$this.$query( ".gsuiPanels-extend" ).$remove();
		this.#pans.map( p => [ p, p.$bcr()[ this.#dir ] / size * 100 ] )
			.reduce( ( x, [ pan, perc ] ) => {
				const perc2 = GSUmathFix( perc, 1 );

				pan
					.$addClass( "gsuiPanels-panel" )
					.$css( this.#dir, perc2, "%" )
					.$css( this.#pos, x, "%" );
				if ( x > 0 ) {
					pan.$append( GSUcreateDiv( { class: "gsuiPanels-extend" } ) );
				}
				return x + perc2;
			}, 0 );
	}
	#incrSizePans( dir, mov, parentsize, pans ) {
		return pans.reduce( ( mov, pan ) => {
			const size = Math.round( pan.$bcr()[ dir ] );
			const minsize = parseFloat( pan.$css( this.#mindir ) ) || 10;
			const maxsize = parseFloat( pan.$css( this.#maxdir ) ) || Infinity;
			const newsizeCorrect = Math.round( GSUmathClamp( size + mov, minsize, maxsize ) );
			let ret = mov;

			if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
				pan.$css( dir, GSUmathFix( newsizeCorrect / parentsize * 100, 2 ), "%" );
				ret -= newsizeCorrect - size;
			}
			return ret;
		}, mov );
	}

	// .........................................................................
	$onresize() {
		const tot = this.$this.$bcr()[ this.#dir ];
		const tot2 = this.#pans.reduce( ( sz, p ) => sz + p.$bcr()[ this.#dir ], 0 );

		if ( Math.abs( tot2 - tot ) > 0 ) {
			let pmax;
			let pmin;
			let pmaxPerc = 0;
			let pminPerc = Infinity;

			this.#pans.forEach( p => {
				const perc = parseFloat( p.$css( this.#dir ) ) / parseFloat( p.$css( this.#mindir ) );

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

				pan.$css( this.#dir, parseFloat( pan.$get( 0 ).style[ this.#dir ] ) - perc, "%" );
			}
		}
		this.#pans.reduce( ( x, p ) => {
			p.$css( this.#pos, GSUmathFix( x / tot * 100, 2 ), "%" );
			return x + p.$bcr()[ this.#dir ];
		}, 0 );
	}
	#onpointerdown( e ) {
		const tar = $( e.target );
		const pan = tar.$parent();

		if ( e.button === 0 && pan.$parent().$is( this ) && tar.$hasClass( "gsuiPanels-extend" ) ) {
			const pInd = pan.$index( 0 );

			this.#extend = tar;
			this.#pageN = this.#dirX ? e.pageX : e.pageY;
			this.#panBefore = this.#pans.slice( 0, pInd ).reverse();
			this.#panAfter = this.#pans.slice( pInd );
			this.#panAfterMinSize = this.#panAfter.reduce( ( n, p ) => {
				return n + parseFloat( p.$css( this.#mindir ) || 10 );
			}, 0 );
			this.$this.$css( "cursor", this.#dirX ? "col-resize" : "row-resize" );
			tar.$addClass( "gsui-hover" );
			GSUdomUnselect();
			this.setPointerCapture( e.pointerId );
			this.onpointerup = this.#onpointerup.bind( this );
			this.onpointermove = this.#onpointermove.bind( this );
		}
	}
	#onpointerup( e ) {
		this.$this.$css( "cursor", "" );
		this.#extend.$rmClass( "gsui-hover" );
		this.releasePointerCapture( e.pointerId );
		this.#extend =
		this.onpointermove =
		this.onpointerup = null;
	}
	#onpointermove( e ) {
		const px = Math.round( ( this.#dirX ? e.pageX : e.pageY ) - this.#pageN );
		const parentsize = this.#dirX ? this.clientWidth : this.clientHeight;
		const currBeforeSize = this.#panBefore.reduce( ( n, p ) => n + parseFloat( p.$css( this.#dir ) ), 0 );
		const px2 = px <= 0 ? px : Math.min( px, parentsize - currBeforeSize - this.#panAfterMinSize );
		const mov = px2 - this.#incrSizePans( this.#dir, px2, parentsize, this.#panBefore );

		this.#pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			this.#incrSizePans( this.#dir, -mov, parentsize, this.#panAfter );
		}
		this.#pans.reduce( ( x, p ) => {
			p.$css( this.#pos, x, "%" );
			return x + parseFloat( p.$get( 0 ).style[ this.#dir ] );
		}, 0 );
	}
}

GSUdomDefine( "gsui-panels", gsuiPanels );
