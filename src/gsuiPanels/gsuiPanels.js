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
		if ( axe !== this._axe ) {
			this._axeX = axe === "x";
			this.rootElement.classList.remove( "gsui-axeX", "gsui-axeY" );
			this.rootElement.classList.add( "gsui-axe" + ( this._axeX ? "X" : "Y" ) );
			this._nlPanels.forEach( function( panel ) {
				var w = panel.style.width;

				panel.style.width = panel.style.height;
				panel.style.height = w;
			} );
		}
	},
	nbPanels( nb ) {
		var diff = nb - this._nbPanels;

		if ( diff ) {
			this._nbPanels = nb;
			if ( diff < 0 ) {
				while ( diff++ < 0 ) {
					this.rootElement.lastChild.remove();
				}
			} else {
				while ( diff-- > 0 ) {
					this._newPanel( 1 / nb * 100 );
				}
			}
		}
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
			ext.onmousedown = this._evmdExtends.bind( this, div, ext );
			div._elExtend = ext;
			div.append( ext );
		}
		this.rootElement.append( div );
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
			var inc = this._axeX
					? e.pageX - this._mdPageX
					: e.pageY - this._mdPageY,
				h = ( this._panelSize + inc ) / this._rootSize * 100 + "%",
				nh = ( this._panelNextSize - inc ) / this._rootSize * 100 + "%";

			if ( this._axeX ) {
				this._elPanel.style.width = h;
				this._elPanelNext.style.width = nh;
			} else {
				this._elPanel.style.height = h;
				this._elPanelNext.style.height = nh;
			}
		}
	},
	_evmdExtends( elPanel, elExtend, e ) {
		var elPanelNext = elPanel.nextSibling,
			rootBCR = this.rootElement.getBoundingClientRect(),
			panelBCR = elPanel.getBoundingClientRect(),
			panelNextBCR = elPanelNext.getBoundingClientRect();

		this._mdPageX = e.pageX;
		this._mdPageY = e.pageY;
		this._elPanel = elPanel;
		this._elPanelNext = elPanelNext;
		this._elExtend = elExtend;
		this._rootSize = this._axeX ? rootBCR.width : rootBCR.height;
		this._panelSize = this._axeX ? panelBCR.width : panelBCR.height;
		this._panelNextSize = this._axeX ? panelNextBCR.width : panelNextBCR.height;
		this.rootElement.classList.add( "gsui-noselect" );
		elExtend.classList.add( "gsui-hover" );
		gsuiPanels._focused = this;
	}
};
