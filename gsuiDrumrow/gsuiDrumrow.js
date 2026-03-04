"use strict";

class gsuiDrumrow extends gsui0ne {
	#elDrumLine = $noop;

	constructor() {
		super( {
			$cmpName: "gsuiDrumrow",
			$tagName: "gsui-drumrow",
			$elements: {
				$name: ".gsuiDrumrow-name",
				$toggle: "gsui-toggle",
				$sliders: "gsui-slider",
				$waveWrap: ".gsuiDrumrow-waveWrap",
				$timeCursors: "gsui-time-cursors",
			},
			$attributes: {
				toggle: true,
			},
		} );
		Object.seal( this );
		this.$this.$on( {
			click: this.#onclick.bind( this ),
			contextmenu: GSUnoopFalse,
		} );
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: ( _, b ) => {
				this.$this.$setAttr( "toggle", b ).$dispatch( GSEV_DRUMROW_TOGGLE, b );
			},
			[ GSEV_TOGGLE_TOGGLESOLO ]: () => {
				this.$this.$addAttr( "toggle" ).$dispatch( GSEV_DRUMROW_TOGGLESOLO );
			},
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: () => this.#oninputendSlider(),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.$this.$dispatch( GSEV_DRUMROW_CHANGEPROP, d.$target.dataset.prop, val ),
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => {
				this.#namePrint( d.$target.dataset.prop, val );
				this.$this.$dispatch( GSEV_DRUMROW_LIVECHANGEPROP, d.$target.dataset.prop, val );
			},
			[ GSEV_PROPSELECT_SELECT ]: ( _, val ) => this.$this.$dispatch( GSEV_DRUMROW_PROPFILTER, val ),
			[ GSEV_PROPSELECT_SELECTALL ]: ( _, val ) => this.$this.$dispatch( GSEV_DRUMROW_PROPFILTERS, val ),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "order", "toggle", "name", "pan", "gain", "detune" ]; // + "duration"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "pan":
			case "gain":
			case "detune": this.#getSlider( prop ).$setAttr( "value", val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "order":
				this.$this.$css( "order", val );
				this.#elDrumLine.$css( "order", val );
				break;
			case "toggle":
				this.$elements.$toggle.$setAttr( "off", val !== "" );
				this.#elDrumLine.$setAttr( "data-mute", val !== "" );
				break;
		}
	}

	// .........................................................................
	$associateDrumLine( el ) {
		this.#elDrumLine = $( el )
			.$css( "order", this.$this.$getAttr( "order" ) )
			.$setAttr( "data-mute", !this.$this.$hasAttr( "toggle" ) );
	}
	$changePattern( svg ) {
		this.$elements.$waveWrap.$query( "svg" ).$remove();
		this.$elements.$waveWrap.$prepend( svg );
	}
	$play() {
		this.$elements.$timeCursors.$message( GSEV_TIMECURSORS_PLAY, +this.$this.$getAttr( "duration" ) );
	}
	$stop() {
		this.$elements.$timeCursors.$message( GSEV_TIMECURSORS_STOP );
	}

	// .........................................................................
	#getSlider( prop ) {
		return this.$elements.$sliders.$filter( `[data-prop="${ prop }"]` );
	}
	#namePrint( prop, val ) {
		this.$elements.$name.$text( gsuiDrumrow.#namePrint2( prop, val ) );
		this.$this.$setAttr( "info" );
	}
	static #namePrint2( prop, val ) {
		switch ( prop ) {
			case "pan": return `pan: ${ GSUmathSign( val.toFixed( 2 ) ) }`;
			case "gain": return `gain: ${ val.toFixed( 2 ) }`;
			case "detune": return `pitch: ${ GSUmathSign( val ) }`;
		}
	}

	// .........................................................................
	#oninputendSlider() {
		this.$elements.$name.$text( this.$this.$getAttr( "name" ) );
		this.$this.$rmAttr( "info" );
	}
	#onclick( e ) {
		switch ( $( e.target ).$getAttr( "data-action" ) ) {
			case "delete": this.$this.$dispatch( GSEV_DRUMROW_REMOVE ); break;
			case "props": this.$this.$togAttr( "open" ).$dispatch( GSEV_DRUMROW_EXPAND ); break;
		}
	}
}

GSUdomDefine( "gsui-drumrow", gsuiDrumrow );
