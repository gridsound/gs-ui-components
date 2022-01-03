"use strict";

class gsuiDAW extends HTMLElement {
	#cmps = new Map()
	#currentActionInd = -1
	#actions = null
	#cookiesText = "..."
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiDAW" )
	#children = GSUI.getTemplate( "gsui-daw" )
	#elements = GSUI.findElements( this.#children, {
		bpm: ".gsuiDAW-tempo-bpm",
		bPM: ".gsuiDAW-tempo-beatsPerMeasure",
		sPB: ".gsuiDAW-tempo-stepsPerBeat",
		cmpName: ".gsuiDAW-currCmp-name",
		cmpSave: ".gsuiDAW-currCmp-saveBtn",
		cmpIcon: ".gsuiDAW-currCmp-localIcon",
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
		settings: GSUI.getTemplate( "gsui-daw-popup-settings" ),
		shortcuts: GSUI.getTemplate( "gsui-daw-popup-shortcuts" ),
	}

	constructor() {
		super();
		Object.seal( this );

		this.#actions = this.#elements.historyList.getElementsByClassName( "gsuiDAW-history-action" );
		this.onclick = this.#onclick.bind( this );
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
				name: "",
				location: "local",
				bpm: 60,
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
		return [ "bpm", "timedivision", "name", "volume", "currenttime", "maxtime", "location", "useravatar", "version" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "name":
					this.#elements.cmpName.textContent = val;
					break;
				case "bpm":
					this.#elements.bpm.textContent = val;
					break;
				case "timedivision":
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
	setCookiesText( text ) {
		this.#cookiesText = text;
	}
	updateSpectrum( data ) {
		this.#elements.spectrum.draw( data );
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
					// root: ".cmp",
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
					.then( n => n !== this.getAttribute( "name" ) && this.#dispatch( "rename", n ) );
				break;
			case "cookies":
				GSUI.popup.confirm( "Cookies consent", this.#cookiesText, "Accept", "Decline" )
					.then( b => b && this.#dispatch( "oki-cookies" ) );
				break;
			case "about":
				GSUI.popup.custom( { title: "About", element: this.#popups.about } );
				break;
			case "export":
				GSUI.popup.custom( { title: "Export", element: this.#popups.export } );
				break;
			case "settings":
				GSUI.popup.custom( { title: "Settings", element: this.#popups.settings } );
				break;
			case "shortcuts":
				GSUI.popup.custom( { title: "Keyboard / mouse shortcuts", element: this.#popups.shortcuts } );
				break;
			case "login":
			case "tempo":
				lg( "popup", act );
				break;
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
