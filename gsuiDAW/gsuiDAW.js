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
				$vers: ".gsuiDAW-version",
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
					main: "[data-win='main']",
					synth: "[data-win='synth']",
					drums: "[data-win='drums']",
					piano: "[data-win='piano']",
					slicer: "[data-win='slicer']",
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

		this.$elements.$clock.$onchangeDisplay = display => this.$dispatch( "changeDisplayClock", display );
		this.$elements.$analyserHz.$setResolution( 140 );
		this.$elements.$head.onclick = this.#onclickHead.bind( this );
		this.#popups.about.versionCheck.onclick = () => {
			const dt = this.#popups.about.versionIcon.dataset;

			dt.icon = "none";
			dt.spin = "on";
			fetch( `https://gridsound.com/daw/VERSION?${ Math.random() }` )
				.then( res => res.text(), GSUnoop )
				.then( res => {
					dt.spin = "";
					dt.icon = res === GSUgetAttribute( this, "version" ) ? "check" : "warning";
				} );
		};
		this.#popups.settings.uiRateManualRange.onmousedown = () => this.#popups.settings.uiRateRadio.manual.checked = true;
		this.#popups.settings.uiRateManualRange.oninput = e => {
			this.#popups.settings.uiRateManualFPS.textContent =
				e.target.value.padStart( 2, "0" );
		};
		this.#popups.export.button.onclick = e => {
			const d = e.currentTarget.dataset;

			if ( d.status !== "2" ) {
				e.preventDefault();
			}
			if ( d.status === "0" ) {
				d.status = "1";
				document.querySelector( ".gsuiPopup-window" ).classList.add( "gsuiPopup-noCancelOverlay" );
				this.$dispatch( "export" );
			}
		};
		this.$elements.$windows.onkeydown = e => {
			if ( e.key === "Tab" ) {
				e.preventDefault();
			}
		};
		GSUlistenEvents( this, {
			gsuiTitleUser: {
				save: () => this.$dispatch( "save" ),
				rename: d => this.$dispatch( "rename", d.args[ 0 ] ),
			},
		} );
		GSUlistenEvents( this.$elements.$volume, {
			gsuiSlider: {
				input: d => this.$dispatch( "volume", d.args[ 0 ] ),
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				change: GSUnoop,
			},
		} );
		GSUlistenEvents( this.$elements.$currentTime, {
			gsuiSlider: {
				inputStart: d => {
					this.#timeSelecting = true;
					this.$elements.$clock.$setTime( d.args[ 0 ] );
				},
				inputEnd: () => {
					this.#timeSelecting = false;
				},
				input: d => {
					this.$elements.$clock.$setTime( d.args[ 0 ] );
					this.$dispatch( "currentTimeLive", d.args[ 0 ] );
				},
				change: d => {
					this.$dispatch( "currentTime", d.args[ 0 ] );
				},
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
				GSUsetAttribute( this.$elements.$titleUser, "cmpname", val );
				break;
			case "saved":
				GSUsetAttribute( this.$elements.$titleUser, "saved", val );
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
				GSUsetAttribute( this.$elements.$clock, "bpm", val );
				GSUsetAttribute( this.$elements.$tempo, "bpm", val );
			case "duration":
				this.#updateDuration();
				break;
			case "timedivision":
				GSUsetAttribute( this.$elements.$clock, "timedivision", val );
				GSUsetAttribute( this.$elements.$tempo, "timedivision", val );
				break;
			case "volume":
				this.$elements.$volume.$setValue( val );
				break;
			case "currenttime":
				if ( !this.#timeSelecting ) {
					this.$elements.$clock.$setTime( val );
					this.$elements.$currentTime.$setValue( val );
				}
				break;
			case "maxtime":
				GSUsetAttribute( this.$elements.$currentTime, "max", val );
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
		GSUsetAttribute( this.#popups.export.button, "href", url );
		GSUsetAttribute( this.#popups.export.button, "download", name );
		GSUsetAttribute( this.#popups.export.button, "data-status", 2 );
	}
	$toggleWindow( win, b ) {
		GSUsetAttribute( this.$elements.$winBtns[ win ], "data-open", b );
		if ( win === "patterns" ) {
			GSUsetAttribute( this.$elements.$body, "resources-hidden", !b );
		}
	}

	// .........................................................................
	#updateDuration() {
		const dur = GSUgetAttributeNum( this, "duration" );

		GSUsetAttribute( this.$elements.$titleUser, "cmpdur", dur / ( GSUgetAttributeNum( this, "bpm" ) / 60 ) );
		GSUsetAttribute( this.$elements.$currentTime, "max", dur );
	}

	// .........................................................................
	#onclickHead( e ) {
		const dt = e.target.dataset;

		switch ( dt.action ) {
			case "focusSwitch":
			case "play":
			case "stop":
			case "reset":
			case "undo":
			case "redo":
				this.$dispatch( dt.action );
				break;
			case "window":
				if ( dt.win !== "patterns" ) {
					this.$dispatch( dt.open === undefined ? "openWindow" : "closeWindow", dt.win );
				} else {
					this.$toggleWindow( "patterns", dt.open !== "" );
				}
				break;
			case "about":
				GSUpopup.$custom( { title: "About", element: this.#popups.about.root } );
				break;
			case "export":
				GSUsetAttribute( this, "exporting", 0 );
				GSUsetAttribute( this.#popups.export.button, "href", "" );
				GSUsetAttribute( this.#popups.export.button, "download", "" );
				GSUsetAttribute( this.#popups.export.button, "data-status", 0 );
				GSUpopup.$custom( { title: "Export", element: this.#popups.export.root } )
					.then( () => this.$dispatch( "abortExport" ) );
				break;
			case "settings":
				this.#popups.settings.sampleRate.value = GSUgetAttributeNum( this, "samplerate" );
				this.#popups.settings.keyNotation.value = GSUgetAttribute( this, "keynotation" );
				this.#popups.settings.timelineNumbering.value = GSUgetAttributeNum( this, "timelinenumbering" );
				this.#popups.settings.windowsLowGraphics.checked = GSUgetAttribute( this, "windowslowgraphics" ) === "";
				this.#popups.settings.uiRateRadio[ GSUgetAttribute( this, "uirate" ) === "auto" ? "auto" : "manual" ].checked = true;
				if ( GSUgetAttribute( this, "uirate" ) !== "auto" ) {
					this.#popups.settings.uiRateManualFPS.textContent = GSUgetAttribute( this, "uirate" ).padStart( 2, "0" );
					this.#popups.settings.uiRateManualRange.value = GSUgetAttribute( this, "uirate" );
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
									data.uiRate !== GSUgetAttribute( this, "uirate" ) &&
									data.uiRate !== GSUgetAttributeNum( this, "uirate" )
								) ||
								data.keyNotation !== GSUgetAttribute( this, "keynotation" ) ||
								data.sampleRate !== GSUgetAttributeNum( this, "samplerate" ) ||
								data.timelineNumbering !== GSUgetAttributeNum( this, "timelinenumbering" ) ||
								data.windowsLowGraphics !== ( GSUgetAttribute( this, "windowslowgraphics" ) === "" )
							) {
								this.$dispatch( "settings", data );
							}
						}
					} );
				break;
			case "help":
			case "changelog":
				break;
			default:
				dt.action && lg( "gsuiDAW: untracked action:", dt.action );
				break;
		}
	}
}

GSUdefineElement( "gsui-daw", gsuiDAW );
