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

	var that = this;

	el.onclick =
	this.elCancel.onclick = function() {
		that.resolve(
			that.type === "confirm" ? false :
			that.type === "prompt" ? null : undefined );
	};
	this.elWindow.onclick = function( e ) {
		e.stopPropagation();
	};
	this.elForm.onsubmit = function() {
		that.resolve(
			that.type === "confirm" ? true :
			that.type === "prompt" ? that.elText.value : undefined );
		return false;
	};
	this.elText.onkeypress =
	this.elText.onkeydown =
	this.elText.onkeyup = function( e ) {
		e.stopPropagation();
	};
};

gsuiPopup.prototype = {
	close: function() {
		if ( this.isOpen ) {
			this.elCancel.click();
		}
	},
	open: function( type, title, msg, value ) {
		this.isOpen = true;
		this.elHeader.textContent = title;
		this.elMsg.innerHTML = msg;
		this.elText.value = arguments.length > 3 ? value : "";
		this.elWindow.dataset.gsuiType = this.type = type;
		this.elWindow.classList.toggle( "gsui-nocancel", type !== "prompt" && type !== "confirm" );
		this.elWindow.classList.toggle( "gsui-notext", type !== "prompt" );
		this.elRoot.classList.add( "gsui-show" );

		var that = this;

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
	}
};
