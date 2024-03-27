"use strict";

class gsuiDAW extends HTMLElement {
	onSubmitLogin = GSUnoop;
	onSubmitOpen = GSUnoop;
	onExportJSON = GSUnoop;
	#cmps = {
		local: new Map(),
		cloud: new Map(),
	};
	#cmpId = null;
	#cmpSaveMode = "local";
	#currentActionInd = -1;
	#actions = null;
	#dispatch = GSUdispatchEvent.bind( null, this, "gsuiDAW" );
	#children = GSUgetTemplate( "gsui-daw" );
	#timeSelecting = false;
	#elements = GSUfindElements( this.#children, {
		head: ".gsuiDAW-head",
		bpm: ".gsuiDAW-tempo-bpm",
		bPM: ".gsuiDAW-tempo-beatsPerMeasure",
		sPB: ".gsuiDAW-tempo-stepsPerBeat",
		cmpName: ".gsuiDAW-currCmp-name",
		cmpSave: ".gsuiDAW-currCmp-saveBtn",
		cmpIcon: ".gsuiDAW-currCmp-localIcon",
		cmpDuration: ".gsuiDAW-currCmp-dur",
		play: "[data-action='play']",
		vers: ".gsuiDAW-version",
		clock: "gsui-clock",
		spectrum: "gsui-spectrum",
		volume: ".gsuiDAW-volume gsui-slider",
		currentTime: ".gsuiDAW-areaTime gsui-slider",
		userAvatar: "[data-action='profile']",
		login: "[data-action='login']",
		logout: "[data-action='logout']",
		cmpsLocalList: ".gsuiDAW-dropdown-list[data-list='local']",
		cmpsCloudList: ".gsuiDAW-dropdown-list[data-list='cloud']",
		historyList: ".gsuiDAW-history .gsuiDAW-dropdown-list",
		body: ".gsuiDAW-body",
		patternsPanel: ".gsuiDAW-resources",
		windows: "gsui-windows",
		winBtns: {
			patterns: "[data-win='patterns']",
			mixer: "[data-win='mixer']",
			main: "[data-win='main']",
			synth: "[data-win='synth']",
			drums: "[data-win='drums']",
			piano: "[data-win='piano']",
			slicer: "[data-win='slicer']",
			effects: "[data-win='effects']",
		},
	} );
	#popups = {
		auth: GSUfindElements( GSUgetTemplate( "gsui-daw-popup-auth" ), {
			root: ".gsuiDAW-popup-auth",
			error: ".gsuiDAW-popup-auth-error",
		} ),
		open: GSUfindElements( GSUgetTemplate( "gsui-daw-popup-open" ), {
			root: ".gsuiDAW-popup-open",
			inputOpenURL: "[name='url']",
			inputOpenFile: "[name='file']",
		} ),
		tempo: GSUfindElements( GSUgetTemplate( "gsui-daw-popup-tempo" ), {
			root: ".gsuiDAW-popup-tempo",
			beatsPerMeasure: "[name='beatsPerMeasure']",
			stepsPerBeat: "[name='stepsPerBeat']",
			bpm: "[name='bpm']",
			bpmTap: ".gsuiDAW-bpmTap",
		} ),
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
		} ),
	};

	constructor() {
		super();
		this.clock = this.#elements.clock;
		this.spectrum = this.#elements.spectrum;
		Object.seal( this );

		this.clock.$onchangeDisplay = display => this.#dispatch( "changeDisplayClock", display );
		this.spectrum.$setResolution( 140 );
		this.#actions = this.#elements.historyList.getElementsByClassName( "gsuiDAW-history-action" );
		this.#elements.head.onclick = this.#onclickHead.bind( this );
		this.#elements.cmpsCloudList.ondragstart = gsuiDAW.#ondragstartCmp.bind( null, "cloud" );
		this.#elements.cmpsLocalList.ondragstart = gsuiDAW.#ondragstartCmp.bind( null, "local" );
		this.#elements.cmpsCloudList.ondragover =
		this.#elements.cmpsLocalList.ondragover = e => e.preventDefault();
		this.#elements.cmpsCloudList.ondrop =
		this.#elements.cmpsLocalList.ondrop = this.#ondropCmp.bind( this );
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
		this.#popups.tempo.bpmTap.onclick = () => this.#popups.tempo.bpm.value = gswaBPMTap.$tap();
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
				this.#dispatch( "export" );
			}
		};
		this.#elements.windows.onkeydown = e => {
			if ( e.key === "Tab" ) {
				e.preventDefault();
			}
		};
		GSUlistenEvents( this.#elements.volume, {
			gsuiSlider: {
				input: d => this.#dispatch( "volume", d.args[ 0 ] ),
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				change: GSUnoop,
			},
		} );
		GSUlistenEvents( this.#elements.currentTime, {
			gsuiSlider: {
				inputStart: d => {
					this.#timeSelecting = true;
					this.#elements.clock.$setTime( d.args[ 0 ] );
				},
				inputEnd: () => {
					this.#timeSelecting = false;
				},
				input: d => {
					this.#elements.clock.$setTime( d.args[ 0 ] );
					this.#dispatch( "currentTimeLive", d.args[ 0 ] );
				},
				change: d => {
					this.#dispatch( "currentTime", d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUrecallAttributes( this, {
				saved: true,
				uirate: "auto",
				timelinenumbering: 0,
				bpm: 60,
				name: "",
				duration: 10,
				timedivision: "1/1",
				currenttime: 0,
				maxtime: 1,
				volume: 1,
				version: "0.0.0",
			} );
		}
	}
	static get observedAttributes() {
		return [
			"bpm",
			"currentcomposition",
			"currenttime",
			"duration",
			"errauth",
			"exporting",
			"logging",
			"maxtime",
			"name",
			"playing",
			"saving",
			"timedivision",
			"timelinenumbering",
			"useravatar",
			"username",
			"version",
			"volume",
		];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "currentcomposition":
					val
						? this.#loadComposition( ...val.split( ":" ) )
						: this.#unloadComposition();
					break;
				case "errauth":
					this.#popups.auth.error.textContent = val;
					break;
				case "exporting":
					this.#popups.export.progress.value = val;
					break;
				case "logging":
					this.#elements.login.dataset.spin =
					this.#elements.logout.dataset.spin = val !== null ? "on" : "";
					break;
				case "username":
					GSUsetAttribute( this.#elements.userAvatar, "href",
						val && `https://gridsound.com/#/u/${ val }` );
					break;
				case "name":
					this.#elements.cmpName.textContent = val;
					break;
				case "playing":
					this.#elements.play.dataset.icon = val !== null ? "pause" : "play";
					break;
				case "saving":
					this.#cmps[ this.#cmpSaveMode ].get( this.#cmpId ).save.dataset.spin =
					this.#elements.cmpSave.dataset.spin = val !== null ? "on" : "";
					break;
				case "duration":
					this.#updateDuration();
					break;
				case "timelinenumbering":
					gsuiClock.$numbering( val );
					break;
				case "bpm":
					GSUsetAttribute( this.#elements.clock, "bpm", val );
					this.#elements.bpm.textContent = val;
					this.#updateDuration();
					break;
				case "timedivision":
					GSUsetAttribute( this.#elements.clock, "timedivision", val );
					this.#elements.bPM.textContent = val.split( "/" )[ 0 ];
					this.#elements.sPB.textContent = val.split( "/" )[ 1 ];
					break;
				case "volume":
					this.#elements.volume.$setValue( val );
					break;
				case "currenttime":
					if ( !this.#timeSelecting ) {
						this.#elements.clock.$setTime( val );
						this.#elements.currentTime.$setValue( val );
					}
					break;
				case "maxtime":
					GSUsetAttribute( this.#elements.currentTime, "max", val );
					break;
				case "useravatar":
					this.#elements.userAvatar.style.backgroundImage = val ? `url("${ val }")` : "";
					break;
				case "version":
					this.#elements.vers.textContent = val;
					this.#popups.about.version.textContent = val;
					break;
			}
		}
	}

	// .........................................................................
	updateSpectrum( data ) {
		this.#elements.spectrum.$draw( data );
	}
	#unloadComposition() {
		this.#cmpId = null;
		this.#cmpSaveMode = "local";
		this.querySelector( ".gsuiDAW-cmp-loaded" )?.classList?.remove( "gsuiDAW-cmp-loaded" );
	}
	#loadComposition( saveMode, id ) {
		const html = this.#cmps[ saveMode ].get( id );

		this.#unloadComposition();
		if ( html ) {
			this.#cmpId = id;
			this.#cmpSaveMode = saveMode;
			html.root.classList.add( "gsuiDAW-cmp-loaded" );
			html.root.parentNode.prepend( html.root );
			html.root.parentNode.scrollTop = 0;
			GSUsetAttribute( this.#elements.cmpIcon, "data-icon", saveMode === "local" ? "local" : "cloud" );
			GSUsetAttribute( this.#elements.cmpSave, "data-icon", saveMode === "local" ? "save" : "upload" );
		}
	}
	#updateDuration() {
		const dur = GSUgetAttributeNum( this, "duration" );
		const [ min, sec ] = gsuiClock.$parseBeatsToSeconds( dur, GSUgetAttributeNum( this, "bpm" ) );

		this.#elements.cmpDuration.textContent = `${ min }:${ sec }`;
		GSUsetAttribute( this.#elements.currentTime, "max", dur );
	}

	// .........................................................................
	showOpenPopup() {
		this.#popups.open.inputOpenFile.value =
		this.#popups.open.inputOpenURL.value = "";
		GSUpopup.$custom( {
			title: "Open",
			element: this.#popups.open.root,
			submit: obj => this.onSubmitOpen( obj.url, obj.file ),
		} );
	}
	clearCompositions() {
		this.#cmps.local.forEach( html => html.root.remove() );
		this.#cmps.cloud.forEach( html => html.root.remove() );
	}
	addComposition( cmp ) {
		const saveMode = cmp.options.saveMode;

		if (
			( saveMode === "local" && this.#cmps.local.has( cmp.id ) ) ||
			( saveMode === "cloud" && this.#cmps.cloud.has( cmp.id ) )
		) {
			this.updateComposition( cmp );
		} else {
			const root = GSUgetTemplate( "gsui-daw-cmp", { id: cmp.id, saveMode } );
			const html = GSUfindElements( root, {
				root: ".gsuiDAW-cmp",
				bpm: ".gsuiDAW-cmp-bpm",
				name: ".gsuiDAW-cmp-name",
				save: "[data-action='cmp-save']",
				duration: ".gsuiDAW-cmp-duration",
			} );

			this.#cmps[ saveMode ].set( cmp.id, html );
			this.updateComposition( cmp );
			( saveMode === "local"
				? this.#elements.cmpsLocalList
				: this.#elements.cmpsCloudList ).append( root );
			if ( `${ saveMode }:${ cmp.id }` === GSUgetAttribute( this, "currentcomposition" ) ) {
				this.#loadComposition( saveMode, cmp.id );
			}
		}
	}
	updateComposition( cmp ) {
		const html = this.#cmps[ cmp.options.saveMode ].get( cmp.id );
		const [ min, sec ] = gsuiClock.$parseBeatsToSeconds( cmp.duration, cmp.bpm );

		html.bpm.textContent = cmp.bpm;
		html.name.textContent = cmp.name;
		html.duration.textContent = `${ min }:${ sec }`;
	}
	deleteComposition( cmp ) {
		const cmps = this.#cmps[ cmp.options.saveMode ];
		const html = cmps.get( cmp.id );

		if ( html ) {
			html.root.remove();
			cmps.delete( cmp.id );
		}
	}
	readyToDownload( url, name ) {
		GSUsetAttribute( this.#popups.export.button, "href", url );
		GSUsetAttribute( this.#popups.export.button, "download", name );
		GSUsetAttribute( this.#popups.export.button, "data-status", 2 );
	}
	static #ondragstartCmp( saveMode, e ) {
		const elCmp = e.target.closest( ".gsuiDAW-cmp" );

		e.dataTransfer.setData( "text/plain", `${ saveMode }:${ elCmp.dataset.id }` );
	}
	#ondropCmp( e ) {
		const [ saveMode, id ] = e.dataTransfer.getData( "text/plain" ).split( ":" );

		if ( saveMode !== e.currentTarget.dataset.list ) {
			this.#dispatch( "switchCompositionLocation", saveMode, id );
		}
	}

	// .........................................................................
	toggleWindow( win, b ) {
		GSUsetAttribute( this.#elements.winBtns[ win ], "data-open", b );
		if ( win === "patterns" ) {
			GSUsetAttribute( this.#elements.body, "resources-hidden", !b );
		}
	}
	clearHistory() {
		Array.from( this.#actions ).forEach( a => a.remove() );
		this.#currentActionInd = -1;
	}
	stackAction( icon, desc ) {
		Array.from( this.#actions ).forEach( a => "undone" in a.dataset && a.remove() );
		this.#elements.historyList.append( GSUgetTemplate( "gsui-daw-history-action", { icon, desc, index: this.#actions.length } ) );
		this.#elements.historyList.scroll( 0, Number.MAX_SAFE_INTEGER );
		this.#currentActionInd = this.#actions.length - 1;
	}
	undo() {
		if ( this.#currentActionInd >= 0 ) {
			GSUsetAttribute( this.#actions[ this.#currentActionInd-- ], "data-undone", true );
		}
	}
	redo() {
		if ( this.#currentActionInd < this.#actions.length - 1 ) {
			GSUsetAttribute( this.#actions[ ++this.#currentActionInd ], "data-undone", false );
		}
	}

	// .........................................................................
	#onclickHead( e ) {
		const dt = e.target.dataset;

		switch ( dt.action ) {
			case "logout":
			case "localNewCmp":
			case "cloudNewCmp":
			case "focusSwitch":
			case "play":
			case "stop":
			case "reset":
			case "undo":
			case "redo":
				this.#dispatch( dt.action );
				break;
			case "cmp-save":
				this.#dispatch( "save" );
				break;
			case "cmp-open":
				e.preventDefault();
				this.#dispatch( "open",
					this.#elements.cmpsLocalList.contains( e.target.parentNode ) ? "local" : "cloud",
					e.target.parentNode.dataset.id );
				break;
			case "cmp-json": {
				const json = this.onExportJSON(
					this.#elements.cmpsLocalList.contains( e.target.parentNode ) ? "local" : "cloud",
					e.target.parentNode.dataset.id );

				if ( json ) {
					GSUsetAttribute( e.target, "href", json.url );
					GSUsetAttribute( e.target, "download", json.name );
				} else {
					e.preventDefault();
				}
			} break;
			case "cmp-delete":
				this.#dispatch( "delete",
					this.#elements.cmpsLocalList.contains( e.target.parentNode ) ? "local" : "cloud",
					e.target.parentNode.dataset.id );
				break;
			case "cmp-rename":
				GSUpopup.$prompt( "Composition's title", "", GSUgetAttribute( this, "name" ), "Rename" )
					.then( n => n && n !== GSUgetAttribute( this, "name" ) && this.#dispatch( "rename", n ) );
				break;
			case "login":
				GSUpopup.$custom( {
					ok: "Sign in",
					title: "Authentication",
					element: this.#popups.auth.root,
					submit: obj => this.onSubmitLogin( obj.email, obj.password ),
				} ).then( () => {
					this.#popups.auth.root.querySelectorAll( "input" ).forEach( inp => inp.value = "" );
				} );
				break;
			case "localOpenCmp":
				this.showOpenPopup();
				break;
			case "window":
				if ( dt.win !== "patterns" ) {
					this.#dispatch( dt.open === undefined ? "openWindow" : "closeWindow", dt.win );
				} else {
					this.toggleWindow( "patterns", dt.open !== "" );
				}
				break;
			case "historyAction":
				if ( dt.index - this.#currentActionInd ) {
					this.#dispatch( "redoN", dt.index - this.#currentActionInd );
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
					.then( () => this.#dispatch( "abortExport" ) );
				break;
			case "tempo":
				this.#popups.tempo.beatsPerMeasure.value = +GSUgetAttribute( this, "timedivision" ).split( "/" )[ 0 ];
				this.#popups.tempo.stepsPerBeat.value = +GSUgetAttribute( this, "timedivision" ).split( "/" )[ 1 ];
				this.#popups.tempo.bpm.value = GSUgetAttributeNum( this, "bpm" );
				GSUpopup.$custom( { title: "Tempo", element: this.#popups.tempo.root } )
					.then( data => {
						if ( data ) {
							data.timedivision = `${ data.beatsPerMeasure }/${ data.stepsPerBeat }`;
							delete data.beatsPerMeasure;
							delete data.stepsPerBeat;
							if (
								data.timedivision !== GSUgetAttribute( this, "timedivision" ) ||
								data.bpm !== GSUgetAttributeNum( this, "bpm" )
							) {
								this.#dispatch( "tempo", data );
							}
						}
					} );
				break;
			case "settings":
				this.#popups.settings.sampleRate.value = GSUgetAttributeNum( this, "samplerate" );
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
								data.sampleRate !== GSUgetAttributeNum( this, "samplerate" ) ||
								data.timelineNumbering !== GSUgetAttributeNum( this, "timelinenumbering" ) ||
								data.windowsLowGraphics !== ( GSUgetAttribute( this, "windowslowgraphics" ) === "" )
							) {
								this.#dispatch( "settings", data );
							}
						}
					} );
				break;
			case "cmps":
			case "help":
			case "undoMore":
			case "changelog":
				break;
			default:
				dt.action && console.log( "untracked action:", dt.action );
				break;
		}
	}
}

Object.seal( gsuiDAW );
customElements.define( "gsui-daw", gsuiDAW );
