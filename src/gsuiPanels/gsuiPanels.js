"use strict";

function gsuiPanels() {
	var root = document.createElement( "div" );

	this._init();
	root.className = "gsuiPanels";
	this.rootElement = root;
	this._nbPanels = 0;
	this._nlPanels = root.childNodes;
	this.axe( "x" );
}

gsuiPanels.prototype = {
	axe( axe ) {
		var w, axeX = axe === "x";

		if ( axeX !== this._axeX ) {
			this._axeX = axeX;
			this.rootElement.classList.remove( "gsui-axeX", "gsui-axeY" );
			this.rootElement.classList.add( "gsui-axe" + ( axeX ? "X" : "Y" ) );
			this._nlPanels.forEach( function( panel ) {
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
		var ext, div = document.createElement( "div" );

		div.className = "gsui-panel";
		div.style.width = this._axeX ? perc + "%" : "100%";
		div.style.height = this._axeX ? "100%" : perc + "%";
		if ( this._nlPanels.length < this._nbPanels - 1 ) {
			ext = document.createElement( "div" );
			ext.className = "gsui-extend";
			ext.onmousedown = this._evmdExtends.bind( this, this._nlPanels.length, div, ext );
			div.append( ext );
		}
		this.rootElement.append( div );
		return div;
	},
	_incPan( ind, perc ) {
		var pan = this._nlPanels[ ind ],
			panSize = pan[ this._axeX ? "offsetWidth" : "offsetHeight" ] / this._rootPx * 100;

		if ( perc < 0 ) {
			perc = -Math.min( -perc, panSize - this._panelMinPerc );
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
				percInc = ( this._axeX ? e.movementX : e.movementY ) / this._rootPx * 100,
				percIncSave = percInc;

			if ( percInc < 0 ) {
				for ( ; panInd >= 0 && percInc < 0; --panInd ) {
					percInc -= this._incPan( panInd, percInc );
				}
				this._incPan( this._panelInd + 1, -percIncSave + percInc );
			} else {
				while ( percInc > 0 && ++panInd < this._nlPanels.length ) {
					percInc += this._incPan( panInd, -percInc );
				}
				this._incPan( this._panelInd, percIncSave - percInc );
			}
		}
	},
	_evmdExtends( panelInd, elPanel, elExtend, e ) {
		var rootBCR = this.rootElement.getBoundingClientRect(),
			panelCS = getComputedStyle( elPanel ),
			panMin = parseFloat( this._axeX ? panelCS.minWidth : panelCS.minHeight );

		this._panelInd = panelInd;
		this._elPanel = elPanel;
		this._elExtend = elExtend;
		this._rootPx = this._axeX ? rootBCR.width : rootBCR.height;
		this._panelMinPerc = panMin / this._rootPx * 100;
		this.rootElement.classList.add( "gsui-noselect" );
		elExtend.classList.add( "gsui-hover" );
		gsuiPanels._focused = this;
	}
};
