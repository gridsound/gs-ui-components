"use strict";

class gsuiBufferEditor extends gsui0ne {
	#buf = null;
	#bufOriginal = null;

	constructor() {
		super( {
			$tagName: "gsui-buffer-editor",
			$template: $.$elem( "gsui-be-in", null,
				$.$elem( "gsui-buffer-view" ),
				$.$elem( "gsui-be-head", null,
					$.$elem( "gsui-buttons", null,
						$.$elem( "gsui-button", { "data-prop": "sel-add", light: true, model: "danger", icon: "select-plus", "data-tooltip": GSTX.$newSelection } ),
						$.$elem( "gsui-button", { "data-prop": "sel-cut", light: true, model: "danger", icon: "cut", "data-tooltip": GSTX.$cutSelectedAudio, disabled: true } ),
						$.$elem( "gsui-button", { "data-prop": "sel-silent", light: true, model: "danger", icon: "volume-error", "data-tooltip": GSTX.$silentSelectedAudio, disabled: true } ),
						$.$elem( "gsui-button", { "data-prop": "sel-reverse", light: true, model: "danger", icon: "arrows-h", "data-tooltip": GSTX.$reverseSelectedAudio, disabled: true } ),
					),
					$.$elem( "gsui-be-divider" ),
					$.$elem( "gsui-button", { "data-prop": "fullscr", light: true, icon: "expand", "data-tooltip": GSTX.$fullscreen } ),
				),
			),
			$elements: {
				$view: "gsui-buffer-view",
				$head: "gsui-be-head",
				$selBtns: "[data-prop^='sel']",
				$selAddBtn: "[data-prop='sel-add']",
				$selBtnActions: "gsui-button + [data-prop^='sel']",
				$fullscrBtn: "[data-prop='fullscr']",
			},
		} );
		this.$elements.$head.$onclick( e => {
			const act = $.$dataProp( e.target );
			const sel = this.$elements.$view.$getAttr( "selection" );

			switch ( act ) {
				case "sel-add": this.#toggleSelection( !sel ); break;
				case "sel-cut": this.#clickSelCut( sel ); break;
				case "sel-silent": this.#clickSelSilent( sel ); break;
				case "sel-reverse": this.#clickSelReverse( sel ); break;
				case "fullscr": this.#clickFullscreen(); break;
			}
		} );
	}
	$onmessage( key, val ) {
		switch ( key ) {
			case GSEV_BUFFEREDITOR_BUFFER: this.#setBuffer( this.#bufOriginal = val || null ); break;
		}
	}

	// .........................................................................
	#setBuffer( buf ) {
		this.#buf = buf;
		this.$elements.$view.$message( GSEV_BUFFERVIEW_BUFFER, buf );
	}
	#clickFullscreen() {
		this.$this.$toggleFullscreen().then( b => {
			this.$elements.$fullscrBtn
				.$setAttr( "data-tooltip", b ? GSTX.$exitFullscreen : GSTX.$fullscreen )
				.$setAttr( "icon", b ? "compress" : "expand" );
		} );
	}
	#clickSelSilent( sel ) {
		if ( sel ) {
			this.#setBuffer( GSUbufferSilent( this.#buf, ...GSUsplitNums( sel ) ) );
		}
	}
	#clickSelReverse( sel ) {
		if ( sel ) {
			this.#setBuffer( GSUbufferReverse( this.#buf, ...GSUsplitNums( sel ) ) );
		}
	}
	#clickSelCut( sel ) {
		if ( sel ) {
			this.#setBuffer( GSUbufferCut( this.#buf, ...GSUsplitNums( sel ) ) );
			this.#toggleSelection( false );
		}
	}
	#toggleSelection( b ) {
		this.$elements.$view.$setAttr( "selection", b ? this.#calcNewSelection() : false );
		this.$elements.$selBtns.$setAttr( "light", !b );
		this.$elements.$selBtnActions.$disabled( !b );
		this.$elements.$selAddBtn
			.$setAttr( "icon", b ? "square-dash" : "select-plus" )
			.$setAttr( "data-tooltip", b ? GSTX.$cancelSelection : GSTX.$newSelection );
	}
	#calcNewSelection() {
		const [ a, b ] = GSUsplitNums( this.$elements.$view.$getAttr( "view" ) );

		return `${ a + b / 4 } ${ b / 2 }`;
	}
}

$.$define( "gsui-buffer-editor", gsuiBufferEditor );
