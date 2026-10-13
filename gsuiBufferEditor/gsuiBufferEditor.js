"use strict";

class gsuiBufferEditor extends gsui0ne {
	#buf = null;
	#selection = null;

	constructor() {
		super( {
			$tagName: "gsui-buffer-editor",
			$template: $.$elem( "gsui-be-in", null,
				$.$elem( "gsui-buffer-view" ),
				$.$elem( "gsui-be-head", null,
					$.$elem( "gsui-buttons", null,
						$.$elem( "gsui-button", { "data-prop": "sel-add", light: true, model: "danger", icon: "select-plus", "data-tooltip": GSTX.$newSelection } ),
						$.$elem( "gsui-button", { "data-prop": "sel-cut", light: true, model: "danger", icon: "cut", "data-tooltip": GSTX.$cutSelectedAudio, disabled: true } ),
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
				$selCutBtn: "[data-prop='sel-cut']",
			},
		} );
		this.$elements.$head.$onclick( e => {
			const act = $.$dataProp( e.target );

			switch ( act ) {
				case "sel-add": this.#clickSelToggle(); break;
				case "sel-cut": this.#clickSelCut(); break;
				case "fullscr": this.#clickFullscreen(); break;
			}
		} );
	}
	static get observedAttributes() {
		return [];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
		}
	}
	$onmessage( key, val ) {
		switch ( key ) {
			case GSEV_BUFFEREDITOR_BUFFER: this.#onchangeBuffer( val ); break;
		}
	}

	// .........................................................................
	#onchangeBuffer( buf ) {
		this.#buf = buf;
		this.$elements.$view.$message( GSEV_BUFFERVIEW_BUFFER, buf );
	}
	#clickFullscreen() {
		this.$this.$toggleFullscreen();
	}
	#clickSelToggle() {
		this.#selection = this.#selection ? null : this.#calcNewSelection();
		this.$elements.$view.$setAttr( "selection", this.#selection || false );
		this.$elements.$selBtns.$setAttr( "light", !this.#selection );
		this.$elements.$selCutBtn.$disabled( !this.#selection );
		this.$elements.$selAddBtn.$setAttr( "data-tooltip", this.#selection ? GSTX.$cancelSelection : GSTX.$newSelection );
	}
	#clickSelCut() {
		if ( this.#selection ) {
			this.$this.$dispatch( GSEV_BUFFEREDITOR_CUT, ...GSUsplitNums( this.#selection ) );
		}
	}
	#calcNewSelection() {
		const [ a, b ] = GSUsplitNums( this.$elements.$view.$getAttr( "view" ) );

		return `${ a + b / 4 } ${ b / 2 }`;
	}
}

$.$define( "gsui-buffer-editor", gsuiBufferEditor );
