"use strict";

class gsuiDAW extends gsui0ne {
	#timeSelecting = false;
	#popups = {
		$about: $( $.$getTemplate( "gsui-daw-popup-about" ) ).$queryMap( {
			$root: ".gsuiDAW-popup-about",
			$version: ".gsuiDAW-popup-about-versionNum",
			$versionIcon: ".gsuiDAW-popup-about-head gsui-icon",
			$versionCheck: ".gsuiDAW-popup-about-versionCheck",
		} ),
		$export: $( $.$getTemplate( "gsui-daw-popup-export" ) ).$queryMap( {
			$root: ".gsuiDAW-popup-export",
			$btnRender: ".gsuiDAW-popup-export-render-btn",
			$btnUpload: ".gsuiDAW-popup-export-upload-btn",
			$btnClear: ".gsuiDAW-popup-export-clear-btn",
			$progress: ".gsuiDAW-popup-export-progress",
			$msg: ".gsuiDAW-popup-export-msg",
		} ),
		$settings: $( $.$getTemplate( "gsui-daw-popup-settings" ) ).$queryMap( {
			$root: ".gsuiDAW-popup-settings",
			$sampleRate: "[name='sampleRate']",
			$uiRateAuto: "[name='uiRate'][value='auto']",
			$uiRateManual: "[name='uiRate'][value='manual']",
			$uiRateManualFPS: "[name='uiRate'][value='manual'] + .gsuiDAW-uiRateFps",
			$uiRateManualRange: "[name='uiRateFPS']",
			$windowsLowGraphics: "[name='windowsLowGraphics']",
			$timelineNumbering: "[name='timelineNumbering']",
			$keyNotation: "[name='keyNotation']",
		} ),
	};

	constructor() {
		super( {
			$tagName: "gsui-daw",
			$elements: {
				$head: "gsui-daw-head",
				$titleUser: "gsui-titleuser",
				$play: "[data-action='play']",
				$vers: "gsui-daw-version",
				$helpBtn: "gsui-daw-head [data-action='help']",
				$clock: "gsui-clock",
				$tempo: "gsui-tempo",
				$analyserHz: "gsui-analyser-hz",
				$volume: "gsui-daw-volume gsui-slider",
				$currentTime: "gsui-daw-area[area='time'] gsui-slider",
				$patternsPanel: "gsui-daw-resources",
				$windows: "gsui-windows",
				$winBtns: "gsui-daw-area[area='wins'] *",
			},
			$attributes: {
				saved: true,
				uirate: "auto",
				timelinenumbering: 0,
				keynotation: "DoRéMi",
				bpm: 60,
				name: "",
				duration: 10,
				timedivision: "1/1",
				currenttime: 0,
				maxtime: 1,
				volume: 1,
				version: "0.0.0",
			},
		} );
		gsuiTexture.$set( this.$elements.$windows, "diag" );
		this.$elements.$head.$onclick( this.#onclickHead.bind( this ) );
		this.$elements.$winBtns.$each( btn => this.#updateWinBtnTooltip( $( btn ) ) );
		this.#popups.$export.$btnRender.$onclick( this.#onclickRenderBtn.bind( this ) );
		this.#popups.$export.$btnUpload.$onclick( this.#onclickUploadBtn.bind( this ) );
		this.#popups.$export.$btnClear.$onclick( this.#initRenderBtn.bind( this ) );
		this.#popups.$about.$versionCheck.$onclick( this.#onclickVersionCheck.bind( this ) );
		this.#popups.$settings.$uiRateManualRange.$on( {
			mousedown: () => this.#popups.$settings.$uiRateManual.$checked( true ),
			input: e => this.#popups.$settings.$uiRateManualFPS.$text( e.target.value.padStart( 2, "0" ) ),
		} );
		this.$elements.$windows.$on( "keydown", e => {
			if ( e.key === "Tab" ) {
				e.preventDefault();
			}
		} );
		this.#initRenderBtn();
		this.$listen( {
			[ GSEV_TITLEUSER_SAVE ]: () => this.$dispatch( GSEV_DAW_SAVE ),
			[ GSEV_TITLEUSER_RENAME ]: ( _, name ) => this.$dispatch( GSEV_DAW_RENAME, name ),
			[ GSEV_CLOCK_CHANGEDISPLAY ]: ( _, display ) => this.$dispatch( GSEV_DAW_CHANGEDISPLAYCLOCK, display ),
		} );
		this.$elements.$volume.$listen( {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_CHANGE ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( _, gain ) => this.$dispatch( GSEV_DAW_VOLUME, gain ),
		} );
		this.$elements.$currentTime.$listen( {
			[ GSEV_SLIDER_INPUTEND ]: () => this.#timeSelecting = false,
			[ GSEV_SLIDER_INPUTSTART ]: ( _, val ) => {
				this.#timeSelecting = true;
				this.$elements.$clock.$get( 0 ).$setTime( val );
			},
			[ GSEV_SLIDER_CHANGE ]: ( _, val ) => this.$dispatch( GSEV_DAW_CURRENTTIME, val ),
			[ GSEV_SLIDER_INPUT ]: ( _, val ) => {
				this.$elements.$clock.$get( 0 ).$setTime( val );
				this.$dispatch( GSEV_DAW_CURRENTTIMELIVE, val );
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [
			"saved",
			"bpm",
			"currenttime",
			"duration",
			"exporting",
			"maxtime",
			"name",
			"playing",
			"timedivision",
			"timelinenumbering",
			"keynotation",
			"version",
			"volume",
			"helping",
		];
	}
	$attributeChanged( prop, val ) {
		const b = val === "";

		switch ( prop ) {
			case "exporting":
				this.#popups.$export.$progress.$value( +val || 0 );
				break;
			case "name":
				this.$elements.$titleUser.$setAttr( "cmpname", val );
				break;
			case "saved":
				this.$elements.$titleUser.$setAttr( "saved", val );
				break;
			case "playing":
				this.$elements.$play.$child( 0 ).$setAttr( "icon", b ? "pause" : "play" );
				break;
			case "timelinenumbering":
				gsuiClock.$numbering( val );
				gsuiTimeline.$numbering( val );
				break;
			case "keynotation":
				gsuiKeys.$keyNotation( val );
				gsuiPianoroll.$keyNotation( val );
				break;
			case "bpm":
				this.$elements.$clock.$setAttr( "bpm", val );
				this.$elements.$tempo.$setAttr( "bpm", val );
			case "duration":
				this.#updateDuration();
				break;
			case "timedivision":
				this.$elements.$clock.$setAttr( "timedivision", val );
				this.$elements.$tempo.$setAttr( "timedivision", val );
				break;
			case "volume":
				this.$elements.$volume.$setAttr( "value", val );
				break;
			case "currenttime":
				if ( !this.#timeSelecting ) {
					this.$elements.$clock.$get( 0 ).$setTime( val );
					this.$elements.$currentTime.$setAttr( "value", val );
				}
				break;
			case "maxtime":
				this.$elements.$currentTime.$setAttr( "max", val );
				break;
			case "version":
				this.$elements.$vers.$text( val );
				this.#popups.$about.$version.$text( val );
				break;
			case "helping":
				b
					? gsuiTooltip.$start()
					: gsuiTooltip.$stop();

				this.$elements.$helpBtn
					.$setAttr( "data-tooltip", !b ? GSTX.$daw_showHelp : GSTX.$daw_hideHelp )
					.$child( 0 )
					.$setAttr( "icon", b ? "question" : "cu-no-question" );
				this.$setAttr( "helping", b )
					.$setAttr( "gsuihelplink-show", b )
					.$dispatch( GSEV_DAW_TOGGLEHELPLINKS, b );
				break;
		}
	}

	// .........................................................................
	$updateSpectrum( data ) {
		this.$elements.$analyserHz.$get( 0 ).$draw( data );
	}
	$readyToDownload( url, name ) {
		this.#popups.$export.$progress.$css( "display", "none" );
		this.#popups.$export.$btnUpload.$css( "display", "" );
		this.#popups.$export.$btnClear.$css( "display", "" );
		this.#popups.$export.$btnRender.$setAttr( {
			text: "Download MP3",
			icon: "export",
			href: url,
			loading: false,
			download: name,
		} );
		this.$setExportMsg( "Rendering complete" );
	}
	$toggleWindow( win, b ) {
		this.#updateWinBtnTooltip( this.#getWinBtn( win ).$setAttr( "data-open", b ) );
		if ( win === "patterns" ) {
			this.$setAttr( "resources-hidden", !b );
		}
	}
	#updateWinBtnTooltip( btn ) {
		const tooltip = GSTXreplace( btn.$hasAttr( "data-open" )
			? GSTX.$daw_closeWindow
			: GSTX.$daw_openWindow, btn.$getAttr( "data-name" ) );

		btn.$setAttr( "data-tooltip", tooltip );
	}

	// .........................................................................
	$setExportMsg( msg ) {
		this.#popups.$export.$msg.$text( msg );
	}
	#updateDuration() {
		const dur = this.$getAttr( "duration" );

		this.$elements.$titleUser.$setAttr( "cmpdur", dur / ( this.$getAttr( "bpm" ) / 60 ) );
		this.$elements.$currentTime.$setAttr( "max", dur );
	}
	#initRenderBtn() {
		this.$setExportMsg( "" );
		this.$rmAttr( "exporting" );
		this.#popups.$export.$btnUpload.$disabled( false );
		this.#popups.$export.$btnRender.$setAttr( {
			text: "Render",
			icon: "render",
			href: false,
			loading: false,
			download: false,
		} );
		this.#popups.$export.$progress.$css( "display", "" );
		this.#popups.$export.$btnUpload.$css( "display", "none" );
		this.#popups.$export.$btnClear.$css( "display", "none" );
	}

	// .........................................................................
	#getWinBtn( win ) {
		return this.$elements.$winBtns.$filter( `[data-prop="${ win }"]` );
	}
	#onopenRenderPopup() {
		if ( this.$getAttr( "exporting" ) === "1" ) {
			this.$setExportMsg( "Rendering complete" );
		}
		$popup.$custom( {
			title: "Export",
			element: this.#popups.$export.$root,
			ok: "close",
		} ).then( () => {
			if ( this.$getAttr( "exporting" ) !== "1" ) {
				this.#initRenderBtn();
			}
			this.$dispatch( GSEV_DAW_ABORTEXPORT );
		} );
	}
	#onclickRenderBtn() {
		if ( !this.#popups.$export.$btnRender.$hasAttr( "download" ) ) {
			this.#popups.$export.$btnRender.$setAttr( {
				text: "Rendering...",
				loading: true,
				icon: false,
				href: false,
			} );
			$( ".gsuiPopup-window" ).$setAttr( "closedby", "none" );
			this.$dispatch( GSEV_DAW_EXPORT );
		}
	}
	#onclickUploadBtn() {
		if ( !this.$elements.$titleUser.$hasAttr( "connected" ) ) {
			this.$setExportMsg( "You need to be connected to upload your rendered composition" );
		} else {
			this.#popups.$export.$btnUpload.$disabled( true );
			this.$dispatch( GSEV_DAW_UPLOAD_CMP );
		}
	}
	#onclickVersionCheck() {
		this.#popups.$about.$versionIcon.$addAttr( "spin" );
		gsapiClient.$getDAWversion().then( res => {
			this.#popups.$about.$versionIcon.$setAttr( {
				icon: res === this.$getAttr( "version" ) ? "check" : "warning",
				spin: false,
			} );
		} );
	}
	#onopenSettingsPopup() {
		const p = this.#popups.$settings;
		const uiRate = this.$getAttr( "uirate" );
		const uiRateAuto = uiRate === "auto";

		p.$sampleRate.$value( +this.$getAttr( "samplerate" ) );
		p.$keyNotation.$value( this.$getAttr( "keynotation" ) );
		p.$timelineNumbering.$value( +this.$getAttr( "timelinenumbering" ) );
		p.$windowsLowGraphics.$checked( this.$getAttr( "windowslowgraphics" ) === "" );
		if ( uiRateAuto ) {
			p.$uiRateAuto.$checked( true );
		} else {
			p.$uiRateManual.$checked( true );
			p.$uiRateManualFPS.$text( uiRate.padStart( 2, "0" ) );
			p.$uiRateManualRange.$value( uiRate );
		}
		$popup.$custom( { title: "Settings", element: p.$root } )
			.then( this.#onsubmitSettingsPopup.bind( this ) );
	}
	#onsubmitSettingsPopup( data ) {
		if ( data ) {
			if ( data.uiRate === "manual" ) {
				data.uiRate = data.uiRateFPS;
			}
			data.skin = "gray";
			delete data.uiRateFPS;
			if (
				(
					data.uiRate !== this.$getAttr( "uirate" ) &&
					data.uiRate !== +this.$getAttr( "uirate" )
				) ||
				data.keyNotation !== this.$getAttr( "keynotation" ) ||
				data.sampleRate !== +this.$getAttr( "samplerate" ) ||
				data.timelineNumbering !== +this.$getAttr( "timelinenumbering" ) ||
				data.windowsLowGraphics !== ( this.$getAttr( "windowslowgraphics" ) === "" )
			) {
				this.$dispatch( GSEV_DAW_SETTINGS, data );
			}
		}
	}
	#onclickHead( e ) {
		const tar = e.target;

		switch ( $.$dataAction( tar ) ) {
			case "focus": this.$dispatch( GSEV_DAW_FOCUSSWITCH ); break;
			case "play": this.$dispatch( GSEV_DAW_PLAY ); break;
			case "stop": this.$dispatch( GSEV_DAW_STOP ); break;
			case "undo": this.$dispatch( GSEV_DAW_UNDO ); break;
			case "redo": this.$dispatch( GSEV_DAW_REDO ); break;
			case "help": this.$togAttr( "helping" ); break;
			case "export": this.#onopenRenderPopup(); break;
			case "settings": this.#onopenSettingsPopup(); break;
			case "about": $popup.$custom( { title: "About", element: this.#popups.$about.$root } ); break;
			case "window":
				$.$dataProp( tar ) === "patterns"
					? this.$toggleWindow( "patterns", !$.$hasAttr( tar, "data-open" ) )
					: this.$dispatch( $.$hasAttr( tar, "data-open" )
						? GSEV_DAW_CLOSEWINDOW
						: GSEV_DAW_OPENWINDOW, $.$dataProp( tar ) );
				break;
		}
	}
}

$.$define( "gsui-daw", gsuiDAW );
