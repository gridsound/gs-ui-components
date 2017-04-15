"use strict";

function gsuiSpanEditable( root ) {
	this.rootElement = root;
	this.span = root.querySelector( "span" );
	this.input = root.querySelector( "input" );

	root.ondblclick = this._dblclick.bind( this );
	this.input.onblur = this._blur.bind( this );
	this.input.onkeydown = this._keydown.bind( this );
	this.setPlaceholder( "" );
}

gsuiSpanEditable.prototype = {
	getValue: function() {
		return this.value;
	},
	setValue: function( val, call ) {
		val = val.trim();
		if ( val === this.placeholder ) {
			val = "";
		}
		this.rootElement.classList.toggle( "gsui-empty", !val );
		this.span.textContent = val || this.placeholder;
		if ( val !== this.value ) {
			this.value = val;
			if ( call && this.onchange ) {
				this.onchange( val );
			}
		}
	},
	setPlaceholder: function( s ) {
		this.placeholder = s.trim();
		if ( !this.value ) {
			this.setValue( s );
		}
	},

	// private:
	_dblclick: function( e ) {
		this.input.value = this.value;
		this.rootElement.classList.add( "gsui-editing" );
		this.input.focus();
		this.input.select();
	},
	_blur: function( e ) {
		if ( !this._esc ) {
			this.setValue( e.target.value, true );
			this.rootElement.classList.remove( "gsui-editing" );
		}
		this._esc = false;
	},
	_keydown: function( e ) {
		e.stopPropagation();
		if ( e.keyCode === 13 || e.keyCode === 27 ) {
			this._esc = e.keyCode === 27;
			if ( !this._esc ) {
				this.setValue( e.target.value, true );
			}
			this.rootElement.classList.remove( "gsui-editing" );
		}
	}
};
