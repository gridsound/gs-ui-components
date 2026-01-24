"use strict";

class gsuiDAW extends gsui0ne {
	#timeSelecting = false;
	#popups = {
		$about: GSUdomFind( GSUgetTemplate( "gsui-daw-popup-about" ), {
			$root: ".gsuiDAW-popup-about",
			$version: ".gsuiDAW-popup-about-versionNum",
			$versionIcon: ".gsuiDAW-popup-about-head .gsuiIcon",
			$versionCheck: ".gsuiDAW-popup-about-versionCheck",
		} ),
		$export: GSUdomFind( GSUgetTemplate( "gsui-daw-popup-export" ), {
			$root: ".gsuiDAW-popup-export",
			$btnRender: ".gsuiDAW-popup-export-render-btn",
			$btnUpload: ".gsuiDAW-popup-export-upload-btn",
			$btnClear: ".gsuiDAW-popup-export-clear-btn",
			$progress: ".gsuiDAW-popup-export-progress",
			$msg: ".gsuiDAW-popup-export-msg",
		} ),
		$settings: GSUdomFind( GSUgetTemplate( "gsui-daw-popup-settings" ), {
			$root: ".gsuiDAW-popup-settings",
			$sampleRate: "[name='sampleRate']",
			$uiRateRadio: {
				auto: "[name='uiRate'][value='auto']",
				manual: "[name='uiRate'][value='manual']",
			},
			$uiRateManualFPS: "[name='uiRate'][value='manual'] + .gsuiDAW-uiRateFps",
			$uiRateManualRange: "[name='uiRateFPS']",
			$windowsLowGraphics: "[name='windowsLowGraphics']",
			$timelineNumbering: "[name='timelineNumbering']",
			$keyNotation: "[name='keyNotation']",
		} ),
	};

	constructor() {
		super( {
			$cmpName: "gsuiDAW",
			$tagName: "gsui-daw",
			$elements: {
				$head: ".gsuiDAW-head",
				$titleUser: "gsui-titleuser",
				$play: "[data-action='play']",
				$vers: ".gsuiDAW-version-number",
				$clock: "gsui-clock",
				$tempo: "gsui-tempo",
				$analyserHz: "gsui-analyser-hz",
				$volume: ".gsuiDAW-volume gsui-slider",
				$currentTime: ".gsuiDAW-areaTime gsui-slider",
				$body: ".gsuiDAW-body",
				$patternsPanel: ".gsuiDAW-resources",
				$windows: "gsui-windows",
				$winBtns: "[data-win]",
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
		Object.seal( this );
		this.$elements.$head.$on( "click", this.#onclickHead.bind( this ) );
		this.#popups.$export.$btnRender.onclick = this.#onclickRenderBtn.bind( this );
		this.#popups.$export.$btnUpload.onclick = this.#onclickUploadBtn.bind( this );
		this.#popups.$export.$btnClear.onclick = this.#initRenderBtn.bind( this );
		this.#popups.$about.$versionCheck.onclick = this.#onclickVersionCheck.bind( this );
		this.#popups.$settings.$uiRateManualRange.onmousedown = () => this.#popups.$settings.$uiRateRadio.manual.checked = true;
		this.#popups.$settings.$uiRateManualRange.oninput = e => this.#popups.$settings.$uiRateManualFPS.textContent = e.target.value.padStart( 2, "0" );
		this.$elements.$windows.$on( "keydown", e => {
			if ( e.key === "Tab" ) {
				e.preventDefault();
			}
		} );
		this.#initRenderBtn();
		GSUdomListen( this, {
			[ GSEV_TITLEUSER_SAVE ]: () => this.$this.$dispatch( GSEV_DAW_SAVE ),
			[ GSEV_TITLEUSER_RENAME ]: ( _, name ) => this.$this.$dispatch( GSEV_DAW_RENAME, name ),
			[ GSEV_CLOCK_CHANGEDISPLAY ]: ( _, display ) => this.$this.$dispatch( GSEV_DAW_CHANGEDISPLAYCLOCK, display ),
		} );
		GSUdomListen( this.$elements.$volume.$get( 0 ), {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_CHANGE ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( _, gain ) => this.$this.$dispatch( GSEV_DAW_VOLUME, gain ),
		} );
		GSUdomListen( this.$elements.$currentTime.$get( 0 ), {
			[ GSEV_SLIDER_INPUTEND ]: () => this.#timeSelecting = false,
			[ GSEV_SLIDER_INPUTSTART ]: ( _, val ) => {
				this.#timeSelecting = true;
				this.$elements.$clock.$get( 0 ).$setTime( val );
			},
			[ GSEV_SLIDER_CHANGE ]: ( _, val ) => this.$this.$dispatch( GSEV_DAW_CURRENTTIME, val ),
			[ GSEV_SLIDER_INPUT ]: ( _, val ) => {
				this.$elements.$clock.$get( 0 ).$setTime( val );
				this.$this.$dispatch( GSEV_DAW_CURRENTTIMELIVE, val );
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
		];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "exporting":
				this.#popups.$export.$progress.value = +val || 0;
				break;
			case "name":
				this.$elements.$titleUser.$setAttr( "cmpname", val );
				break;
			case "saved":
				this.$elements.$titleUser.$setAttr( "saved", val );
				break;
			case "playing":
				this.$elements.$play.$setAttr( "data-icon", val !== null ? "pause" : "play" );
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
				this.#popups.$about.$version.textContent = val;
				break;
		}
	}

	// .........................................................................
	$getTitleUser() {
		return this.$elements.$titleUser.$get( 0 );
	}
	$updateSpectrum( data ) {
		this.$elements.$analyserHz.$get( 0 ).$draw( data );
	}
	$readyToDownload( url, name ) {
		GSUdomStyle( this.#popups.$export.$progress, "display", "none" );
		GSUdomStyle( this.#popups.$export.$btnUpload, "display", "" );
		GSUdomStyle( this.#popups.$export.$btnClear, "display", "" );
		GSUdomSetAttr( this.#popups.$export.$btnRender, {
			text: "Download OPUS/OGG file",
			icon: "export",
			href: url,
			loading: false,
			download: name,
		} );
		this.$setExportMsg( "Rendering complete" );
	}
	$toggleWindow( win, b ) {
		this.#getWinBtn( win ).$setAttr( "data-open", b );
		if ( win === "patterns" ) {
			this.$elements.$body.$setAttr( "resources-hidden", !b );
		}
	}

	// .........................................................................
	$setExportMsg( msg ) {
		this.#popups.$export.$msg.textContent = msg;
	}
	#updateDuration() {
		const dur = this.$this.$getAttr( "duration" );

		this.$elements.$titleUser.$setAttr( "cmpdur", dur / ( this.$this.$getAttr( "bpm" ) / 60 ) );
		this.$elements.$currentTime.$setAttr( "max", dur );
	}
	#initRenderBtn() {
		this.$setExportMsg( "" );
		this.$this.$rmAttr( "exporting" );
		GSUdomRmAttr( this.#popups.$export.$btnUpload, "disabled" );
		GSUdomSetAttr( this.#popups.$export.$btnRender, {
			text: "Render",
			icon: "render",
			href: false,
			loading: false,
			download: false,
		} );
		GSUdomStyle( this.#popups.$export.$progress, "display", "" );
		GSUdomStyle( this.#popups.$export.$btnUpload, "display", "none" );
		GSUdomStyle( this.#popups.$export.$btnClear, "display", "none" );
	}

	// .........................................................................
	#getWinBtn( win ) {
		return this.$elements.$winBtns.$filter( `[data-win="${ win }"]` );
	}
	#onopenRenderPopup() {
		if ( this.$this.$getAttr( "exporting" ) === "1" ) {
			this.$setExportMsg( "Rendering complete" );
		}
		GSUpopup.$custom( {
			title: "Export",
			element: this.#popups.$export.$root,
			ok: "close",
		} ).then( () => {
			if ( this.$this.$getAttr( "exporting" ) !== "1" ) {
				this.#initRenderBtn();
			}
			this.$this.$dispatch( GSEV_DAW_ABORTEXPORT );
		} );
	}
	#onclickRenderBtn() {
		if ( !GSUdomHasAttr( this.#popups.$export.$btnRender, "download" ) ) {
			GSUdomSetAttr( this.#popups.$export.$btnRender, {
				text: "Rendering...",
				loading: true,
				icon: false,
				href: false,
			} );
			GSUdomSetAttr( GSUdomQS( ".gsuiPopup-window" ), "closedby", "none" );
			this.$this.$dispatch( GSEV_DAW_EXPORT );
		}
	}
	#onclickUploadBtn() {
		if ( !this.$elements.$titleUser.$hasAttr( "connected" ) ) {
			this.$setExportMsg( "You need to be connected to upload your rendered composition" );
		} else {
			GSUdomSetAttr( this.#popups.$export.$btnUpload, "disabled", true );
			this.$this.$dispatch( GSEV_DAW_UPLOAD_CMP );
		}
	}
	#onclickVersionCheck() {
		const dt = this.#popups.$about.$versionIcon.dataset;

		dt.icon = "none";
		dt.spin = "on";
		fetch( `version?${ Math.random() }` )
			.then( res => res.text(), GSUnoop )
			.then( res => {
				dt.spin = "";
				dt.icon = res === this.$this.$getAttr( "version" ) ? "check" : "warning";
			} );
	}
	#onopenSettingsPopup() {
		this.#popups.$settings.$sampleRate.value = +this.$this.$getAttr( "samplerate" );
		this.#popups.$settings.$keyNotation.value = this.$this.$getAttr( "keynotation" );
		this.#popups.$settings.$timelineNumbering.value = +this.$this.$getAttr( "timelinenumbering" );
		this.#popups.$settings.$windowsLowGraphics.checked = this.$this.$getAttr( "windowslowgraphics" ) === "";
		this.#popups.$settings.$uiRateRadio[ this.$this.$getAttr( "uirate" ) === "auto" ? "auto" : "manual" ].checked = true;
		if ( this.$this.$getAttr( "uirate" ) !== "auto" ) {
			this.#popups.$settings.$uiRateManualFPS.textContent = this.$this.$getAttr( "uirate" ).padStart( 2, "0" );
			this.#popups.$settings.$uiRateManualRange.value = this.$this.$getAttr( "uirate" );
		}
		GSUpopup.$custom( { title: "Settings", element: this.#popups.$settings.$root } )
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
					data.uiRate !== this.$this.$getAttr( "uirate" ) &&
					data.uiRate !== +this.$this.$getAttr( "uirate" )
				) ||
				data.keyNotation !== this.$this.$getAttr( "keynotation" ) ||
				data.sampleRate !== +this.$this.$getAttr( "samplerate" ) ||
				data.timelineNumbering !== +this.$this.$getAttr( "timelinenumbering" ) ||
				data.windowsLowGraphics !== ( this.$this.$getAttr( "windowslowgraphics" ) === "" )
			) {
				this.$this.$dispatch( GSEV_DAW_SETTINGS, data );
			}
		}
	}
	#onclickHead( e ) {
		const dt = e.target.dataset;

		switch ( dt.action ) {
			case "focusSwitch": this.$this.$dispatch( GSEV_DAW_FOCUSSWITCH ); break;
			case "play": this.$this.$dispatch( GSEV_DAW_PLAY ); break;
			case "stop": this.$this.$dispatch( GSEV_DAW_STOP ); break;
			case "reset": this.$this.$dispatch( GSEV_DAW_RESET ); break;
			case "undo": this.$this.$dispatch( GSEV_DAW_UNDO ); break;
			case "redo": this.$this.$dispatch( GSEV_DAW_REDO ); break;
			case "export": this.#onopenRenderPopup(); break;
			case "settings": this.#onopenSettingsPopup(); break;
			case "about": GSUpopup.$custom( { title: "About", element: this.#popups.$about.$root } ); break;
			case "help": {
				const hide = this.$this.$hasAttr( "gsuihelplink-hide" );

				GSUdomSetAttr( this, "gsuihelplink-hide", !hide );
				this.$this.$dispatch( GSEV_DAW_TOGGLEHELPLINKS, hide );
			} break;
			case "window":
				if ( dt.win !== "patterns" ) {
					this.$this.$dispatch( dt.open === undefined ? GSEV_DAW_OPENWINDOW : GSEV_DAW_CLOSEWINDOW, dt.win );
				} else {
					this.$toggleWindow( "patterns", dt.open !== "" );
				}
				break;
			case "changelog":
				break;
			default:
				dt.action && lg( "gsuiDAW: untracked action:", dt.action );
				break;
		}
	}
}

GSUdomDefine( "gsui-daw", gsuiDAW );
