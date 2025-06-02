"use strict";

class gsuiPropSelect extends gsui0ne {
	#prop = null;

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
			case "props": this.#createProps( val ); break;
			case "prop": this.#setProp( val, prev ); break;
			case "value": this.#setValue( this.#prop, val ); break;
		}
	}

	// .........................................................................
	$getCurrentProp() {
		return this.#prop;
	}

	// .........................................................................
	#createProps( s ) {
		const elBtns = s.split( " " ).map( p => this.#createProp( p ) );

		GSUemptyElement( this.$elements.$form );
		this.$elements.$form.append( ...elBtns );
		if ( this.#prop ) {
			this.#setProp( this.#prop );
		}
	}
	#createProp( prop ) {
		return prop.startsWith( "---" )
			? GSUcreateDiv( { class: "gsuiPropSelect-sep" }, prop.slice( 3, -3 ) )
			: GSUgetTemplate( "gsui-prop-select-btn", ...prop.split( ":" ) );
	}
	#setProp( prop, prev ) {
		this.#prop = prop;
		this.#setValue( prev, false );
		this.#getBtn( prop )?.firstChild.click();
		this.#setValue( prop, GSUgetAttribute( this, "value" ) );
	}
	#getBtn( prop ) {
		return this.querySelector( `.gsuiPropSelect-btn[data-prop="${ prop }"]` );
	}
	#setValue( prop, val ) {
		const btn = this.#getBtn( prop );

		if ( btn ) {
			GSUsetAttribute( btn.lastChild, "data-value", gsuiPropSelect.#formatValue( prop, val ) );
		}
	}
	static #formatValue( prop, val ) {
		if ( !val ) {
			return false;
		}
		switch ( prop ) {
			case "detune": return GSUmathSign( val );
			case "gain": return ( +val ).toFixed( 2 );
			case "pan": return GSUmathSign( ( +val ).toFixed( 2 ) );
		}
		return val;
	}

	// .........................................................................
	#onchange( e ) {
		const prop = e.target.value;

		e.stopImmediatePropagation();
		if ( prop !== this.#prop ) {
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
