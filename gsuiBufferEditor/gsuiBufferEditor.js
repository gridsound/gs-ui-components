"use strict";

class gsuiBufferEditor extends gsui0ne {
	#buf = null;
	#bufPlayer = null;
	#changed = false;
	#loopA = 0;
	#loopB = 1;
	#playing = false;
	#intervalId = null;

	constructor() {
		super( {
			$tagName: "gsui-buffer-editor",
			$template: $.$elem( "gsui-be-in", null,
				$.$elem( "gsui-buffer-view" ),
				$.$elem( "gsui-be-head", null,
					$.$elem( "gsui-button", { "data-prop": "exit", light: true, model: "submit", icon: "run-exit-start", "data-tooltip": GSTX.$exitEditor } ),
					$.$elem( "gsui-be-divider" ),
					$.$elem( "gsui-buttons", null,
						$.$elem( "gsui-button", { "data-prop": "save", light: true, model: "submit", icon: "save", "data-tooltip": GSTX.$save, disabled: true } ),
						$.$elem( "gsui-button", { "data-prop": "sel-extract", light: true, model: "submit", icon: "extract", "data-tooltip": GSTX.$extractAudioNewSample, disabled: true } ),
					),
					$.$elem( "gsui-be-divider" ),
					$.$elem( "gsui-buttons", null,
						$.$elem( "gsui-button", { "data-prop": "play", light: true, icon: "play" } ),
						$.$elem( "gsui-button", { "data-prop": "stop", light: true, icon: "stop", disabled: true } ),
					),
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
				$saveBtn: "[data-prop='save']",
				$playBtn: "[data-prop='play']",
				$stopBtn: "[data-prop='stop']",
				$selAddBtn: "[data-prop='sel-add']",
				$selExtrBtn: "[data-prop='sel-extract']",
				$selBtnActions: "gsui-button + [data-prop^='sel']",
				$fullscrBtn: "[data-prop='fullscr']",
			},
		} );
		this.$this.$listen( {
			[ GSEV_BUFFERVIEW_SELECTION_CHANGE ]: d => this.#onchangeSelection( ...d.$args ),
		} );
		this.$elements.$head.$onclick( e => {
			const act = $.$dataProp( e.target );
			const sel = this.$elements.$view.$getAttr( "selection" );

			switch ( act ) {
				case "exit": this.#clickExit(); break;
				case "save": this.#clickSave(); break;
				case "play": this.#clickPlay(); break;
				case "stop": this.#clickStop(); break;
				case "sel-extract": this.#clickExtract( sel ); break;
				case "sel-add": this.#toggleSelection( !sel ); break;
				case "sel-cut": this.#clickSelCut( sel ); break;
				case "sel-silent": this.#clickSelSilent( sel ); break;
				case "sel-reverse": this.#clickSelReverse( sel ); break;
				case "fullscr": this.#clickFullscreen(); break;
			}
		} );
	}
	static get observedAttributes() {
		return [ "saving", "extracting" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "saving": this.$elements.$saveBtn.$loading( val === "" ); break;
			case "extracting": this.$elements.$selExtrBtn.$loading( val === "" ); break;
		}
	}
	$onmessage( key, val ) {
		switch ( key ) {
			case GSEV_BUFFEREDITOR_BUFFER:
				this.#setBuffer( GSUbufferClone( val ) );
				this.#setChanged( false );
				break;
		}
	}

	// .........................................................................
	#updateAudioSelection() {
		GSUaudioParamSet( this.#bufPlayer.$loopA, this.#loopA );
		GSUaudioParamSet( this.#bufPlayer.$loopB, this.#loopB );
	}
	#onchangeSelection( a, b ) {
		this.#loopA = a;
		this.#loopB = b;
		this.#updateAudioSelection();
	}
	#setChanged( b ) {
		this.#changed = b;
		this.$elements.$saveBtn.$disabled( !b ).$setAttr( "light", !b );
	}
	#setBuffer( buf ) {
		this.#buf = buf;
		this.#setChanged( true );
		this.$elements.$view.$message( GSEV_BUFFERVIEW_BUFFER, buf );
		gswaBuffers.$sabSetBuffer( "bufferplayer", buf );
		if ( !this.#bufPlayer ) {
			this.#bufPlayer = new gswaBufferPlayer();
			this.#bufPlayer.$bfplLoop( true );
			this.#bufPlayer.$bfplConnect( gswaContext.$getDest() );
		}
		this.#bufPlayer.$bfplSource( ...gswaBuffers.$sabGetBuffer( "bufferplayer" ) );
	}
	#clickPlay() {
		if ( this.#playing ) {
			GSUclearInterval( this.#intervalId );
			GSUaudioParamSet( this.#bufPlayer.$play, 0 );
		} else {
			gswaContext.$resume();
			// GSUaudioParamSet( this.#bufPlayer.$speed, 1 );
			GSUaudioParamSet( this.#bufPlayer.$play, 1 );
			this.#updateAudioSelection();
			this.#intervalId = GSUsetInterval( () => {
				this.$elements.$view.$setAttr( "time", this.#bufPlayer.$bfplTime() );
			}, 1 / 60 );
		}
		this.#playing = !this.#playing;
		this.$elements.$playBtn.$setAttr( "icon", this.#playing ? "pause" : "play" );
		this.$elements.$stopBtn.$disabled( false );
	}
	#clickStop() {
		this.#playing = false;
		GSUclearInterval( this.#intervalId );
		GSUaudioParamSet( this.#bufPlayer.$play, 0 );
		this.#bufPlayer.$bfplTime( 0 );
		this.$elements.$view.$setAttr( "time", 0 );
		this.$elements.$playBtn.$setAttr( "icon", "play" );
		this.$elements.$stopBtn.$disabled( true );
	}
	#clickExit() {
		this.$this.$dispatch( GSEV_BUFFEREDITOR_EXIT );
	}
	#clickFullscreen() {
		this.$this.$toggleFullscreen().then( b => {
			this.$elements.$fullscrBtn
				.$setAttr( "data-tooltip", b ? GSTX.$exitFullscreen : GSTX.$fullscreen )
				.$setAttr( "icon", b ? "compress" : "expand" );
		} );
	}
	#clickSave() {
		if ( this.#changed ) {
			this.$this
				.$addAttr( "saving" )
				.$dispatch( GSEV_BUFFEREDITOR_SAVE, GSUbufferClone( this.#buf ) );
			this.#setChanged( false );
		}
	}
	#clickExtract( sel ) {
		if ( sel ) {
			this.$this
				.$addAttr( "extracting" )
				.$dispatch( GSEV_BUFFEREDITOR_EXTRACT, GSUbufferClone( this.#buf, ...GSUsplitNums( sel ) ) );
		}
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
		this.$elements.$view.$setAttr( "selection", this.#calcNewSelection( b ) );
		this.$elements.$selBtns.$setAttr( "light", !b );
		this.$elements.$selBtnActions.$disabled( !b );
		this.$elements.$selAddBtn
			.$setAttr( "icon", b ? "square-dash" : "select-plus" )
			.$setAttr( "data-tooltip", b ? GSTX.$cancelSelection : GSTX.$newSelection );
		this.#updateAudioSelection();
	}
	#calcNewSelection( b ) {
		if ( b ) {
			const [ a, b ] = GSUsplitNums( this.$elements.$view.$getAttr( "view" ) );

			this.#loopA = a + b / 4;
			this.#loopB = b / 2;
			return `${ this.#loopA } ${ this.#loopB }`;
		}
		this.#loopA = 0;
		this.#loopB = 1;
		return false;
	}
}

$.$define( "gsui-buffer-editor", gsuiBufferEditor );
