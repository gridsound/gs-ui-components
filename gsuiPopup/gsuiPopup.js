"use strict";

window.gsuiPopup = {
	alert( title, msg ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		return gsuiPopup._open( "alert", title, msg );
	},
	confirm( title, msg ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		return gsuiPopup._open( "confirm", title, msg );
	},
	prompt( title, msg, val ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		return gsuiPopup._open( "prompt", title, msg, val );
	},
	custom( title, elements, fnSubmit ) {
		var elCnt;

		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup._fnSubmit = fnSubmit;
		elCnt = gsuiPopup.elCnt;
		elements.length
			? elCnt.append.apply( elCnt, elements )
			: elCnt.append( elements );
		return gsuiPopup._open( "custom", title );
	},
	close() {
		if ( gsuiPopup.isOpen ) {
			gsuiPopup.elCancel.click();
		}
	},

	// private:
	_emptyCnt() {
		var elCnt = gsuiPopup.elCnt;

		while ( elCnt.firstChild ) {
			elCnt.firstChild.remove();
		}
	},
	_init() {
		var el, that = gsuiPopup;

		if ( !that._ready ) {
			el =
			that.elRoot = document.getElementById( "gsuiPopup" );
			that.elWindow = el.querySelector( "#gsuipp-window" );
			that.elHeader = el.querySelector( "#gsuipp-head" );
			that.elCnt = el.querySelector( "#gsuipp-cnt" );
			that.elMsg = el.querySelector( "#gsuipp-msg" );
			that.elText = el.querySelector( "#gsuipp-inpText" );
			that.elCancel = el.querySelector( "#gsuipp-inpCancel" );
			that.elOk = el.querySelector( "#gsuipp-inpOk" );
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
			that.elWindow.onkeydown = function( e ) {
				if ( e.keyCode === 27 ) {
					that._cancelClick();
				}
				e.stopPropagation();
			};
			that._ready = true;
		}
	},
	_open( type, title, msg, value ) {
		var that = gsuiPopup;

		that.isOpen = true;
		that.elHeader.textContent = title;
		that.elMsg.innerHTML = msg || "";
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
	_cancelClick() {
		gsuiPopup.resolve(
			gsuiPopup.type === "confirm" ? false :
			gsuiPopup.type === "prompt" ? null : undefined );
	},
	_submit( e ) {
		if ( gsuiPopup.type === "custom" && gsuiPopup._fnSubmit ) {
			gsuiPopup._fnSubmit( e );
		}
		gsuiPopup.resolve(
			gsuiPopup.type === "confirm" ? true :
			gsuiPopup.type === "prompt" ? gsuiPopup.elText.value : undefined );
		return false;
	}
};
