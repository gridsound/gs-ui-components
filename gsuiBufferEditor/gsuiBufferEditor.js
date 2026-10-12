"use strict";

class gsuiBufferEditor extends gsui0ne {
	#buf = null;

	constructor() {
		super( {
			$tagName: "gsui-buffer-editor",
			$template: $.$elem( "gsui-be-in", null,
				$.$elem( "gsui-be-head", null,
					"audio-village"
				),
				$.$elem( "gsui-buffer-view" ),
			),
			$elements: {
				$view: "gsui-buffer-view",
			},
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
}

$.$define( "gsui-buffer-editor", gsuiBufferEditor );
