"use strict";

class gsuiPopup {
	static alert( title, msg, ok ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup.clWindow.add( "gsui-notext", "gsui-nocancel" );
		gsuiPopup._setOkCancelBtns( ok, false );
		return gsuiPopup._open( "alert", title, msg );
	}
	static confirm( title, msg, ok, cancel ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup.clWindow.remove( "gsui-nocancel" );
		gsuiPopup.clWindow.add( "gsui-notext" );
		gsuiPopup._setOkCancelBtns( ok, cancel );
		return gsuiPopup._open( "confirm", title, msg );
	}
	static prompt( title, msg, val, ok, cancel ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup.clWindow.remove( "gsui-notext", "gsui-nocancel" );
		gsuiPopup._setOkCancelBtns( ok, cancel );
		return gsuiPopup._open( "prompt", title, msg, val );
	}
	static custom( obj ) {
		gsuiPopup._init();
		gsuiPopup._emptyCnt();
		gsuiPopup._fnSubmit = obj.submit || null;
		gsuiPopup.clWindow.remove( "gsui-notext" );
		gsuiPopup._setOkCancelBtns( obj.ok, obj.cancel || false );
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
	static _setOkCancelBtns( ok, cancel ) {
		gsuiPopup.clWindow.toggle( "gsui-nocancel", cancel === false );
		gsuiPopup.elCancel.value = cancel || "Cancel";
		gsuiPopup.elOk.value = ok || "Ok";
	}
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
		switch ( gsuiPopup.type ) {
			case "confirm": gsuiPopup.resolve( true ); break;
			case "alert": gsuiPopup.resolve( undefined ); break;
			case "prompt": gsuiPopup.resolve( gsuiPopup.elText.value ); break;
			case "custom":
				const fn = gsuiPopup._fnSubmit,
					inps = Array.from( gsuiPopup.elForm ),
					obj = inps.reduce( ( obj, inp ) => {
						if ( inp.name ) {
							obj[ inp.name ] = inp.value;
						}
						return obj;
					}, {} );

				if ( !fn ) {
					gsuiPopup.resolve( obj );
				} else {
					const fnRes = fn( obj );

					if ( fnRes !== false ) {
						fnRes && fnRes.then
							? fnRes.then( res => {
								if ( res !== false ) {
									gsuiPopup.resolve( obj );
								}
							} )
							: gsuiPopup.resolve( obj );
					}
				}
		}
		return false;
	}
}
