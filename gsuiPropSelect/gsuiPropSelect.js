"use strict";

class gsuiPropSelect extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiPropSelect",
			$tagName: "gsui-prop-select",
			$elements: {
				$form: ".gsuiPropSelect-form",
			},
			$attributes: {
				prop: "gain",
			},
		} );
		Object.seal( this );
		this.oncontextmenu = this.#oncontextmenu.bind( this );
		this.$elements.$form.onchange = this.#onchange.bind( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "props", "prop", "value" ];
	}
	$attributeChanged( prop, val, prev ) {
		switch ( prop ) {
			case "props":
				this.#createProps( val );
				break;
			case "prop":
				this.#getBtn( val ).firstChild.click();
				if ( prev ) {
					this.#setValue( prev, false );
				}
				this.#setValue( val, GSUgetAttribute( this, "value" ) );
				break;
			case "value":
				this.#setValue( GSUgetAttribute( this, "prop" ), val );
				break;
		}
	}

	// .........................................................................
	#createProps( s ) {
		const elBtns = s.split( " " ).map( p => GSUgetTemplate( "gsui-prop-select-btn", ...p.split( ":" ) ) );

		GSUemptyElement( this.$elements.$form );
		this.$elements.$form.append( ...elBtns );
	}
	#getBtn( prop ) {
		return this.querySelector( `.gsuiPropSelect-btn[data-prop="${ prop }"]` );
	}
	#setValue( prop, val ) {
		GSUsetAttribute( this.#getBtn( prop ).lastChild, "data-value", gsuiPropSelect.#formatValue( prop, val ) );
	}
	static #formatValue( prop, val ) {
		if ( !val ) {
			return false;
		}
		switch ( prop ) {
			case "detune": return GSUsignNum( val );
			case "gain": return ( +val ).toFixed( 2 );
			case "pan": return GSUsignNum( ( +val ).toFixed( 2 ) );
		}
	}

	// .........................................................................
	#onchange( e ) {
		const prop = e.target.value;

		e.stopImmediatePropagation();
		if ( prop !== GSUgetAttribute( this, "prop" ) ) {
			GSUsetAttribute( this, "prop", prop );
			this.$dispatch( "select", prop );
		}
	}
	#oncontextmenu( e ) {
		e.preventDefault();
		if ( e.target.classList.contains( "gsuiPropSelect-btn" ) ) {
			GSUsetAttribute( this, "prop", e.target.dataset.prop );
			this.$dispatch( "selectAll", e.target.dataset.prop );
		}
	}
}

GSUdefineElement( "gsui-prop-select", gsuiPropSelect );
