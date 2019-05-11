"use strict";

class gsuiPanels {
	constructor( root ) {
		this.rootElement = root;
		this._cursorElem = document.createElement( "div" );
		this._cursorElem.className = "gsuiPanels-cursor";
		this._dataPerPanel = new Map();
	}
	attached() {
		this._init();
		this.resized();
	}
	resized() {
		this._panWidth.forEach( this._setSizeClass.bind( this, "width" ) );
		this._panHeight.forEach( this._setSizeClass.bind( this, "height" ) );
	}

	// private:
	_init() {
		const root = this.rootElement,
			qsa = ( c, fn ) => root.querySelectorAll( `.gsuiPanels-${ c }` ).forEach( fn );

		root.style.overflow = "hidden";
		qsa( "extend", el => el.remove() );
		qsa( "last", el => el.classList.remove( "gsuiPanels-last" ) );
		this._convertFlex( root.classList.contains( "gsuiPanels-x" ) ? "width" : "height", root );
		qsa( "x", this._convertFlex.bind( this, "width" ) );
		qsa( "y", this._convertFlex.bind( this, "height" ) );
		qsa( "x > div + div", this._addExtend.bind( this, "width" ) );
		qsa( "y > div + div", this._addExtend.bind( this, "height" ) );
		this._panWidth = root.querySelectorAll( "[data-width-class]" );
		this._panHeight = root.querySelectorAll( "[data-height-class]" );
		this._panWidth.forEach( this._parseSizeClassAttr.bind( this, "width" ) );
		this._panHeight.forEach( this._parseSizeClassAttr.bind( this, "height" ) );
		window.addEventListener( "resize", this.resized.bind( this ) );
	}
	_getChildren( el ) {
		return Array.from( el.children ).filter(
			el => !el.classList.contains( "gsuiPanels-extend" ) );
	}
	_parseSizeClassAttr( dir, pan ) {
		const hasData = this._dataPerPanel.get( pan ),
			data = hasData
				? hasData
				: {
					width: { less: [], more: [] },
					height: { less: [], more: [] },
				},
			{ less, more } = data[ dir ];

		if ( !hasData ) {
			this._dataPerPanel.set( pan, data );
		}
		pan.dataset[ `${ dir }Class` ].split( " " )
			.forEach( w => {
				const [ size, clazz ] = w.split( ":" ),
					arr = size[ 0 ] === "<" ? less : more;

				arr.push( [ +size.substr( 1 ), clazz ] );
			} );
	}
	_convertFlex( dir, panPar ) {
		const pans = this._getChildren( panPar ),
			size = dir === "width"
				? panPar.clientWidth
				: panPar.clientHeight;

		pans[ pans.length - 1 ].classList.add( "gsuiPanels-last" );
		pans.map( pan => pan.getBoundingClientRect()[ dir ] )
			.forEach( ( panW, i ) => {
				pans[ i ].style[ dir ] = `${ panW / size * 100 }%`;
			} );
	}
	_addExtend( dir, pan ) {
		const extend = document.createElement( "div" ),
			pans = this._getChildren( pan.parentNode ),
			panBefore = pans.filter( el => !el.classList.contains( "gsuiPanels-extend" ) &&
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_PRECEDING
			).reverse(),
			panAfter = pans.filter( el => !el.classList.contains( "gsuiPanels-extend" ) && (
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_FOLLOWING || pan === el
			) );

		extend.className = "gsuiPanels-extend";
		extend.onmousedown = this._onmousedownExtend.bind( this, dir, extend, panBefore, panAfter );
		pan.append( extend );
	}
	_incrSizePans( dir, mov, pans ) {
		const parentsize = this._parentSize;

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
					this._setSizeClass( dir, pan );
					if ( pan.onresizing ) {
						pan.onresizing( pan );
					}
				}
			}
			return ret;
		}, mov );
	}
	_setSizeClass( dir, pan ) {
		const panData = this._dataPerPanel.get( pan );

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

	// events:
	_onmouseup() {
		this._cursorElem.remove();
		this._extend.classList.remove( "gsui-hover" );
		this.rootElement.classList.remove( "gsuiPanels-noselect" );
		delete gsuiPanels._focused;
	}
	_onmousemove( e ) {
		const dir = this._dir,
			px = ( dir === "width" ? e.pageX : e.pageY ) - this._pageN,
			mov = px - this._incrSizePans( dir, px, this._panBefore );

		this._pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			this._incrSizePans( dir, -mov, this._panAfter );
		}
	}
	_onmousedownExtend( dir, ext, panBefore, panAfter, e ) {
		gsuiPanels._focused = this;
		ext.classList.add( "gsui-hover" );
		this._cursorElem.style.cursor = dir === "width" ? "col-resize" : "row-resize";
		document.body.append( this._cursorElem );
		this.rootElement.classList.add( "gsuiPanels-noselect" );
		this._dir = dir;
		this._extend = ext;
		this._pageN = dir === "width" ? e.pageX : e.pageY;
		this._panBefore = panBefore;
		this._panAfter = panAfter;
		this._parent = ext.parentNode.parentNode;
		this._parentSize = dir === "width"
			? this._parent.clientWidth
			: this._parent.clientHeight;
	}
}

document.addEventListener( "mousemove", e => {
	gsuiPanels._focused && gsuiPanels._focused._onmousemove( e );
} );
document.addEventListener( "mouseup", e => {
	gsuiPanels._focused && gsuiPanels._focused._onmouseup( e );
} );
