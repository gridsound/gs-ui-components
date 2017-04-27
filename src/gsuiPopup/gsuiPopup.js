"use strict";

function gsuiPopup( el ) {
	this.elRoot = el;
	this.elWindow = el.querySelector( ".gsuiPopup-window" );
	this.elHeader = el.querySelector( ".gsuiPopup-window header" );
	this.elMsg = el.querySelector( ".gsui-msg" );
	this.elText = el.querySelector( ".gsui-text" );
	this.elCancel = el.querySelector( ".gsui-cancel" );
	this.elOk = el.querySelector( ".gsui-ok" );
	this.elForm = el.querySelector( "form" );

	el.onclick =
	this.elCancel.onclick = this._cancelClick.bind( this );
	this.elForm.onsubmit = this._submit.bind( this );
	this.elText.onkeypress =
	this.elText.onkeydown =
	this.elText.onkeyup =
	this.elWindow.onclick = function( e ) {
		e.stopPropagation();
	};
};

gsuiPopup.prototype = {
	alert: function( title, msg ) {
		return this._open( "alert", title, msg );
	},
	confirm: function( title, msg ) {
		return this._open( "confirm", title, msg );
	},
	prompt: function( title, msg, val ) {
		return this._open( "prompt", title, msg, val );
	},
	close: function() {
		if ( this.isOpen ) {
			this.elCancel.click();
		}
	},

	// private:
	_open: function( type, title, msg, value ) {
		var that = this;

		this.isOpen = true;
		this.elHeader.textContent = title;
		this.elMsg.innerHTML = msg;
		this.elText.value = arguments.length > 3 ? value : "";
		this.elWindow.dataset.gsuiType = this.type = type;
		this.elWindow.classList.toggle( "gsui-nocancel", type !== "prompt" && type !== "confirm" );
		this.elWindow.classList.toggle( "gsui-notext", type !== "prompt" );
		this.elRoot.classList.add( "gsui-show" );
		setTimeout( function() {
			if ( type === "prompt" ) {
				that.elText.select();
			} else {
				that.elOk.focus();
			}
		}, 250 );
		return new Promise( function( resolve ) {
			that.resolve = resolve;
		} ).then( function( val ) {
			that.isOpen = false;
			that.elRoot.classList.remove( "gsui-show" );
			return val;
		} );
	},
	_cancelClick: function() {
		this.resolve(
			this.type === "confirm" ? false :
			this.type === "prompt" ? null : undefined );
	},
	_submit: function() {
		this.resolve(
			this.type === "confirm" ? true :
			this.type === "prompt" ? this.elText.value : undefined );
		return false;
	}
};
