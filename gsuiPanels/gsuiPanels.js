"use strict";

function gsuiPanels( root ) {
	this.rootElement = root;
	this.init( root );
	gsuiPanels.bodyEventsInit && gsuiPanels.bodyEventsInit();
}

gsuiPanels.bodyEventsInit = function() {
	document.addEventListener( "mousemove", function( e ) {
		gsuiPanels._focused && gsuiPanels._focused._onmousemove( e );
	} );
	document.addEventListener( "mouseup", function( e ) {
		gsuiPanels._focused && gsuiPanels._focused._onmouseup( e );
	} );
	delete gsuiPanels.bodyEventsInit;
};

gsuiPanels.prototype = {
	init( root ) {
		root.style.overflow = "hidden";
		root.querySelectorAll( ".gsuiPanels-extend" ).forEach( el => el.remove() );
		if ( root.classList.contains( "gsuiPanels-x" ) ) {
			this._convertFlex( "width", root );
		} else if ( root.classList.contains( "gsuiPanels-y" ) ) {
			this._convertFlex( "height", root );
		}
		root.querySelectorAll( ".gsuiPanels-x" ).forEach( this._convertFlex.bind( this, "width" ) );
		root.querySelectorAll( ".gsuiPanels-y" ).forEach( this._convertFlex.bind( this, "height" ) );
		root.querySelectorAll( ".gsuiPanels-x > div + div" ).forEach( this._addExtend.bind( this, "width" ) );
		root.querySelectorAll( ".gsuiPanels-y > div + div" ).forEach( this._addExtend.bind( this, "height" ) );
	},

	// private:
	_convertFlex( dir, panPar ) {
		var pans = Array.from( panPar.children ),
			size = panPar.getBoundingClientRect()[ dir ],
			sizePans = pans.map( pan => pan.getBoundingClientRect()[ dir ] );

		pans.forEach( function( pan, i ) {
			pan.style[ dir ] = sizePans[ i ] / size * 100 + "%";
			pan.style.flex = "none";
		} );
		pans[ pans.length - 1 ].style.flex = 1;
	},
	_addExtend( dir, pan ) {
		var extend = document.createElement( "div" ),
			panPar = pan.parentNode,
			pans = Array.from( panPar.children ),
			panBefore = pans.filter( function( div ) {
				return !div.classList.contains( "gsuiPanels-extend" ) &&
					pan.compareDocumentPosition( div ) & Node.DOCUMENT_POSITION_PRECEDING;
			} ).reverse(),
			panAfter = pans.filter( function( div ) {
				return !div.classList.contains( "gsuiPanels-extend" ) && (
					pan === div ||
					pan.compareDocumentPosition( div ) & Node.DOCUMENT_POSITION_FOLLOWING
				);
			} );

		extend.className = "gsuiPanels-extend";
		extend.onmousedown = this._onmousedownExtend.bind( this, dir, extend, panBefore, panAfter );
		pan.append( extend );
	},
	_incrSizePans( dir, mov, pans ) {
		var parentsize = this._parentSize;

		return pans.reduce( function( mov, pan ) {
			if ( Math.abs( mov ) > .1 ) {
				var style = getComputedStyle( pan ),
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
	},

	// events:
	_onmouseup() {
		this._extend.classList.remove( "gsui-hover" );
		this.rootElement.classList.remove( "gsuiPanels-noselect" );
		this._panAfter[ this._panAfter.length - 1 ].style.flex = 1;
		delete gsuiPanels._focused;
	},
	_onmousemove( e ) {
		var dir = this._dir,
			axeX = dir === "width",
			mov = ( axeX ? e.pageX : e.pageY ) - this._pageN;

		mov -= this._incrSizePans( dir, mov, this._panBefore );
		if ( Math.abs( mov ) > .1 ) {
			this._incrSizePans( dir, -mov, this._panAfter );
		}
		this._pageN += mov;
	},
	_onmousedownExtend( dir, ext, panBefore, panAfter, e ) {
		gsuiPanels._focused = this;
		ext.classList.add( "gsui-hover" );
		this.rootElement.classList.add( "gsuiPanels-noselect" );
		this._dir = dir;
		this._extend = ext;
		this._pageN = dir === "width" ? e.pageX : e.pageY;
		this._panBefore = panBefore;
		this._panAfter = panAfter;
		this._parent = ext.parentNode.parentNode;
		this._parentSize = this._parent.getBoundingClientRect()[ dir ];
	}
};
