"use strict";

class gsuiDAW extends HTMLElement {
	#cmps = new Map()
	#currentActionInd = -1
	#actions = null
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiDAW" )
	#children = GSUI.getTemplate( "gsui-daw" )
	#elements = GSUI.findElements( this.#children, {
		bpm: ".gsuiDAW-tempo-bpm",
		bPM: ".gsuiDAW-tempo-beatsPerMeasure",
		sPB: ".gsuiDAW-tempo-stepsPerBeat",
		cmpName: ".gsuiDAW-currCmp-name",
		cmpSave: ".gsuiDAW-currCmp-saveBtn",
		cmpIcon: ".gsuiDAW-currCmp-localIcon",
		cmpDuration: ".gsuiDAW-currCmp-dur",
		vers: ".gsuiDAW-version-num",
		clock: "gsui-clock",
		spectrum: "gsui-spectrum",
		volume: ".gsuiDAW-volume gsui-slider",
		currentTime: ".gsuiDAW-areaTime gsui-slider",
		userAvatar: ".gsuiDAW-btn[data-action='profile']",
		cmpsLocalList: ".gsuiDAW-dropdown-list[data-list='local']",
		cmpsCloudList: ".gsuiDAW-dropdown-list[data-list='cloud']",
		historyList: ".gsuiDAW-history .gsuiDAW-dropdown-list",
	} )
	#popups = {
		about: GSUI.getTemplate( "gsui-daw-popup-about" ),
		export: GSUI.getTemplate( "gsui-daw-popup-export" ),
		shortcuts: GSUI.getTemplate( "gsui-daw-popup-shortcuts" ),
		cookies: GSUI.getTemplate( "gsui-daw-popup-cookies" ),
		settings: GSUI.findElements( GSUI.getTemplate( "gsui-daw-popup-settings" ), {
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
	}

	constructor() {
		super();
		Object.seal( this );

		this.#actions = this.#elements.historyList.getElementsByClassName( "gsuiDAW-history-action" );
		this.onclick = this.#onclick.bind( this );
		this.#popups.settings.uiRateManualRange.onmousedown = () => this.#popups.settings.uiRateRadio.manual.checked = true;
		this.#popups.settings.uiRateManualRange.oninput = e => {
			this.#popups.settings.uiRateManualFPS.textContent =
				e.target.value.padStart( 2, "0" );
		};
		this.#elements.spectrum.setResolution( 140 );
		GSUI.listenEvents( this, {
			gsuiSlider: {
				input: ( d, tar ) => this.#dispatch( tar.dataset.action, d.args[ 0 ] ),
				inputStart: GSUI.noop,
				inputEnd: GSUI.noop,
				change: GSUI.noop,
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
				saved: true,
				uirate: "auto",
				windowslowgraphics: false,
				timelinenumbering: 0,
				samplerate: 24000,
				bpm: 60,
				name: "",
				duration: 10,
				location: "local",
				timedivision: "1/1",
				currenttime: 0,
				maxtime: 1,
				volume: 1,
				version: "0.0.0",
			} );
		}
	}
	disconnectedCallback() {
	}
	static get observedAttributes() {
		return [ "samplerate", "uirate", "windowslowgraphics", "timelinenumbering", "bpm", "timedivision", "name", "duration", "volume", "currenttime", "maxtime", "location", "useravatar", "version" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "name":
					this.#elements.cmpName.textContent = val;
					break;
				case "duration":
					this.#updateDuration();
					break;
				case "samplerate":
					this.#popups.settings.sampleRate.value = val;
					break;
				case "uirate":
					this.#popups.settings.uiRateRadio[ val === "auto" ? val : "manual" ].checked = true;
					if ( val !== "auto" ) {
						this.#popups.settings.uiRateManualFPS.textContent = val;
						this.#popups.settings.uiRateManualRange.value = val;
					}
					break;
				case "windowslowgraphics":
					this.#popups.settings.windowsLowGraphics.checked = val !== null;
					break;
				case "timelinenumbering":
					gsuiClock.numbering( val );
					this.#popups.settings.timelineNumbering.value = val;
					break;
				case "bpm":
					GSUI.setAttribute( this.#elements.clock, "bpm", val );
					this.#elements.bpm.textContent = val;
					this.#updateDuration();
					break;
				case "timedivision":
					GSUI.setAttribute( this.#elements.clock, "timedivision", val );
					this.#elements.bPM.textContent = val.split( "/" )[ 0 ];
					this.#elements.sPB.textContent = val.split( "/" )[ 1 ];
					break;
				case "volume":
					this.#elements.volume.setValue( val );
					break;
				case "currenttime":
					this.#elements.clock.setTime( val );
					this.#elements.currentTime.setValue( val );
					break;
				case "maxtime":
					GSUI.setAttribute( this.#elements.currentTime, "max", val );
					break;
				case "location":
					GSUI.setAttribute( this.#elements.cmpIcon, "data-icon", val === "local" ? "local" : "cloud" );
					GSUI.setAttribute( this.#elements.cmpSave, "data-icon", val === "local" ? "save" : "upload" );
					break;
				case "useravatar":
					this.#elements.userAvatar.style.backgroundImage = `url("${ val }")`;
					break;
				case "version":
					this.#elements.vers.textContent = val;
					this.#popups.about.querySelector( ".gsuiDAW-popup-about-versionNum" ).textContent = val;
					break;
			}
		}
	}

	// .........................................................................
	updateSpectrum( data ) {
		this.#elements.spectrum.draw( data );
	}
	#updateDuration() {
		const [ min, sec ] = gsuiClock.parseBeatsToSeconds(
				+this.getAttribute( "duration" ),
				+this.getAttribute( "bpm" ) );

		this.#elements.cmpDuration.textContent = `${ min }:${ sec }`;
	}

	// .........................................................................
	clearCompositions() {
		this.#cmps.forEach( html => html.root.remove() );
	}
	addComposition( cmp ) {
		if ( this.#cmps.has( cmp.id ) ) {
			this.updateComposition( cmp );
		} else {
			const root = GSUI.getTemplate( "gsui-daw-cmp", { id: cmp.id, saveMode: cmp.options.saveMode } ),
				html = GSUI.findElements( root, {
					root: ".gsuiDAW-cmp",
					bpm: ".gsuiDAW-cmp-bpm",
					name: ".gsuiDAW-cmp-name",
					save: ".gsuiDAW-cmp-save",
					duration: ".gsuiDAW-cmp-duration",
				} );

			this.#cmps.set( cmp.id, html );
			this.updateComposition( cmp );
			( cmp.options.saveMode === "local"
				? this.#elements.cmpsLocalList
				: this.#elements.cmpsCloudList ).append( root );
		}
	}
	updateComposition( cmp ) {
		const html = this.#cmps.get( cmp.id ),
			[ min, sec ] = gsuiClock.parseBeatsToSeconds( cmp.duration, cmp.bpm );

		html.bpm.textContent = cmp.bpm;
		html.name.textContent = cmp.name;
		html.duration.textContent = `${ min }:${ sec }`;
	}
	deleteComposition( cmp ) {
		const html = this.#cmps.get( cmp.id );

		if ( html ) {
			html.root.remove();
			this.#cmps.delete( cmp.id );
		}
	}
	openComposition( cmp ) {
		const html = this.#cmps.get( cmp.id ),
			par = html.root.parentNode;

		html.root.classList.add( "gsuiDAW-cmp-loaded" );
		par.prepend( html.root );
		par.scrollTop = 0;
	}

	// .........................................................................
	clearHistory() {
		Array.from( this.#actions ).forEach( a => a.remove() );
		this.#currentActionInd = -1;
	}
	stackAction( icon, desc ) {
		Array.from( this.#actions ).forEach( a => "undone" in a.dataset && a.remove() );
		this.#elements.historyList.append( GSUI.getTemplate( "gsui-daw-history-action", { icon, desc } ) );
		this.#elements.historyList.scroll( 0, Number.MAX_SAFE_INTEGER );
		this.#currentActionInd = this.#actions.length - 1;
	}
	undo() {
		if ( this.#currentActionInd >= 0 ) {
			GSUI.setAttribute( this.#actions[ this.#currentActionInd-- ], "data-undone", true );
		}
	}
	redo() {
		if ( this.#currentActionInd < this.#actions.length - 1 ) {
			GSUI.setAttribute( this.#actions[ ++this.#currentActionInd ], "data-undone", false );
		}
	}

	// .........................................................................
	#onclick( e ) {
		const act = e.target.dataset.action;

		switch ( act ) {
			case "saveCurrent":
			case "focusSwitch":
			case "play":
			case "stop":
			case "reset":
			case "undo":
			case "redo":
				this.#dispatch( act );
				break;
			case "rename":
				GSUI.popup.prompt( "Composition's title", "", this.getAttribute( "name" ), "Rename" )
					.then( n => n && n !== this.getAttribute( "name" ) && this.#dispatch( "rename", n ) );
				break;
			case "cookies":
				GSUI.popup.custom( { title: "Cookies consent", element: this.#popups.cookies } )
					.then( arg => arg !== undefined && this.#dispatch( "oki-cookies" ) );
				break;
			case "about":
				GSUI.popup.custom( { title: "About", element: this.#popups.about } );
				break;
			case "export":
				GSUI.popup.custom( { title: "Export", element: this.#popups.export } );
				break;
			case "shortcuts":
				GSUI.popup.custom( { title: "Keyboard / mouse shortcuts", element: this.#popups.shortcuts } );
				break;
			case "settings":
				GSUI.popup.custom( { title: "Settings", element: this.#popups.settings.root } )
					.then( data => {
						if ( data ) {
							if ( data.uiRate === "manual" ) {
								data.uiRate = data.uiRateFPS;
							}
							delete data.uiRateFPS;
							if (
								data.uiRate !== +this.getAttribute( "uirate" ) ||
								data.sampleRate !== +this.getAttribute( "samplerate" ) ||
								data.timelineNumbering !== +this.getAttribute( "timelinenumbering" ) ||
								data.windowsLowGraphics !== ( this.getAttribute( "windowslowgraphics" ) === "" )
							) {
								lg( data, +this.getAttribute( "samplerate" ) )
							}
						}
					} );
				break;
			case "login":
			case "tempo":
				lg( "popup", act );
				break;
			case "cmps":
			case "help":
			case "undoMore":
			case "changelog":
				break;
			default:
				act && lg( "untracked action:", act );
				break;
		}
	}
}

Object.seal( gsuiDAW );
customElements.define( "gsui-daw", gsuiDAW );
