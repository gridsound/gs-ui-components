"use strict";

function gsuiSample() {
	var root = this._clone();

	this.rootElement = root;
	this._elName = root.querySelector( ".gsui-name" );
	this._elCnt = root.querySelector( ".gsui-content" );
	this._elCropA = root.querySelector( ".gsui-crop.gsui-a" );
	this._elCropB = root.querySelector( ".gsui-crop.gsui-b" );

	this._elCropA.onmousedown =
	this._elCropB.onmousedown = this._evmdExtend.bind( this );
	this._obj = {
		data: null,
		selected: false,
		when: 0,
		offset: 0,
		duration: 0,
	};
}

gsuiSample.prototype = {
	change( obj ) {
		var { name: name,
			data: dat,
			selected: sel,
			when: w,
			offset: off,
			duration: dur } = obj,
			_obj = this._obj;

		name != null && this._name( name );
		sel != null && this._select( sel );
		w != null && this._when( w );
		if ( dat !== undefined || off != null || dur != null ) {
			dur != null && this._duration( dur );
			this._drawData( dat || _obj.data,
				off != null ? off : _obj.offset,
				dur != null ? dur : _obj.duration );
		}
		Object.assign( _obj, obj );
	},
	changeRel( obj ) {
		var nObj = {};

		if ( obj.when ) { nObj.when = this._obj.when + obj.when; }
		if ( obj.offset ) { nObj.offset = this._obj.offset + obj.offset; }
		if ( obj.duration ) { nObj.duration = this._obj.duration + obj.duration; }
		this.change( nObj );
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiSample.template = gsuiSample.template || this._init();
		div.appendChild( document.importNode( gsuiSample.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiSample._focused && gsuiSample._focused._evmmBody( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiSample._focused && gsuiSample._focused._evmuBody( e );
		} );
		return document.getElementById( "gsuiSample" );
	},
	_name( n ) {
		this._elName.textContent = n;
	},
	_select( b ) {
		this.rootElement.classList.toggle( "gsui-selected", b );
	},
	_when( em ) {
		this.rootElement.style.left = em + "em";
	},
	_duration( em ) {
		this.rootElement.style.width = em + "em";
	},
	_drawData( dat, off, dur ) {
		if ( dat instanceof AudioBuffer ) {
			var cmp = this._uiContentCmp;

			if ( !cmp ) {
				this._uiContentCmp = cmp = new gsuiWaveform();
				cmp.setResolution( 512, 32 );
				this._elCnt.append( cmp.rootElement );
			}
			cmp.drawBuffer( dat, off, dur );
		}
	},

	// events:
	_evmmBody( e ) {
		if ( gsuiSample._focused ) {
		}
	},
	_evmuBody( e ) {
		if ( gsuiSample._focused ) {
			delete gsuiSample._focused;
		}
	},
	_evmdExtend( e ) {
		var tar = e.target,
			left = tar.classList.contains( "gsui-a" );

		gsuiSample._focused = this;
	}
};
