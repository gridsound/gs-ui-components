"use strict";

class gsuiPanels {
	constructor( root ) {
		this.rootElement = root;
		this._cursorElem = document.createElement( "div" );
		this._cursorElem.className = "gsuiPanels-cursor";

		root.style.overflow = "hidden";
		root.querySelectorAll( ".gsuiPanels-extend" ).forEach( el => el.remove() );
		this._convertFlex( root.classList.contains( "gsuiPanels-x" )
			? "width" : "height", root );
		root.querySelectorAll( ".gsuiPanels-x" ).forEach( this._convertFlex.bind( this, "width" ) );
		root.querySelectorAll( ".gsuiPanels-y" ).forEach( this._convertFlex.bind( this, "height" ) );
		root.querySelectorAll( ".gsuiPanels-x > div + div" ).forEach( this._addExtend.bind( this, "width" ) );
		root.querySelectorAll( ".gsuiPanels-y > div + div" ).forEach( this._addExtend.bind( this, "height" ) );
	}

	// private:
	_getChildren( el ) {
		return Array.from( el.children ).filter(
			el => !el.classList.contains( "gsuiPanels-extend" ) );
	}
	_convertFlex( dir, panPar ) {
		const pans = this._getChildren( panPar ),
			sizePans = pans.map( pan => pan.getBoundingClientRect()[ dir ] ),
			size = sizePans.reduce( ( n, pan ) => n + pan, 0 );

		pans.pop();
		pans.forEach( ( pan, i ) => {
			pan.style[ dir ] = sizePans[ i ] / size * 100 + "%";
			pan.style.flex = "none";
		} );
	}
	_addExtend( dir, pan ) {
		const extend = document.createElement( "div" ),
			pans = this._getChildren( pan.parentNode ),
			panBefore = pans.filter( el => (
				!el.classList.contains( "gsuiPanels-extend" ) &&
					pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_PRECEDING
			) ).reverse(),
			panAfter = pans.filter( ( el, i ) => (
				i < pans.length - 1 &&
				!el.classList.contains( "gsuiPanels-extend" ) && (
					pan === el ||
					pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_FOLLOWING
				)
			) );

		extend.className = "gsuiPanels-extend";
		extend.onmousedown = this._onmousedownExtend.bind( this, dir, extend, panBefore, panAfter );
		pan.append( extend );
	}
	_incrSizePans( dir, mov, pans ) {
		const parentsize = this._parentSize;

		return pans.reduce( ( mov, pan ) => {
			if ( Math.abs( mov ) > .1 ) {
				const style = getComputedStyle( pan ),
					size = pan.getBoundingClientRect()[ dir ],
					minsize = parseFloat( style[ "min-" + dir ] ) || 10,
					maxsize = parseFloat( style[ "max-" + dir ] ) || Infinity,
					newsizeCorrect = Math.max( minsize, Math.min( size + mov, maxsize ) );

				if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
					pan.style.flex = "none";
					pan.style[ dir ] = newsizeCorrect / parentsize * 100 + "%";
					mov -= newsizeCorrect - size;
					if ( pan.onresizing ) {
						pan.onresizing( pan );
					}
				}
			}
			return mov;
		}, mov );
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

		if ( Math.abs( mov ) > .1 ) {
			this._incrSizePans( dir, -mov, this._panAfter );
		}
		this._pageN += mov;
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
