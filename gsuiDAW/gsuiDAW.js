"use strict";

class gsuiDAW extends gsui0ne {
	$clock = null;
	#timeSelecting = false;
	#popups = {
		about: GSUfindElements( GSUgetTemplate( "gsui-daw-popup-about" ), {
			root: ".gsuiDAW-popup-about",
			version: ".gsuiDAW-popup-about-versionNum",
			versionIcon: ".gsuiDAW-popup-about-head .gsuiIcon",
			versionCheck: ".gsuiDAW-popup-about-versionCheck",
		} ),
		export: GSUfindElements( GSUgetTemplate( "gsui-daw-popup-export" ), {
			root: ".gsuiDAW-popup-export",
			button: ".gsuiDAW-popup-export-btn",
			progress: ".gsuiDAW-popup-export-progress",
		} ),
		settings: GSUfindElements( GSUgetTemplate( "gsui-daw-popup-settings" ), {
			root: ".gsuiDAW-popup-settings",
			sampleRate: "[name='sampleRate']",
			uiRateRadio: {
				auto: "[name='uiRate'][value='auto']",
				manual: "[name='uiRate'][value='manual']",
			},
			uiRateManualFPS: "[name='uiRate'][value='manual'] + .gsuiDAW-uiRateFps",
			uiRateManualRange: "[name='uiRateFPS']",
			windowsLowGraphics: "[name='windowsLowGraphics']",
			timelineNumbering: "[name='timelineNumbering']",
			keyNotation: "[name='keyNotation']",
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
				$winBtns: {
					patterns: "[data-win='patterns']",
					mixer: "[data-win='mixer']",
					composition: "[data-win='composition']",
					synth: "[data-win='synth']",
					drums: "[data-win='drums']",
					keys: "[data-win='keys']",
					slices: "[data-win='slices']",
					effects: "[data-win='effects']",
				},
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
		this.$clock = this.$elements.$clock; // do it by attribute
		Object.seal( this );

		this.$elements.$clock.$onchangeDisplay = display => GSUdomDispatch( this, GSEV_DAW_CHANGEDISPLAYCLOCK, display );
		this.$elements.$head.onclick = this.#onclickHead.bind( this );
		this.#popups.about.versionCheck.onclick = () => {
			const dt = this.#popups.about.versionIcon.dataset;

			dt.icon = "none";
			dt.spin = "on";
			fetch( `version?${ Math.random() }` )
				.then( res => res.text(), GSUnoop )
				.then( res => {
					dt.spin = "";
					dt.icon = res === GSUdomGetAttr( this, "version" ) ? "check" : "warning";
				} );
		};
		this.#popups.settings.uiRateManualRange.onmousedown = () => this.#popups.settings.uiRateRadio.manual.checked = true;
		this.#popups.settings.uiRateManualRange.oninput = e => this.#popups.settings.uiRateManualFPS.textContent = e.target.value.padStart( 2, "0" );
		this.#popups.export.button.onclick = e => {
			const d = e.currentTarget.dataset;

			if ( d.status !== "2" ) {
				e.preventDefault();
			}
			if ( d.status === "0" ) {
				d.status = "1";
				GSUdomSetAttr( GSUdomQS( ".gsuiPopup-window" ), "closedby", "none" );
				GSUdomDispatch( this, GSEV_DAW_EXPORT );
			}
		};
		this.$elements.$windows.onkeydown = e => {
			if ( e.key === "Tab" ) {
				e.preventDefault();
			}
		};
		GSUdomListen( this, {
			[ GSEV_TITLEUSER_SAVE ]: () => GSUdomDispatch( this, GSEV_DAW_SAVE ),
			[ GSEV_TITLEUSER_RENAME ]: ( _, name ) => GSUdomDispatch( this, GSEV_DAW_RENAME, name ),
		} );
		GSUdomListen( this.$elements.$volume, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_CHANGE ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( _, gain ) => GSUdomDispatch( this, GSEV_DAW_VOLUME, gain ),
		} );
		GSUdomListen( this.$elements.$currentTime, {
			[ GSEV_SLIDER_INPUTEND ]: () => this.#timeSelecting = false,
			[ GSEV_SLIDER_INPUTSTART ]: ( _, val ) => {
				this.#timeSelecting = true;
				this.$elements.$clock.$setTime( val );
			},
			[ GSEV_SLIDER_CHANGE ]: ( _, val ) => GSUdomDispatch( this, GSEV_DAW_CURRENTTIME, val ),
			[ GSEV_SLIDER_INPUT ]: ( _, val ) => {
				this.$elements.$clock.$setTime( val );
				GSUdomDispatch( this, GSEV_DAW_CURRENTTIMELIVE, val );
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
				this.#popups.export.progress.value = val;
				break;
			case "name":
				GSUdomSetAttr( this.$elements.$titleUser, "cmpname", val );
				break;
			case "saved":
				GSUdomSetAttr( this.$elements.$titleUser, "saved", val );
				break;
			case "playing":
				this.$elements.$play.dataset.icon = val !== null ? "pause" : "play";
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
				GSUdomSetAttr( this.$elements.$clock, "bpm", val );
				GSUdomSetAttr( this.$elements.$tempo, "bpm", val );
			case "duration":
				this.#updateDuration();
				break;
			case "timedivision":
				GSUdomSetAttr( this.$elements.$clock, "timedivision", val );
				GSUdomSetAttr( this.$elements.$tempo, "timedivision", val );
				break;
			case "volume":
				GSUdomSetAttr( this.$elements.$volume, "value", val );
				break;
			case "currenttime":
				if ( !this.#timeSelecting ) {
					this.$elements.$clock.$setTime( val );
					GSUdomSetAttr( this.$elements.$currentTime, "value", val );
				}
				break;
			case "maxtime":
				GSUdomSetAttr( this.$elements.$currentTime, "max", val );
				break;
			case "version":
				this.$elements.$vers.textContent = val;
				this.#popups.about.version.textContent = val;
				break;
		}
	}

	// .........................................................................
	$getTitleUser() {
		return this.$elements.$titleUser;
	}
	$updateSpectrum( data ) {
		this.$elements.$analyserHz.$draw( data );
	}
	$readyToDownload( url, name ) {
		GSUdomSetAttr( this.#popups.export.button, {
			href: url,
			download: name,
			"data-status": 2,
		} );
	}
	$toggleWindow( win, b ) {
		GSUdomSetAttr( this.$elements.$winBtns[ win ], "data-open", b );
		if ( win === "patterns" ) {
			GSUdomSetAttr( this.$elements.$body, "resources-hidden", !b );
		}
	}

	// .........................................................................
	#updateDuration() {
		const dur = GSUdomGetAttrNum( this, "duration" );

		GSUdomSetAttr( this.$elements.$titleUser, "cmpdur", dur / ( GSUdomGetAttrNum( this, "bpm" ) / 60 ) );
		GSUdomSetAttr( this.$elements.$currentTime, "max", dur );
	}

	// .........................................................................
	#onclickHead( e ) {
		const dt = e.target.dataset;

		switch ( dt.action ) {
			case "focusSwitch": GSUdomDispatch( this, GSEV_DAW_FOCUSSWITCH ); break;
			case "play": GSUdomDispatch( this, GSEV_DAW_PLAY ); break;
			case "stop": GSUdomDispatch( this, GSEV_DAW_STOP ); break;
			case "reset": GSUdomDispatch( this, GSEV_DAW_RESET ); break;
			case "undo": GSUdomDispatch( this, GSEV_DAW_UNDO ); break;
			case "redo": GSUdomDispatch( this, GSEV_DAW_REDO ); break;
			case "help": {
				const hide = GSUdomHasAttr( this, "gsuihelplink-hide" );

				GSUdomSetAttr( this, "gsuihelplink-hide", !hide );
				GSUdomDispatch( this, GSEV_DAW_TOGGLEHELPLINKS, hide );
			} break;
			case "window":
				if ( dt.win !== "patterns" ) {
					GSUdomDispatch( this, dt.open === undefined ? GSEV_DAW_OPENWINDOW : GSEV_DAW_CLOSEWINDOW, dt.win );
				} else {
					this.$toggleWindow( "patterns", dt.open !== "" );
				}
				break;
			case "about":
				GSUpopup.$custom( { title: "About", element: this.#popups.about.root } );
				break;
			case "export":
				GSUdomSetAttr( this, "exporting", 0 );
				GSUdomSetAttr( this.#popups.export.button, {
					href: "",
					download: "",
					"data-status": 0,
				} );
				GSUpopup.$custom( { title: "Export", element: this.#popups.export.root } )
					.then( () => GSUdomDispatch( this, GSEV_DAW_ABORTEXPORT ) );
				break;
			case "settings":
				this.#popups.settings.sampleRate.value = GSUdomGetAttrNum( this, "samplerate" );
				this.#popups.settings.keyNotation.value = GSUdomGetAttr( this, "keynotation" );
				this.#popups.settings.timelineNumbering.value = GSUdomGetAttrNum( this, "timelinenumbering" );
				this.#popups.settings.windowsLowGraphics.checked = GSUdomGetAttr( this, "windowslowgraphics" ) === "";
				this.#popups.settings.uiRateRadio[ GSUdomGetAttr( this, "uirate" ) === "auto" ? "auto" : "manual" ].checked = true;
				if ( GSUdomGetAttr( this, "uirate" ) !== "auto" ) {
					this.#popups.settings.uiRateManualFPS.textContent = GSUdomGetAttr( this, "uirate" ).padStart( 2, "0" );
					this.#popups.settings.uiRateManualRange.value = GSUdomGetAttr( this, "uirate" );
				}
				GSUpopup.$custom( { title: "Settings", element: this.#popups.settings.root } )
					.then( data => {
						if ( data ) {
							if ( data.uiRate === "manual" ) {
								data.uiRate = data.uiRateFPS;
							}
							delete data.uiRateFPS;
							if (
								(
									data.uiRate !== GSUdomGetAttr( this, "uirate" ) &&
									data.uiRate !== GSUdomGetAttrNum( this, "uirate" )
								) ||
								data.keyNotation !== GSUdomGetAttr( this, "keynotation" ) ||
								data.sampleRate !== GSUdomGetAttrNum( this, "samplerate" ) ||
								data.timelineNumbering !== GSUdomGetAttrNum( this, "timelinenumbering" ) ||
								data.windowsLowGraphics !== ( GSUdomGetAttr( this, "windowslowgraphics" ) === "" )
							) {
								GSUdomDispatch( this, GSEV_DAW_SETTINGS, data );
							}
						}
					} );
				break;
			case "changelog":
				break;
			default:
				dt.action && lg( "gsuiDAW: untracked action:", dt.action );
				break;
		}
	}
}

GSUdefineElement( "gsui-daw", gsuiDAW );
