"use strict";

const gsuiPopup = new class {
	#type = ""
	#isOpen = false
	#resolve = null
	#fnSubmit = null
	#children = GSUI.getTemplate( "gsui-popup" )
	#elements = GSUI.findElements( this.#children, {
		ok: "#gsuiPopupOk",
		cnt: "#gsuiPopupContent",
		msg: "#gsuiPopupMessage",
		text: "#gsuiPopupInputText",
		form: "#gsuiPopupBody",
		window: "#gsuiPopupWindow",
		header: "#gsuiPopupHead",
		cancel: "#gsuiPopupCancel",
	} )
	#clWindow = this.#elements.window.classList

	constructor() {
		this.rootElement = this.#children;
		Object.seal( this );

		this.rootElement.onclick =
		this.#elements.cancel.onclick = this.#cancelClick.bind( this );
		this.#elements.form.onsubmit = this.#submit.bind( this );
		this.#elements.window.onkeyup =
		this.#elements.window.onclick = e => e.stopPropagation();
		this.#elements.window.onkeydown = e => {
			e.stopPropagation();
			if ( e.key === "Escape" ) {
				this.#cancelClick();
			}
		};
		document.body.append( this.#children );
	}

	// .........................................................................
	alert( title, msg, ok ) {
		GSUI.empty( this.#elements.cnt );
		this.#clWindow.add( "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, false );
		return this.#open( "alert", title, msg );
	}
	confirm( title, msg, ok, cancel ) {
		GSUI.empty( this.#elements.cnt );
		this.#clWindow.remove( "gsuiPopup-noCancel" );
		this.#clWindow.add( "gsuiPopup-noText" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "confirm", title, msg );
	}
	prompt( title, msg, val, ok, cancel ) {
		GSUI.empty( this.#elements.cnt );
		this.#clWindow.remove( "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "prompt", title, msg, val );
	}
	custom( obj ) {
		GSUI.empty( this.#elements.cnt );
		this.#fnSubmit = obj.submit || null;
		this.#clWindow.remove( "gsuiPopup-noText" );
		this.#setOkCancelBtns( obj.ok, obj.cancel || false );
		obj.element
			? this.#elements.cnt.append( obj.element )
			: Element.prototype.append.apply( this.#elements.cnt, obj.elements );
		return this.#open( "custom", obj.title );
	}
	close() {
		if ( this.#isOpen ) {
			this.#elements.cancel.click();
		}
	}

	// .........................................................................
	#setOkCancelBtns( ok, cancel ) {
		this.#clWindow.toggle( "gsuiPopup-noCancel", cancel === false );
		this.#elements.cancel.value = cancel || "Cancel";
		this.#elements.ok.value = ok || "Ok";
	}
	#open( type, title, msg, value ) {
		this.#type = type;
		this.#isOpen = true;
		this.#elements.header.textContent = title;
		this.#elements.msg.innerHTML = msg || "";
		this.#elements.text.value = arguments.length > 3 ? value : "";
		this.#elements.window.dataset.type = type;
		this.rootElement.classList.add( "gsuiPopup-show" );
		setTimeout( () => {
			if ( type === "prompt" ) {
				this.#elements.text.select();
			} else {
				const inp = type !== "custom" ? null
					: this.#elements.cnt.querySelector( "input, select" );

				( inp || this.#elements.ok ).focus();
			}
		}, 250 );
		return new Promise( res => this.#resolve = res )
			.then( val => {
				this.#isOpen = false;
				this.rootElement.classList.remove( "gsuiPopup-show" );
				return val;
			} );
	}
	#cancelClick() {
		this.#resolve(
			this.#type === "confirm" ? false :
			this.#type === "prompt" ? null : undefined );
	}
	#submit() {
		switch ( this.#type ) {
			case "alert": this.#resolve( undefined ); break;
			case "prompt": this.#resolve( this.#elements.text.value ); break;
			case "confirm": this.#resolve( true ); break;
			case "custom": this.#submitCustom(); break;
		}
		return false;
	}
	#getInputValue( inp ) {
		switch ( inp.type ) {
			default: return inp.value;
			case "file": return inp.files;
			case "radio": return inp.checked ? inp.value : null;
			case "number": return +inp.value;
			case "checkbox": return inp.checked;
		}
	}
	#submitCustom() {
		const fn = this.#fnSubmit,
			inps = Array.from( this.#elements.form ),
			obj = inps.reduce( ( obj, inp ) => {
				if ( inp.name ) {
					const val = this.#getInputValue( inp );

					if ( val !== null ) {
						obj[ inp.name ] = val;
					}
				}
				return obj;
			}, {} );

		if ( !fn ) {
			this.#resolve( obj );
		} else {
			const fnRes = fn( obj );

			if ( fnRes !== false ) {
				fnRes && fnRes.then
					? fnRes.then( res => {
						if ( res !== false ) {
							this.#resolve( obj );
						}
					} )
					: this.#resolve( obj );
			}
		}
	}
}();
