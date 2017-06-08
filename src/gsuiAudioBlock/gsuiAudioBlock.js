"use strict";

function gsuiAudioBlock() {
	var root = this._clone();

	this.rootElement = root;
	this._elName = root.querySelector( ".gsui-name" );
	this._elCnt = root.querySelector( ".gsui-content" );
	this._elCropA = root.querySelector( ".gsui-crop.gsui-a" );
	this._elCropB = root.querySelector( ".gsui-crop.gsui-b" );
	this._elCropA.onmousedown =
	this._elCropB.onmousedown = this._evmdCrop.bind( this );
	root.onmousedown = this._evmdRoot.bind( this );
}

gsuiAudioBlock.prototype = {
	name( n ) {
		this._elName.textContent = n;
	},
	select( b ) {
		this.rootElement.classList.toggle( "gsui-selected", b );
	},
	when( em ) {
		this.rootElement.style.left = em + "em";
	},
	duration( em ) {
		this.rootElement.style.width = em + "em";
	},
	datatype( type ) {
		this.rootElement.dataset.type = type;
	},
	updateData( dat, off, dur ) {
		if ( dat instanceof AudioBuffer ) {
			var cmp = this._uiContentCmp;

			if ( !cmp ) {
				this._uiContentCmp = cmp = new gsuiWaveform();
				this._elCnt.append( cmp.rootElement );
			}
			cmp.setResolution( cmp.rootElement.clientWidth, 32 );
			cmp.drawBuffer( dat, off, dur );
		}
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiAudioBlock.template = gsuiAudioBlock.template || this._init();
		div.appendChild( document.importNode( gsuiAudioBlock.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiAudioBlock._focused && gsuiAudioBlock._focused._evmmBody( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiAudioBlock._focused && gsuiAudioBlock._focused._evmuBody( e );
		} );
		return document.getElementById( "gsuiAudioBlock" );
	},

	// events:
	_evmdRoot( e ) {
		this._isDragging = true;
		this.ondrag( "down", e );
		gsuiAudioBlock._focused = this;
	},
	_evmmBody( e ) {
		if ( gsuiAudioBlock._focused ) {
			if ( this._elCropping ) {
				this.oncrop( "move", +this._cropSide, e );
			} else if ( this._isDragging ) {
				this.ondrag( "move", e );
			}
		}
	},
	_evmuBody( e ) {
		if ( gsuiAudioBlock._focused ) {
			if ( this._elCropping ) {
				this._elCropping.classList.remove( "gsui-hover" );
				this.oncrop( "up", +this._cropSide, e );
				delete this._elCropping;
			} else if ( this._isDragging ) {
				this.ondrag( "up", e );
				delete this._isDragging;
			}
			delete gsuiAudioBlock._focused;
		}
	},
	_evmdCrop( e ) {
		e.stopPropagation();
		this._elCropping = e.target;
		this._cropSide = e.target === this._elCropB;
		e.target.classList.add( "gsui-hover" );
		this.oncrop( "down", +this._cropSide, e );
		gsuiAudioBlock._focused = this;
	}
};
