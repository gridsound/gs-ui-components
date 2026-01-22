"use strict";

class gsuiPopup extends gsui0ne {
	#type = "";
	#resolve = null;
	#fnSubmit = null;

	constructor() {
		super( {
			$cmpName: "gsuiPopup",
			$tagName: "gsui-popup",
			$jqueryfy: true,
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
		this.$elements.$win.$on( "close", this.#cancelClick.bind( this ) );
		this.$elements.$cancel.$on( "click", this.#cancelClick.bind( this ) );
		this.$elements.$form.$on( "submit", this.#submit.bind( this ) );
		this.$this.$on( {
			keyup: e => e.stopPropagation(),
			keydown: e => e.stopPropagation(),
		} );
	}

	// .........................................................................
	$alert( title, msg, ok ) {
		this.$elements.$cnt.$empty();
		this.$elements.$win.$addClass( "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, false );
		return this.#open( "alert", title, msg );
	}
	$confirm( title, msg, ok, cancel ) {
		this.$elements.$cnt.$empty();
		this.$elements.$win.$rmClass( "gsuiPopup-noCancel" ).$addClass( "gsuiPopup-noText" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "confirm", title, msg );
	}
	$prompt( title, msg, val, ok, cancel ) {
		this.$elements.$cnt.$empty();
		this.$elements.$win.$rmClass( "gsuiPopup-noText", "gsuiPopup-noCancel" );
		this.#setOkCancelBtns( ok, cancel );
		return this.#open( "prompt", title, msg, val );
	}
	$custom( obj ) {
		this.$elements.$cnt.$empty();
		this.$elements.$win.$rmClass( "gsuiPopup-noText" );
		this.#fnSubmit = obj.submit || null;
		this.#setOkCancelBtns( obj.ok, obj.cancel || false, obj.noOverlayCancel );
		obj.element
			? this.$elements.$cnt.$append( obj.element )
			: this.$elements.$cnt.$append( ...obj.elements );
		return this.#open( "custom", obj.title );
	}
	$close() {
		if ( this.$elements.$win.$prop( "open" ) ) {
			this.#cancelClick();
		}
	}

	// .........................................................................
	#setOkCancelBtns( ok, cancel, noOverlayCancel ) {
		this.$elements.$win.$togClass( "gsuiPopup-noCancel", cancel === false )
			.$attr( "closedby", noOverlayCancel === true ? "none" : "any" );
		this.$elements.$cancel.$attr( "text", cancel || "Cancel" );
		this.$elements.$ok.$attr( "text", ok || "Ok" );
	}
	#open( type, title, msg, value ) {
		this.#type = type;
		this.$elements.$header.$text( title );
		this.$elements.$msg.$text( msg || "" );
		this.$elements.$text.$value( arguments.length > 3 ? value : "" );
		this.$elements.$win.$attr( "data-type", type );
		this.$elements.$cnt.$find( "input,select,.gsuiPopup-ok *:first-child" ).$attr( "autofocus", true );
		if ( type === "prompt" ) {
			this.$elements.$text.$trigger( "select" );
		}
		this.$elements.$win.$trigger( "showModal" );
		return new Promise( res => this.#resolve = res )
			.then( val => {
				this.$elements.$win.$trigger( "close" );
				return val;
			} );
	}
	#cancelClick() {
		this.#resolve(
			this.#type === "confirm" ? false :
			this.#type === "prompt" ? null : undefined );
	}
	#submit( e ) {
		e.preventDefault();
		switch ( this.#type ) {
			case "alert": this.#resolve( undefined ); break;
			case "prompt": this.#resolve( this.$elements.$text.$value() ); break;
			case "confirm": this.#resolve( true ); break;
			case "custom": this.#submitCustom(); break;
		}
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
		const inps = Array.from( this.$elements.$form.$get( 0 ) );
		const obj = GSUreduce( inps, ( obj, inp ) => {
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
