"use strict";

function gsuiPanels() {
	var root = document.createElement( "div" );

	this._init();
	root.className = "gsuiPanels";
	this.rootElement = root;
	this.panels = root.childNodes;
	this._nbPanels = 0;
	this._panelDims = [];
	this.axe( "x" );
}

gsuiPanels.prototype = {
	resized() {
		this._cacheCSS();
		this.panels.forEach( this._resizedPan );
	},
	axe( axe ) {
		var w, axeX = axe === "x";

		if ( axeX !== this._axeX ) {
			this._axeX = axeX;
			this.rootElement.classList.remove( "gsui-axeX", "gsui-axeY" );
			this.rootElement.classList.add( "gsui-axe" + ( axeX ? "X" : "Y" ) );
			this._cacheCSS();
			this.panels.forEach( function( panel ) {
				w = panel.style.width;
				panel.style.width = panel.style.height;
				panel.style.height = w;
			} );
		}
	},
	nbPanels( nb ) {
		var ret = [],
			diff = nb - this._nbPanels;

		this._nbPanels = nb;
		if ( diff < 0 ) {
			while ( diff++ < 0 ) {
				ret.push( this.rootElement.removeChild( this.rootElement.lastChild ) );
				this._panelDims.pop();
			}
		} else if ( diff > 0 ) {
			while ( diff-- > 0 ) {
				ret.push( this._newPanel( 1 / nb * 100 ) );
			}
		}
		return ret;
	},

	// private:
	_init() {
		if ( !gsuiPanels._init ) {
			gsuiPanels._init = true;
			document.body.addEventListener( "mousemove", function( e ) {
				gsuiPanels._focused && gsuiPanels._focused._evmmRoot( e );
			} );
			document.body.addEventListener( "mouseup", function( e ) {
				gsuiPanels._focused && gsuiPanels._focused._evmuRoot( e );
			} );
		}
	},
	_cacheCSS() {
		var axeX = this._axeX,
			rootBCR = this.rootElement.getBoundingClientRect();

		this._rootSize = ( axeX ? rootBCR.width : rootBCR.height ) / 100;
		this.panels.forEach( function( pan, i ) {
			var sty = getComputedStyle( pan ),
				obj = {
					min: parseFloat( axeX ? sty.minWidth : sty.minHeight ) / this._rootSize,
					max: parseFloat( axeX ? sty.maxWidth : sty.maxHeight ) / this._rootSize
				};

			obj.min = obj.min || 1;
			obj.max = obj.max || Infinity;
			if ( i < this._panelDims.length ) {
				this._panelDims[ i ] = obj;
			} else {
				this._panelDims.push( obj );
			}
		}, this );
	},
	_newPanel( perc ) {
		var div = document.createElement( "div" ),
			ext = document.createElement( "div" );

		div.className = "gsui-panel";
		ext.className = "gsui-extend";
		ext.onmousedown = this._evmdExtends.bind( this, this.panels.length, div, ext );
		div.append( ext );
		this.rootElement.append( div );
		return div;
	},
	_resizedPan( pan ) {
		pan.onresize && pan.onresize( pan.offsetWidth, pan.offsetHeight );
	},
	_incPan( ind, perc, changeDom ) {
		var pan = this.panels[ ind ],
			panDim = this._panelDims[ ind ],
			panSize = pan[ this._axeX ? "offsetWidth" : "offsetHeight" ] / this._rootSize;

		perc = perc < 0
			? -Math.min( -perc, panSize - panDim.min )
			: Math.min( perc, panDim.max - panSize );
		if ( changeDom ) {
			pan.style[ this._axeX ? "width" : "height" ] = panSize + perc + "%";
			this._resizedPan( pan );
		}
		return perc;
	},

	// events:
	_evmdExtends( panelInd, elPanel, elExtend ) {
		this._cacheCSS();
		this._panelInd = panelInd;
		this._elPanel = elPanel;
		this._elExtend = elExtend;
		this.rootElement.classList.add( "gsui-noselect" );
		elExtend.classList.add( "gsui-hover" );
		gsuiPanels._focused = this;
	},
	_evmuRoot( e ) {
		if ( this._elExtend ) {
			this._elExtend.classList.remove( "gsui-hover" );
			delete this._elExtend;
			delete this._elPanel;
		}
		this.rootElement.classList.remove( "gsui-noselect" );
		delete gsuiPanels._focused;
	},
	_evmmRoot( e ) {
		if ( this._elExtend ) {
			var tmp,
				percInc = ( this._axeX ? e.movementX : e.movementY ) / this._rootSize,
				percIncSave = percInc,
				percIncTmp = 0,
				panInd = this._panelInd;

			if ( percInc < 0 ) {
				++panInd;
				for ( ; percInc < 0 && panInd < this.panels.length; ++panInd ) {
					tmp = this._incPan( panInd, -percInc );
					percInc += tmp;
					percIncTmp -= tmp;
				}
				panInd = this._panelInd;
				percInc = percIncTmp;
				for ( ; percInc < 0 && panInd >= 0; --panInd ) {
					percInc -= this._incPan( panInd, percInc, true );
				}
				panInd = this._panelInd + 1;
				percInc = percIncSave - percInc;
				for ( ; percInc < 0 && panInd < this.panels.length; ++panInd ) {
					percInc += this._incPan( panInd, -percInc, true );
				}
			} else {
				for ( ; percInc > 0 && panInd >= 0; --panInd ) {
					tmp = this._incPan( panInd, percInc );
					percInc -= tmp;
					percIncTmp += tmp;
				}
				panInd = this._panelInd + 1;
				percInc = percIncTmp;
				for ( ; percInc > 0 && panInd < this.panels.length; ++panInd ) {
					percInc += this._incPan( panInd, -percInc, true );
				}
				panInd = this._panelInd;
				percInc = percIncSave - percInc;
				for ( ; percInc > 0 && panInd >= 0; --panInd ) {
					percInc -= this._incPan( panInd, percInc, true );
				}
			}
		}
	}
};
