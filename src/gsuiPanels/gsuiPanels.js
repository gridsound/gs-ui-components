"use strict";

function gsuiPanels() {
	var root = document.createElement( "div" );

	this._init();
	root.className = "gsuiPanels";
	this.rootElement = root;
	this.panels = root.childNodes;
	this._nbPanels = 0;
	this._panelSizes = [];
	this.axe( "x" );
}

gsuiPanels.prototype = {
	cacheCSS() {
		var axeX = this._axeX,
			rootBCR = this.rootElement.getBoundingClientRect();

		this._rootSize = ( axeX ? rootBCR.width : rootBCR.height ) / 100;
		this.panels.forEach( function( pan, i ) {
			var sty = getComputedStyle( pan ),
				min = parseFloat( axeX ? sty.minWidth : sty.minHeight ) / this._rootSize,
				max = parseFloat( axeX ? sty.maxWidth : sty.maxHeight ) / this._rootSize;

			this._panelSizes[ i ] = { min, max };
		}, this );
	},
	axe( axe ) {
		var w, axeX = axe === "x";

		if ( axeX !== this._axeX ) {
			this._axeX = axeX;
			this.rootElement.classList.remove( "gsui-axeX", "gsui-axeY" );
			this.rootElement.classList.add( "gsui-axe" + ( axeX ? "X" : "Y" ) );
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
				this._panelSizes.pop();
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
	_newPanel( perc ) {
		var div = document.createElement( "div" ),
			ext = document.createElement( "div" );

		div.className = "gsui-panel";
		ext.className = "gsui-extend";
		div.style.width = this._axeX ? perc + "%" : "100%";
		div.style.height = this._axeX ? "100%" : perc + "%";
		ext.onmousedown = this._evmdExtends.bind( this, this.panels.length, div, ext );
		div.append( ext );
		this.rootElement.append( div );
		return div;
	},
	_incPan( ind, perc ) {
		var pan = this.panels[ ind ],
			panSize = pan[ this._axeX ? "offsetWidth" : "offsetHeight" ] / this._rootSize;

		if ( perc < 0 ) {
			perc = -Math.min( -perc, panSize - this._panelSizes[ ind ].min );
		}
		pan.style[ this._axeX ? "width" : "height" ] = panSize + perc + "%";
		return perc;
	},

	// events:
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
			var panInd = this._panelInd,
				percInc = ( this._axeX ? e.movementX : e.movementY ) / this._rootSize,
				percIncSave = percInc;

			if ( percInc < 0 ) {
				for ( ; panInd >= 0 && percInc < 0; --panInd ) {
					percInc -= this._incPan( panInd, percInc );
				}
				this._incPan( this._panelInd + 1, -percIncSave + percInc );
			} else {
				while ( percInc > 0 && ++panInd < this.panels.length ) {
					percInc += this._incPan( panInd, -percInc );
				}
				this._incPan( this._panelInd, percIncSave - percInc );
			}
		}
	},
	_evmdExtends( panelInd, elPanel, elExtend ) {
		this.cacheCSS();
		this._panelInd = panelInd;
		this._elPanel = elPanel;
		this._elExtend = elExtend;
		this.rootElement.classList.add( "gsui-noselect" );
		elExtend.classList.add( "gsui-hover" );
		gsuiPanels._focused = this;
	}
};
