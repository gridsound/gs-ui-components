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
			[ GSEV_TOGGLE_TOGGLE ]: ( _, b ) => {
				GSUdomSetAttr( this, "toggle", b );
				GSUdomDispatch( this, GSEV_DRUMROW_TOGGLE, b );
			},
			[ GSEV_TOGGLE_TOGGLESOLO ]: () => {
				GSUdomSetAttr( this, "toggle" );
				GSUdomDispatch( this, GSEV_DRUMROW_TOGGLESOLO );
			},
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: () => this.#oninputendSlider(),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => GSUdomDispatch( this, GSEV_DRUMROW_CHANGEPROP, d.$target.dataset.prop, val ),
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => {
				this.#namePrint( d.$target.dataset.prop, val );
				GSUdomDispatch( this, GSEV_DRUMROW_LIVECHANGEPROP, d.$target.dataset.prop, val );
			},
			[ GSEV_PROPSELECT_SELECT ]: ( _, val ) => GSUdomDispatch( this, GSEV_DRUMROW_PROPFILTER, val ),
			[ GSEV_PROPSELECT_SELECTALL ]: ( _, val ) => GSUdomDispatch( this, GSEV_DRUMROW_PROPFILTERS, val ),
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
				case "delete": GSUdomDispatch( this, GSEV_DRUMROW_REMOVE ); break;
				case "props":
					GSUdomTogAttr( this, "open" );
					GSUdomDispatch( this, GSEV_DRUMROW_EXPAND );
					break;
			}
		}
	}
}

GSUdomDefine( "gsui-drumrow", gsuiDrumrow );
