"use strict";

function gsuiSpanEditable() {
	this.rootElement = this._clone();
	this.span = this.rootElement.querySelector( "span" );
	this.input = this.rootElement.querySelector( "input" );
	this.rootElement.ondblclick = this._dblclick.bind( this );
	this.input.onblur = this._blur.bind( this );
	this.input.onkeydown = this._keydown.bind( this );
	this.setPlaceholder( "" );
	this.setValue( "" );
}

gsuiSpanEditable.prototype = {
	setValue( val, call ) {
		val = val.trim();
		if ( val !== this.value ) {
			this.value = val;
			this.rootElement.classList.toggle( "gsui-empty", !val );
			this.span.textContent = val || this.placeholder;
			if ( call && this.onchange ) {
				this.onchange( val );
			}
		}
	},
	setPlaceholder( s ) {
		this.placeholder = s.trim();
		if ( !this.value ) {
			this.span.textContent = this.placeholder;
		}
	},

	// private:
	_clone() {
		var div = document.createElement( "div" ),
			tmp = gsuiSpanEditable.template;

		gsuiSpanEditable.template =
		tmp = tmp || document.getElementById( "gsuiSpanEditable" );
		div.appendChild( document.importNode( tmp.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_dblclick( e ) {
		this.input.value = this.value;
		this.rootElement.classList.add( "gsui-editing" );
		this.input.focus();
		this.input.select();
	},
	_blur( e ) {
		if ( !this._esc ) {
			this.setValue( e.target.value, true );
			this.rootElement.classList.remove( "gsui-editing" );
		}
		this._esc = false;
	},
	_keydown( e ) {
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
