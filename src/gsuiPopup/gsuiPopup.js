"use strict";

function gsuiPopup( el ) {
	var that = gsuiPopup;
	
	that.elRoot = el;
	that.elWindow = el.querySelector( ".gsuiPopup-window" );
	that.elHeader = el.querySelector( ".gsuiPopup-window header" );
	that.elMsg = el.querySelector( ".gsui-msg" );
	that.elText = el.querySelector( ".gsui-text" );
	that.elCancel = el.querySelector( ".gsui-cancel" );
	that.elOk = el.querySelector( ".gsui-ok" );
	that.elForm = el.querySelector( "form" );

	el.onclick =
	that.elCancel.onclick = that._cancelClick;
	that.elForm.onsubmit = that._submit;
	that.elText.onkeypress =
	that.elText.onkeydown =
	that.elText.onkeyup =
	that.elWindow.onclick = function( e ) {
		e.stopPropagation();
	};
};

Object.assign( gsuiPopup, {
	alert: function( title, msg ) {
		return gsuiPopup._open( "alert", title, msg );
	},
	confirm: function( title, msg ) {
		return gsuiPopup._open( "confirm", title, msg );
	},
	prompt: function( title, msg, val ) {
		return gsuiPopup._open( "prompt", title, msg, val );
	},
	close: function() {
		if ( gsuiPopup.isOpen ) {
			gsuiPopup.elCancel.click();
		}
	},

	// private:
	_open: function( type, title, msg, value ) {
		var that = gsuiPopup;

		that.isOpen = true;
		that.elHeader.textContent = title;
		that.elMsg.innerHTML = msg;
		that.elText.value = arguments.length > 3 ? value : "";
		that.elWindow.dataset.gsuiType =
		that.type = type;
		that.elWindow.classList.toggle( "gsui-nocancel", type !== "prompt" && type !== "confirm" );
		that.elWindow.classList.toggle( "gsui-notext", type !== "prompt" );
		that.elRoot.classList.add( "gsui-show" );
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
		gsuiPopup.resolve(
			gsuiPopup.type === "confirm" ? false :
			gsuiPopup.type === "prompt" ? null : undefined );
	},
	_submit: function() {
		gsuiPopup.resolve(
			gsuiPopup.type === "confirm" ? true :
			gsuiPopup.type === "prompt" ? gsuiPopup.elText.value : undefined );
		return false;
	}
} );
