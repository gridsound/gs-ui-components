"use strict";

function gsuiAudioBlock() {
	var root = this._clone();

	root.gsuiAudioBlock = this;
	root.querySelectorAll( "*" ).forEach( function( el ) {
		el.gsuiAudioBlock = this;
	}, this );
	this.rootElement = root;
	this._elName = root.querySelector( ".gsuiab-name" );
	this._elCnt = root.querySelector( ".gsuiab-content" );
	this._elCropA = root.querySelector( ".gsuiab-cropA" );
	this._elCropB = root.querySelector( ".gsuiab-cropB" );
	this._elCropA.onmousedown =
	this._elCropB.onmousedown = this._evmdCrop.bind( this );
	root.onmousedown = this._evmdRoot.bind( this );
	this.selected = false;
}

gsuiAudioBlock.typeToCmp = {
	buffer: "gsuiWaveform",
	keys: "gsuiRectMatrix"
};

gsuiAudioBlock.prototype = {
	setResolution( w, h ) {
		this.resW = w;
		this.resH = h;
		if ( this._uiContentCmp ) {
			this._uiContentCmp.setResolution( w, h );
		}
	},
	name( n ) {
		this._elName.textContent = n;
	},
	select( b ) {
		this.rootElement.classList.toggle( "gsuiab-selected",
			this.selected = !!b );
	},
	when( em ) {
		this.rootElement.style.left = em + "em";
	},
	whenOffset( em ) {
		this._elCnt.style.left = parseFloat( this._elCnt.style.left || 0 ) -
			em + parseFloat( this.rootElement.style.left || 0 ) + "em";
		this.when( em );
	},
	duration( em ) {
		this.rootElement.style.width =
		this.width = em + "em";
	},
	contentWidthFixed() {
		this._elCnt.style.width = this.width;
	},
	contentWidthExtendable() {
		this._elCnt.style.width = "100%";
	},
	datatype( type ) {
		if ( type !== this._datatype ) {
			this._datatype =
			this.rootElement.dataset.type = type;
			if ( this._uiContentCmp ) {
				this._uiContentCmp.remove();
				delete this._uiContentCmp;
			}
		}
	},
	updateData( dat, off, dur ) {
		var cmp = this._uiContentCmp;

		this._dataDur = dat.duration;
		this._elCnt.style.left = 0;
		if ( !cmp ) {
			this._uiContentCmp =
			cmp = new window[ gsuiAudioBlock.typeToCmp[ this._datatype ] ];
			this._elCnt.append( cmp.rootElement );
			if ( this.resW ) {
				this.setResolution( this.resW, this.resH );
			} else {
				this.setResolution( cmp.rootElement.getBoundingClientRect().width, 32 );
			}
		}
		cmp.render( dat, off, dur );
	},
	start( bpm ) {
		var cur = document.createElement( "div" );

		this.stop();
		cur.className = "gsuiab-cursor";
		cur.style.animationDuration = this._dataDur * 60 / ( bpm || 60 ) + "s";
		this._elCursor = cur;
		this._elCnt.append( cur );
	},
	stop() {
		if ( this._elCursor ) {
			this._elCursor.remove();
			delete this._elCursor;
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
		if ( e.button === 0 ) {
			this._isDragging = true;
			this.onmousedown && this.onmousedown( this, e );
			gsuiAudioBlock._focused = this;
		}
	},
	_evmmBody( e ) {
		if ( gsuiAudioBlock._focused ) {
			if ( this._elCropping ) {
				this.onmousemoveCrop && this.onmousemoveCrop( this, +this._cropSide, e );
			} else if ( this._isDragging ) {
				this.onmousemove && this.onmousemove( this, e );
			}
		}
	},
	_evmuBody( e ) {
		if ( gsuiAudioBlock._focused ) {
			if ( this._elCropping ) {
				this._elCropping.classList.remove( "hover" );
				this.onmouseupCrop && this.onmouseupCrop( this, +this._cropSide, e );
				delete this._elCropping;
			} else if ( this._isDragging ) {
				this.onmouseup && this.onmouseup( this, e );
				delete this._isDragging;
			}
			delete gsuiAudioBlock._focused;
		}
	},
	_evmdCrop( e ) {
		if ( e.button === 0 ) {
			e.stopPropagation();
			this._elCropping = e.target;
			this._cropSide = e.target === this._elCropB;
			e.target.classList.add( "hover" );
			this.onmousedownCrop && this.onmousedownCrop( this, +this._cropSide, e );
			gsuiAudioBlock._focused = this;
		}
	}
};
