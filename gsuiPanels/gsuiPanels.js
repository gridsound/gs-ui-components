"use strict";

class gsuiPanels {
	#dataPerPanel = new Map()
	#cursorElem = document.createElement( "div" )
	#panWidth = null
	#panHeight = null
	#dir = ""
	#pageN = 0
	#extend = null
	#parent = null
	#panBefore = null
	#panAfter = null
	#parentSize = 0

	constructor( root ) {
		this.rootElement = root;
		this.#cursorElem = document.createElement( "div" );
		this.#cursorElem.className = "gsuiPanels-cursor";
		this.#dataPerPanel = new Map();
	}
	attached() {
		this.#init();
		this.resized();
	}
	resized() {
		this.#panWidth.forEach( this.#setSizeClass.bind( this, "width" ) );
		this.#panHeight.forEach( this.#setSizeClass.bind( this, "height" ) );
	}

	// .........................................................................
	#init() {
		const root = this.rootElement,
			qsa = ( c, fn ) => root.querySelectorAll( `.gsuiPanels-${ c }` ).forEach( fn );

		root.style.overflow = "hidden";
		qsa( "extend", el => el.remove() );
		qsa( "last", el => el.classList.remove( "gsuiPanels-last" ) );
		this.#convertFlex( root.classList.contains( "gsuiPanels-x" ) ? "width" : "height", root );
		qsa( "x", this.#convertFlex.bind( this, "width" ) );
		qsa( "y", this.#convertFlex.bind( this, "height" ) );
		qsa( "x > div + div", this.#addExtend.bind( this, "width" ) );
		qsa( "y > div + div", this.#addExtend.bind( this, "height" ) );
		this.#panWidth = root.querySelectorAll( "[data-width-class]" );
		this.#panHeight = root.querySelectorAll( "[data-height-class]" );
		this.#panWidth.forEach( this.#parseSizeClassAttr.bind( this, "width" ) );
		this.#panHeight.forEach( this.#parseSizeClassAttr.bind( this, "height" ) );
		window.addEventListener( "resize", this.resized.bind( this ) );
	}
	#getChildren( el ) {
		return Array.from( el.children ).filter(
			el => !el.classList.contains( "gsuiPanels-extend" ) );
	}
	#parseSizeClassAttr( dir, pan ) {
		const hasData = this.#dataPerPanel.get( pan ),
			data = hasData
				? hasData
				: {
					width: { less: [], more: [] },
					height: { less: [], more: [] },
				},
			{ less, more } = data[ dir ];

		if ( !hasData ) {
			this.#dataPerPanel.set( pan, data );
		}
		pan.dataset[ `${ dir }Class` ].split( " " )
			.forEach( w => {
				const [ size, clazz ] = w.split( ":" ),
					arr = size[ 0 ] === "<" ? less : more;

				arr.push( [ +size.substr( 1 ), clazz ] );
			} );
	}
	#convertFlex( dir, panPar ) {
		const pans = this.#getChildren( panPar ),
			size = dir === "width"
				? panPar.clientWidth
				: panPar.clientHeight;

		pans[ pans.length - 1 ].classList.add( "gsuiPanels-last" );
		pans.map( pan => pan.getBoundingClientRect()[ dir ] )
			.forEach( ( panW, i ) => {
				pans[ i ].style[ dir ] = `${ panW / size * 100 }%`;
			} );
	}
	#addExtend( dir, pan ) {
		const extend = document.createElement( "div" ),
			pans = this.#getChildren( pan.parentNode ),
			panBefore = pans.filter( el => !el.classList.contains( "gsuiPanels-extend" ) &&
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_PRECEDING
			).reverse(),
			panAfter = pans.filter( el => !el.classList.contains( "gsuiPanels-extend" ) && (
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_FOLLOWING || pan === el
			) );

		extend.className = "gsuiPanels-extend";
		extend.onmousedown = this.#onmousedownExtend.bind( this, dir, extend, panBefore, panAfter );
		pan.append( extend );
	}
	#incrSizePans( dir, mov, pans ) {
		const parentsize = this.#parentSize;

		return pans.reduce( ( mov, pan ) => {
			let ret = mov;

			if ( Math.abs( mov ) > .1 ) {
				const style = getComputedStyle( pan ),
					size = pan.getBoundingClientRect()[ dir ],
					minsize = parseFloat( style[ `min-${ dir }` ] ) || 10,
					maxsize = parseFloat( style[ `max-${ dir }` ] ) || Infinity,
					newsizeCorrect = Math.max( minsize, Math.min( size + mov, maxsize ) );

				if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
					pan.style[ dir ] = `${ newsizeCorrect / parentsize * 100 }%`;
					if ( mov > 0 ) {
						ret = mov - ( newsizeCorrect - size );
					} else {
						ret = mov + ( size - newsizeCorrect );
					}
					this.#setSizeClass( dir, pan );
					if ( pan.onresizing ) {
						pan.onresizing( pan );
					}
				}
			}
			return ret;
		}, mov );
	}
	#setSizeClass( dir, pan ) {
		const panData = this.#dataPerPanel.get( pan );

		if ( panData ) {
			const { less, more } = panData[ dir ],
				panCl = pan.classList,
				panSize = dir === "width"
					? pan.clientWidth
					: pan.clientHeight;

			less.forEach( c => panCl.toggle( c[ 1 ], panSize < c[ 0 ] ) );
			more.forEach( c => panCl.toggle( c[ 1 ], panSize > c[ 0 ] ) );
		}
	}

	// .........................................................................
	#onmousedownExtend( dir, ext, panBefore, panAfter, e ) {
		gsuiPanels._focused = this;
		ext.classList.add( "gsui-hover" );
		this.#cursorElem.style.cursor = dir === "width" ? "col-resize" : "row-resize";
		document.body.append( this.#cursorElem );
		this.rootElement.classList.add( "gsuiPanels-noselect" );
		this.#dir = dir;
		this.#extend = ext;
		this.#pageN = dir === "width" ? e.pageX : e.pageY;
		this.#panBefore = panBefore;
		this.#panAfter = panAfter;
		this.#parent = ext.parentNode.parentNode;
		this.#parentSize = dir === "width"
			? this.#parent.clientWidth
			: this.#parent.clientHeight;
	}
	_onmouseup() {
		this.#cursorElem.remove();
		this.#extend.classList.remove( "gsui-hover" );
		this.rootElement.classList.remove( "gsuiPanels-noselect" );
		delete gsuiPanels._focused;
	}
	_onmousemove( e ) {
		const dir = this.#dir,
			px = ( dir === "width" ? e.pageX : e.pageY ) - this.#pageN,
			mov = px - this.#incrSizePans( dir, px, this.#panBefore );

		this.#pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			this.#incrSizePans( dir, -mov, this.#panAfter );
		}
	}
}

document.addEventListener( "mousemove", e => {
	gsuiPanels._focused && gsuiPanels._focused._onmousemove( e );
} );
document.addEventListener( "mouseup", e => {
	gsuiPanels._focused && gsuiPanels._focused._onmouseup( e );
} );
