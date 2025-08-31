"use strict";

class gsuiDrumrow extends gsui0ne {
	#elDrumLine = null;

	constructor() {
		super( {
			$cmpName: "gsuiDrumrow",
			$tagName: "gsui-drumrow",
			$elements: {
				$name: ".gsuiDrumrow-name",
				toggle: "gsui-toggle",
				pan: ".gsuiDrumrow-pan gsui-slider",
				gain: ".gsuiDrumrow-gain gsui-slider",
				detune: ".gsuiDrumrow-detune gsui-slider",
				waveWrap: ".gsuiDrumrow-waveWrap",
			},
			$attributes: {
				toggle: true,
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		this.onanimationend = this.#onanimationend.bind( this );
		GSUdomListen( this, {
			"gsuiToggle-toggle": ( _, b ) => {
				GSUdomSetAttr( this, "toggle", b );
				GSUdomDispatch( this, "gsuiDrumrow-toggle", b );
			},
			"gsuiToggle-toggleSolo": () => {
				GSUdomSetAttr( this, "toggle" );
				GSUdomDispatch( this, "gsuiDrumrow-toggleSolo" );
			},
			"gsuiSlider-inputStart": GSUnoop,
			"gsuiSlider-inputEnd": () => this.#oninputendSlider(),
			"gsuiSlider-change": ( d, val ) => GSUdomDispatch( this, "gsuiDrumrow-changeProp", d.$target.dataset.prop, val ),
			"gsuiSlider-input": ( d, val ) => {
				this.#namePrint( d.$target.dataset.prop, val );
				GSUdomDispatch( this, "gsuiDrumrow-liveChangeProp", d.$target.dataset.prop, val );
			},
			"gsuiPropSelect-select": ( _, val ) => GSUdomDispatch( this, "gsuiDrumrow-propFilter", val ),
			"gsuiPropSelect-selectAll": ( _, val ) => GSUdomDispatch( this, "gsuiDrumrow-propFilters", val ),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "order", "toggle", "name", "pan", "gain", "detune", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "pan":
			case "gain":
			case "detune": GSUdomSetAttr( this.$elements[ prop ], "value", val ); break;
			case "name": this.$elements.$name.textContent = val; break;
			case "duration": this.$elements.waveWrap.style.animationDuration = `${ val * 2 }s`; break;
			case "order":
				this.style.order = val;
				if ( this.#elDrumLine ) {
					this.#elDrumLine.style.order = val;
				}
				break;
			case "toggle":
				GSUdomSetAttr( this.$elements.toggle, "off", val !== "" );
				GSUdomSetAttr( this.#elDrumLine, "data-mute", val !== "" );
				break;
		}
	}

	// .........................................................................
	$associateDrumLine( el ) {
		this.#elDrumLine = el;
		el.style.order = GSUdomGetAttr( this, "order" );
		GSUdomSetAttr( el, "data-mute", !GSUdomHasAttr( this, "toggle" ) );
	}
	$changePattern( svg ) {
		GSUemptyElement( this.$elements.waveWrap );
		if ( svg ) {
			this.$elements.waveWrap.append( svg );
		}
	}
	$play() {
		this.$elements.waveWrap.append( GSUcreateDiv( { class: "gsuiDrumrow-startCursor" } ) );
	}
	$stop() {
		GSUdomQSA( this, ".gsuiDrumrow-startCursor" ).forEach( el => el.remove() );
	}

	// .........................................................................
	#namePrint( prop, val ) {
		this.$elements.$name.textContent = gsuiDrumrow.#namePrint2( prop, val );
		GSUdomSetAttr( this, "info" );
	}
	static #namePrint2( prop, val ) {
		switch ( prop ) {
			case "pan": return `pan: ${ GSUmathSign( val.toFixed( 2 ) ) }`;
			case "gain": return `gain: ${ val.toFixed( 2 ) }`;
			case "detune": return `pitch: ${ GSUmathSign( val ) }`;
		}
	}

	// .........................................................................
	#oninputendSlider( id ) {
		this.$elements.$name.textContent = GSUdomGetAttr( this, "name" );
		GSUdomRmAttr( this, "info" );
	}
	#onanimationend( e ) {
		if ( GSUdomHasClass( e.target, "gsuiDrumrow-startCursor" ) ) {
			e.target.remove();
		}
	}
	#onclick( e ) {
		if ( e.target !== this ) {
			switch ( e.target.dataset.action ) {
				case "delete": GSUdomDispatch( this, "gsuiDrumrow-remove" ); break;
				case "props":
					GSUdomTogAttr( this, "open" );
					GSUdomDispatch( this, "gsuiDrumrow-expand" );
					break;
			}
		}
	}
}

GSUdefineElement( "gsui-drumrow", gsuiDrumrow );
