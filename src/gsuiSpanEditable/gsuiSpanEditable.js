"use strict";

function gsuiSpanEditable( element, data ) {
	this.element = element;
	this.data = data;
	this.placeholder = "";
	this.span = element.querySelector( "span" );
	this.input = element.querySelector( "input" );

	element.ondblclick = this.__elementDblclick.bind( this );
	this.input.onblur = this.__inputBlur.bind( this );
	this.input.onkeydown = this.__inputKeydown.bind( this );
}

gsuiSpanEditable.prototype = {
	getValue: function() {
		return this.value;
	},
	setValue: function( val ) {
		val = val.trim();
		if ( val === this.placeholder ) {
			val = "";
		}
		this.element.classList.toggle( "gsui-empty", !val );
		this.span.textContent = val || this.placeholder;
		if ( val !== this.value ) {
			this.value = val;
			this.data.onchange && this.data.onchange( this.value );
		}
	},
	setPlaceholder: function( s ) {
		this.placeholder = s.trim();
		if ( !this.value ) {
			this.setValue( s );
		}
	},

	// private:
	__elementDblclick: function( e ) {
		this.input.value = this.value;
		this.element.classList.add( "gsui-editing" );
		this.input.focus();
		this.input.select();
	},
	__inputBlur: function( e ) {
		if ( !this.__esc ) {
			this.setValue( e.target.value );
			this.element.classList.remove( "gsui-editing" );
		}
		this.__esc = false;
	},
	__inputKeydown: function( e ) {
		e.stopPropagation();
		if ( e.keyCode === 13 || e.keyCode === 27 ) {
			this.__esc = e.keyCode === 27;
			if ( !this.__esc ) {
				this.setValue( e.target.value );
			}
			this.element.classList.remove( "gsui-editing" );
		}
	}
};
