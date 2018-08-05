"use strict";

class gsuiPopup {
	static alert( title, msg ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup.clWindow.add( "gsui-notext", "gsui-nocancel" );
		return gsuiPopup._open( "alert", title, msg );
	}
	static confirm( title, msg ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup.clWindow.remove( "gsui-nocancel" );
		gsuiPopup.clWindow.add( "gsui-notext" );
		return gsuiPopup._open( "confirm", title, msg );
	}
	static prompt( title, msg, val ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup.clWindow.remove( "gsui-notext", "gsui-nocancel" );
		return gsuiPopup._open( "prompt", title, msg, val );
	}
	static custom( obj ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup._fnSubmit = obj.submit;
		gsuiPopup.clWindow.remove( "gsui-notext" );
		gsuiPopup.clWindow.toggle( "gsui-nocancel", !obj.showCancel );
		obj.element
			? gsuiPopup.elCnt.append( obj.element )
			: Element.prototype.append.apply( gsuiPopup.elCnt, obj.elements );
		return gsuiPopup._open( "custom", obj.title );
	}
	static close() {
		if ( gsuiPopup.isOpen ) {
			gsuiPopup.elCancel.click();
		}
	}

	// private:
	static _emptyCnt() {
		const elCnt = gsuiPopup.elCnt;

		while ( elCnt.firstChild ) {
			elCnt.firstChild.remove();
		}
	}
	static _init() {
		const that = gsuiPopup;

		if ( !that._ready ) {
			const el = that.elRoot = document.getElementById( "gsuiPopup" );

			that.elRoot = el;
			that.elOk = el.querySelector( "#gsuipp-inpOk" );
			that.elCnt = el.querySelector( "#gsuipp-cnt" );
			that.elMsg = el.querySelector( "#gsuipp-msg" );
			that.elText = el.querySelector( "#gsuipp-inpText" );
			that.elForm = el.querySelector( "form" );
			that.elWindow = el.querySelector( "#gsuipp-window" );
			that.elHeader = el.querySelector( "#gsuipp-head" );
			that.elCancel = el.querySelector( "#gsuipp-inpCancel" );
			that.clWindow = that.elWindow.classList;

			el.onclick =
			that.elCancel.onclick = that._cancelClick;
			that.elForm.onsubmit = that._submit;
			that.elWindow.onkeyup =
			that.elWindow.onclick = e => {
				e.stopPropagation();
			};
			that.elWindow.onkeydown = e => {
				if ( e.keyCode === 27 ) {
					that._cancelClick();
				}
				e.stopPropagation();
			};
			that._ready = true;
		}
	}
	static _open( type, title, msg, value ) {
		const that = gsuiPopup;

		that.type = type;
		that.isOpen = true;
		that.elHeader.textContent = title;
		that.elMsg.innerHTML = msg || "";
		that.elText.value = arguments.length > 3 ? value : "";
		that.elWindow.dataset.gsuiType =
		that.elRoot.classList.add( "gsui-show" );
		setTimeout( () => {
			if ( type === "prompt" ) {
				that.elText.select();
			} else {
				const inp = type !== "custom" ? null
					: that.elCnt.querySelector( "input" );

				( inp || that.elOk ).focus();
			}
		}, 250 );
		return new Promise( res => that.resolve = res )
			.then( val => {
				that.isOpen = false;
				that.elRoot.classList.remove( "gsui-show" );
				return val;
			} );
	}
	static _cancelClick() {
		gsuiPopup.resolve(
			gsuiPopup.type === "confirm" ? false :
			gsuiPopup.type === "prompt" ? null : undefined );
	}
	static _submit( e ) {
		if ( gsuiPopup.type === "custom" && gsuiPopup._fnSubmit ) {
			gsuiPopup._fnSubmit( e );
		}
		gsuiPopup.resolve(
			gsuiPopup.type === "confirm" ? true :
			gsuiPopup.type === "prompt" ? gsuiPopup.elText.value : undefined );
		return false;
	}
}
