"use strict";

class gsuiPopup extends gsui0ne {
	#type = "";
	#isOpen = false;
	#resolve = null;
	#fnSubmit = null;
	#clWindow = null;

	constructor() {
		super( {
			$cmpName: "gsuiPopup",
			$tagName: "gsui-popup",
			$elements: {
				ok: ".gsuiPopup-ok",
				cnt: ".gsuiPopup-content",
				msg: ".gsuiPopup-message",
				text: ".gsuiPopup-inputText",
				form: ".gsuiPopup-body",
				window: ".gsuiPopup-window",
				header: ".gsuiPopup-head",
				cancel: ".gsuiPopup-cancel",
				overlay: ".gsuiPopup-overlay",
			},
		} );
		Object.seal( this );
		this.#clWindow = this.$elements.window.classList;
		this.$elements.overlay.onclick = () => {
			if ( !this.#clWindow.contains( "gsuiPopup-noCancelOverlay" ) ) {
				this.#cancelClick();
			}
		};
		this.$elements.cancel.onclick = this.#cancelClick.bind( this );
		this.$elements.form.onsubmit = this.#submit.bind( this );
		this.$elements.window.onkeyup =
		this.$elements.window.onclick = e => e.stopPropagation();
		this.$elements.window.onkeydown = e => {
			e.stopPropagation();
			if ( e.key === "Escape" ) {
				this.#cancelClick();
			}
		};
	}

	// .........................................................................
	$alert( title, msg, ok ) {
		GSUemptyElement( this.$elements.cnt );
		this.#clWindow.add( "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, false );
		return this.#open( "alert", title, msg );
	}
	$confirm( title, msg, ok, cancel ) {
		GSUemptyElement( this.$elements.cnt );
		this.#clWindow.remove( "gsuiPopup-noCancel" );
		this.#clWindow.add( "gsuiPopup-noText" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "confirm", title, msg );
	}
	$prompt( title, msg, val, ok, cancel ) {
		GSUemptyElement( this.$elements.cnt );
		this.#clWindow.remove( "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "prompt", title, msg, val );
	}
	$custom( obj ) {
		GSUemptyElement( this.$elements.cnt );
		this.#fnSubmit = obj.submit || null;
		this.#clWindow.remove( "gsuiPopup-noText" );
		this.#setOkCancelBtns( obj.ok, obj.cancel || false, obj.noOverlayCancel );
		obj.element
			? this.$elements.cnt.append( obj.element )
			: this.$elements.cnt.append( ...obj.elements );
		return this.#open( "custom", obj.title );
	}
	$close() {
		if ( this.#isOpen ) {
			this.#cancelClick();
		}
	}

	// .........................................................................
	#setOkCancelBtns( ok, cancel, noOverlayCancel ) {
		this.#clWindow.toggle( "gsuiPopup-noCancel", cancel === false );
		this.#clWindow.toggle( "gsuiPopup-noCancelOverlay", noOverlayCancel === true );
		GSUsetAttribute( this.$elements.cancel, "text", cancel || "Cancel" );
		GSUsetAttribute( this.$elements.ok, "text", ok || "Ok" );
	}
	#open( type, title, msg, value ) {
		this.#type = type;
		this.#isOpen = true;
		this.$elements.header.textContent = title;
		this.$elements.msg.textContent = msg || "";
		this.$elements.text.value = arguments.length > 3 ? value : "";
		this.$elements.window.dataset.type = type;
		this.classList.add( "gsuiPopup-show" );
		GSUsetTimeout( () => {
			if ( type === "prompt" ) {
				this.$elements.text.select();
			} else {
				const inp = type !== "custom" ? null
					: GSUdomQS( this.$elements.cnt, "input, select" );

				( inp || this.$elements.ok ).focus();
			}
		}, .25 );
		return new Promise( res => this.#resolve = res )
			.then( val => {
				this.#isOpen = false;
				this.classList.remove( "gsuiPopup-show" );
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
			case "prompt": this.#resolve( this.$elements.text.value ); break;
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
			case "range":
			case "number": return +inp.value;
			case "checkbox": return inp.checked;
			case "select-one": return GSUisNaN( +inp.value ) ? inp.value : +inp.value;
		}
	}
	#submitCustom() {
		const fn = this.#fnSubmit;
		const inps = Array.from( this.$elements.form );
		const obj = inps.reduce( ( obj, inp ) => {
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
}

GSUdefineElement( "gsui-popup", gsuiPopup );
