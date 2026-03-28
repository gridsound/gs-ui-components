"use strict";

class gsuiPropSelect extends gsui0ne {
	#prop = null;

	constructor() {
		super( {
			$tagName: "gsui-prop-select",
			$attributes: {
				prop: "gain",
			},
		} );
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
	#createProps( s ) {
		this.$this.$empty().$append( ...s.split( " " ).map( p => this.#createProp( p ) ) );
		if ( !this.#setProp( this.#prop ) ) {
			this.$this.$query( ".gsuiPropSelect-btn" ).$at( 0 ).$click();
		}
	}
	#createProp( p ) {
		const isSep = p.startsWith( "---" );
		const p2 = isSep
			? p.slice( 3, -3 )
			: p.split( ":" );

		return isSep
			? GSUcreateDiv( { class: "gsuiPropSelect-sep", inert: true }, p2 )
			: GSUcreateDiv( { class: "gsuiPropSelect-btn", "data-prop": p2[ 0 ], "data-label": p2[ 1 ] || p2[ 0 ] } );
	}
	#setProp( prop, prev ) {
		const btn = this.#getBtn( prop );

		this.#prop = prop;
		this.#setValue( prev, false );
		btn.$addAttr( "data-selected" );
		this.#getBtn( prev ).$rmAttr( "data-selected" );
		this.#setValue( prop, this.$this.$getAttr( "value" ) );
		return !!btn.$size();
	}
	#getBtn( prop ) {
		return this.$this.$query( `.gsuiPropSelect-btn[data-prop="${ prop }"]` );
	}
	#setValue( prop, val ) {
		this.#getBtn( prop ).$setAttr( "data-value", gsuiPropSelect.#formatValue( prop, val ) );
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
			this.$this.$setAttr( "prop", prop ).$dispatch( GSEV_PROPSELECT_SELECT, prop );
		}
	}
	#oncontextmenu( e ) {
		const tar = $( e.target );

		e.preventDefault();
		if ( tar.$hasClass( "gsuiPropSelect-btn" ) ) {
			const prop = tar.$getAttr( "data-prop" );

			this.$this.$setAttr( "prop", prop ).$dispatch( GSEV_PROPSELECT_SELECTALL, prop );
		}
	}
}

GSUdomDefine( "gsui-prop-select", gsuiPropSelect );
