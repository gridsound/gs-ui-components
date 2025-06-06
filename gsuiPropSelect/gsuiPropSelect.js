"use strict";

class gsuiPropSelect extends gsui0ne {
	#prop = null;

	constructor() {
		super( {
			$cmpName: "gsuiPropSelect",
			$tagName: "gsui-prop-select",
			$attributes: {
				prop: "gain",
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		this.oncontextmenu = this.#oncontextmenu.bind( this );
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

		GSUemptyElement( this );
		this.append( ...elBtns );
		if ( this.#prop ) {
			this.#setProp( this.#prop );
		}
	}
	#createProp( p ) {
		const isSep = p.startsWith( "---" );
		const p2 = isSep
			? p.slice( 3, -3 )
			: p.split( ":" );

		return isSep
			? GSUcreateDiv( { class: "gsuiPropSelect-sep", inert: true }, p2 )
			: GSUcreateDiv( { class: "gsuiPropSelect-btn", "data-prop": p2[ 0 ], "data-label": p2[ 1 ] || p2[ 0 ] } )
	}
	#setProp( prop, prev ) {
		const btn = this.#getBtn( prop );
		const btnPrev = this.#getBtn( prev );

		this.#prop = prop;
		this.#setValue( prev, false );
		btn && GSUsetAttribute( btn, "data-selected", true );
		btnPrev && GSUsetAttribute( btnPrev, "data-selected", false );
		this.#setValue( prop, GSUgetAttribute( this, "value" ) );
	}
	#getBtn( prop ) {
		return this.querySelector( `.gsuiPropSelect-btn[data-prop="${ prop }"]` );
	}
	#setValue( prop, val ) {
		const btn = this.#getBtn( prop );

		if ( btn ) {
			GSUsetAttribute( btn, "data-value", gsuiPropSelect.#formatValue( prop, val ) );
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
	#onclick( e ) {
		const prop = e.target.dataset.prop;

		if ( prop && prop !== this.#prop ) {
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
