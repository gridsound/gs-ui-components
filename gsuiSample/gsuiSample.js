"use strict";

class gsuiSample extends gsui0ne {
	#currentTiming = false;
	#frameId = null;
	#bufEdit = $noop;
	#bufPlayer = null;
	#loadedOnce = false;
	#intervalId = null;
	#promises = new Map( [
		[ "rename", ( _id, name ) => Promise.resolve( name ) ],
		[ "delete", () => Promise.resolve() ],
	] );

	constructor() {
		const popId = GSUuuid();

		super( {
			$tagName: "gsui-sample",
			$template: $.$elem( "gsui-sample-in", null,
				$.$elem( "gsui-sample-head", null,
					$.$button( { "data-prop": "grip" },
						$.$icon( { icon: "grip-v" } ),
					),
					$.$elem( "gsui-buttons", null,
						$.$elem( "gsui-button", { "data-prop": "play", icon: "play", model: "submit" } ),
						$.$elem( "gsui-button", { "data-prop": "stop", icon: "stop", model: "submit", disabled: true } ),
					),
					$.$elem( "gsui-sample-name", { class: "gsui-ellipsis" } ),
					$.$elem( "gsui-sample-format" ),
					$.$elem( "gsui-sample-info", null,
						$.$elem( "gsui-sample-duration" ),
						$.$elem( "gsui-sample-size" ),
					),
					$.$elem( "gsui-button", { "data-prop": "options", popovertarget: popId, icon: "ellipsis-v" } ),
				),
				$.$elem( "gsui-dropdown", { id: popId, clicknclose: true },
					$.$elem( "gsui-dropdown-option", { value: "rename",     icon: "pen",         name: GSTX.$rename               } ),
					$.$elem( "gsui-dropdown-option", { value: "edit",       icon: "square-dash", name: GSTX.$editTrim             } ),
					$.$elem( "gsui-dropdown-option", { value: "download",   icon: "download",    name: GSTX.$download             } ),
					$.$elem( "gsui-dropdown-option", { value: "convertmp3", icon: "file-mp3",    name: GSTX.$convertToMP3         } ),
					$.$elem( "gsui-dropdown-option", { value: "clonemp3",   icon: "file-mp3",    name: GSTX.$cloneToMP3           } ),
					$.$elem( "gsui-dropdown-option", { value: "delete",     icon: "trash",       name: GSTX.$delete, danger: true } ),
				),
				$.$elem( "gsui-sample-body", null,
					$.$elem( "gsui-sample-player", null,
						$.$elem( "gsui-waveform", { res: "512 256" } ),
						$.$elem( "gsui-sample-slider", null,
							$.$elem( "gsui-sample-cursor" ),
						),
					),
				),
			),
			$attributes: {
				tabindex: -1,
			},
			$elements: {
				$name: "gsui-sample-name",
				$infoDur: "gsui-sample-duration",
				$infoFormat: "gsui-sample-format",
				$infoSize: "gsui-sample-size",
				$slider: "gsui-sample-slider",
				$cursor: "gsui-sample-cursor",
				$playBtn: "[data-prop='play']",
				$stopBtn: "[data-prop='stop']",
				$menuBtn: "[data-prop='options']",
				$mp3Btns: "gsui-dropdown-option[value$='mp3']",
				$body: "gsui-sample-body",
				$waveform: "gsui-waveform",
				$editOpt: "gsui-dropdown-option[value='edit']",
			},
		} );
		this.$this.$on( {
			click: this.#onclick.bind( this ),
			dblclick: this.#dblclick.bind( this ),
		} );
		this.$elements.$slider.$on( {
			dragstart: e => e.preventDefault(),
			pointerdown: this.#sliderPtrDown.bind( this ),
			pointermove: this.#sliderPtrMove.bind( this ),
			pointerup: this.#sliderPtrUp.bind( this ),
		} );
		this.$this.$listen( {
			[ GSEV_BUFFEREDITOR_EXIT ]: () => {
				this.$this.$rmAttr( "editing" );
			},
			[ GSEV_DROPDOWN_CLICK ]: d => {
				switch ( d.$args[ 0 ] ) {
					case "edit": this.#clickEdit(); break;
					case "rename": this.#clickRename(); break;
					case "delete": this.#clickDelete(); break;
					case "download": this.#clickDownload(); break;
					case "clonemp3": this.#clickCloneMP3(); break;
					case "convertmp3": this.#clickConvertMP3(); break;
				}
				this.$this.$focus();
			},
		} );
		this.#setSlider( 0 );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "hash", "order", "name", "format", "size", "duration", "editing" ];
		// "playing"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "editing": this.#setEditing( val === "" ); break;
			case "order": this.$this.$css( "order", val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "size": this.$elements.$infoSize.$text( GSUmathFloatHuman( +val ) ); break;
			case "duration": this.$elements.$infoDur.$text( `${ val } ${ GSTX.$unitSecondSec }` ); break;
			case "format":
				this.$elements.$infoFormat.$text( val );
				this.$elements.$mp3Btns.$css( "display", val === "wav" ? "flex" : "none" );
			case "hash": this.#bufPlayer && this.#initAudio(); break;
		}
	}
	$onmessage( type, a, b ) {
		switch ( type ) {
			case GSEV_SAMPLE_DRAW: this.$elements.$waveform.$message( GSEV_WAVEFORM_DRAW, a ); break;
			case GSEV_SAMPLE_STOP: this.#audioStop(); break;
			case GSEV_SAMPLE_PLAYTOGGLE: this.#clickPlay(); break;
			case GSEV_API_PROMISE: this.#promises.set( a, b ); break;
		}
	}

	// .........................................................................
	#setEditing( b ) {
		this.$elements.$editOpt.$disabled( b );
		this.$elements.$playBtn.$disabled( b );
		if ( !b ) {
			this.#bufEdit.$remove();
			this.#bufEdit = $noop;
		} else {
			this.#bufEdit = $( "<gsui-buffer-editor>" ).$appendTo( this.$elements.$body );
			this.#audioStop();
			this.#getAudioBuffer()
				.then( buf => GSUwait( .2 ).then( () => buf ) )
				.then( buf => this.#bufEdit.$message( GSEV_BUFFEREDITOR_BUFFER, buf ) )
				.finally( () => this.$elements.$menuBtn.$loading( false ) );
		}
	}
	#sliderPtrDown( e ) {
		this.$elements.$slider.$setPtrCapture( e.pointerId );
		this.#currentTiming = true;
		this.#sliderPtrMove( e );
	}
	#sliderPtrMove( e ) {
		if ( this.#currentTiming ) {
			this.#setSlider( this.#getSliderVal( e.pageX ) );
		}
	}
	#sliderPtrUp( e ) {
		this.$elements.$slider.$relPtrCapture( e.pointerId );
		this.#currentTiming = false;
		if ( this.#bufPlayer ) {
			this.#bufPlayer.$bfplTime( this.#getSliderVal( e.pageX ) );
		}
	}
	#getSliderVal( px ) {
		const bcr = this.$elements.$slider.$bcr();

		return ( px - bcr.x ) / bcr.w;
	}
	#setSlider( n ) {
		const p = GSUmathClamp( n, 0, 1 ) * 100;

		this.$elements.$cursor
			.$left( p, "%" )
			.$css( "opacity", p === 0 || p === 100 ? 0 : 1 );
	}

	// .........................................................................
	#calcURL() {
		const [ hash, format ] = this.$this.$getAttr( "hash", "format" );

		return `${ GSURL.$gsSmps }/${ hash }.${ format }`;
	}
	#getAudioBuffer() {
		return fetch( this.#calcURL() )
			.then( res => res.arrayBuffer() )
			.then( arr => gswaContext.$decodeAudioData( arr ) );
	}
	#initAudio() {
		this.$elements.$playBtn.$loading( true );
		return gswaContext.$resume()
			.then( () => gswaContext.$loadModules() )
			.then( () => this.#getAudioBuffer() )
			.then( buf => {
				gswaBuffers.$sabSetBuffer( this.$this.$dataId(), buf );
				if ( !this.#bufPlayer ) {
					this.#bufPlayer = new gswaBufferPlayer();
					this.#bufPlayer.$bfplLoop( true );
					this.#bufPlayer.$bfplConnect( gswaContext.$getDest() );
				}
				this.#bufPlayer.$bfplSource( ...gswaBuffers.$sabGetBuffer( this.$this.$dataId() ) );
			} )
			.finally( () => this.$elements.$playBtn.$loading( false ) );
	}
	#audioPlay( b ) {
		if ( b ) {
			$( "gsui-sample[playing]" ).$message( GSEV_SAMPLE_STOP );
			this.#intervalId = GSUsetInterval( () => {
				if ( !this.#currentTiming ) {
					this.#setSlider( this.#bufPlayer.$bfplTime() );
				}
			}, 1 / 60 );
			this.$elements.$stopBtn.$disabled( false );
		} else {
			GSUclearInterval( this.#intervalId );
			this.#intervalId = null;
		}
		if ( this.#bufPlayer ) {
			GSUaudioParamSet( this.#bufPlayer.$play, +b );
			GSUaudioParamSet( this.#bufPlayer.$speed, 1 );
		}
		this.$this.$setAttr( "playing", b );
		this.$elements.$playBtn.$setAttr( "icon", b ? "pause" : "play" );
	}
	#audioStop() {
		this.#audioPlay( false );
		this.#bufPlayer?.$bfplKill();
		this.#bufPlayer = null;
		this.#setSlider( 0 );
		this.$elements.$stopBtn.$disabled( true );
	}

	// .........................................................................
	#onclick( e ) {
		switch ( $.$dataProp( e.target ) ) {
			case "play": this.#clickPlay(); break;
			case "stop": this.#audioStop(); break;
		}
		this.$this.$focus();
	}
	#dblclick( e ) {
		if ( $.$tag( e.target ) === "gsui-sample-name" ) {
			this.#clickRename();
		}
	}
	#clickPlay() {
		!this.#bufPlayer
			? this.#initAudio().then( () => this.#audioPlay( true ) )
			: this.#audioPlay( !this.#intervalId );
	}
	#clickRename() {
		this.$elements.$menuBtn.$loading( true );
		return $popup.$prompt( GSTX.$samplesMvSample, "", this.$this.$getAttr( "name" ) )
			.then( name => {
				if ( !name || name === this.$this.$getAttr( "name" ) ) {
					throw "";
				}
				return name;
			} )
			.then( name => this.#promises.get( "rename" )( this.$this.$dataId(), name ) )
			.then( name => this.$this.$setAttr( "name", name ) )
			.finally( () => this.$elements.$menuBtn.$loading( false ) );
	}
	#clickDownload() {
		const [ name, format ] = this.$this.$getAttr( "name", "format" );

		GSUdownloadURL( `${ name }.${ format }`, this.#calcURL() );
	}
	#clickDelete() {
		this.$elements.$menuBtn.$loading( true );
		this.#promises.get( "delete" )( this.$this.$dataId() )
			.then( () => this.$this.$setAttr( "size", 0 ).$dispatch( GSEV_SAMPLE_DELETED ).$remove() )
			.finally( () => this.$elements.$menuBtn.$loading( false ) );
	}
	#clickCloneMP3() {
		this.$this.$dispatch( GSEV_SAMPLE_CLONEMP3, this.$this.$dataId(), this.#calcURL() );
	}
	#clickConvertMP3() {
		this.$this.$dispatch( GSEV_SAMPLE_CONVERTMP3, this.$this.$dataId(), this.#calcURL() );
	}
	#clickEdit() {
		this.$elements.$menuBtn.$loading( true );
		this.$this.$addAttr( "editing" );
	}
}

$.$define( "gsui-sample", gsuiSample );
