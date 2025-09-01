"use strict";

class gsuiPopup extends gsui0ne {
	#type = "";
	#resolve = null;
	#fnSubmit = null;

	constructor() {
		super( {
			$cmpName: "gsuiPopup",
			$tagName: "gsui-popup",
			$elements: {
				$ok: ".gsuiPopup-ok",
				$win: ".gsuiPopup-window",
				$cnt: ".gsuiPopup-content",
				$msg: ".gsuiPopup-message",
				$text: ".gsuiPopup-inputText",
				$form: ".gsuiPopup-body",
				$header: ".gsuiPopup-head",
				$cancel: ".gsuiPopup-cancel",
			},
		} );
		Object.seal( this );
		this.$elements.$win.onclose =
		this.$elements.$cancel.onclick = this.#cancelClick.bind( this );
		this.$elements.$form.onsubmit = this.#submit.bind( this );
		this.onkeyup =
		this.onkeydown = e => e.stopPropagation();
	}

	// .........................................................................
	$alert( title, msg, ok ) {
		GSUdomEmpty( this.$elements.$cnt );
		GSUdomAddClass( this.$elements.$win, "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, false );
		return this.#open( "alert", title, msg );
	}
	$confirm( title, msg, ok, cancel ) {
		GSUdomEmpty( this.$elements.$cnt );
		GSUdomRmClass( this.$elements.$win, "gsuiPopup-noCancel" );
		GSUdomAddClass( this.$elements.$win, "gsuiPopup-noText" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "confirm", title, msg );
	}
	$prompt( title, msg, val, ok, cancel ) {
		GSUdomEmpty( this.$elements.$cnt );
		GSUdomRmClass( this.$elements.$win, "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "prompt", title, msg, val );
	}
	$custom( obj ) {
		GSUdomEmpty( this.$elements.$cnt );
		GSUdomRmClass( this.$elements.$win, "gsuiPopup-noText" );
		this.#fnSubmit = obj.submit || null;
		this.#setOkCancelBtns( obj.ok, obj.cancel || false, obj.noOverlayCancel );
		obj.element
			? this.$elements.$cnt.append( obj.element )
			: this.$elements.$cnt.append( ...obj.elements );
		return this.#open( "custom", obj.title );
	}
	$close() {
		if ( this.$elements.$win.open ) {
			this.#cancelClick();
		}
	}

	// .........................................................................
	#setOkCancelBtns( ok, cancel, noOverlayCancel ) {
		GSUdomTogClass( this.$elements.$win, "gsuiPopup-noCancel", cancel === false );
		GSUdomSetAttr( this.$elements.$win, "closedby", noOverlayCancel === true ? "none" : "any" );
		GSUdomSetAttr( this.$elements.$cancel, "text", cancel || "Cancel" );
		GSUdomSetAttr( this.$elements.$ok, "text", ok || "Ok" );
	}
	#open( type, title, msg, value ) {
		this.#type = type;
		this.$elements.$header.textContent = title;
		this.$elements.$msg.textContent = msg || "";
		this.$elements.$text.value = arguments.length > 3 ? value : "";
		this.$elements.$win.dataset.type = type;
		if ( type === "prompt" ) {
			GSUdomSetAttr( this.$elements.$text, "autofocus" );
			this.$elements.$text.select();
		} else {
			const inp = type !== "custom"
				? null
				: GSUdomQS( this.$elements.$cnt, "input,select" );

			GSUdomSetAttr( inp || this.$elements.$ok.firstChild, "autofocus" );
		}
		this.$elements.$win.showModal();
		return new Promise( res => this.#resolve = res )
			.then( val => {
				this.$elements.$win.close();
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
			case "prompt": this.#resolve( this.$elements.$text.value ); break;
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
		const inps = Array.from( this.$elements.$form );
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

GSUdomDefine( "gsui-popup", gsuiPopup );
