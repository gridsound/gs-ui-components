"use strict";

class gsuiDAW extends HTMLElement {
	#currentActionInd = -1
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiDAW" )
	#children = GSUI.getTemplate( "gsui-daw" )
	#elements = GSUI.findElements( this.#children, {
		bpm: ".gsuiDAW-tempo-bpm",
		bPM: ".gsuiDAW-tempo-beatsPerMeasure",
		sPB: ".gsuiDAW-tempo-stepsPerBeat",
		name: ".gsuiDAW-cmp-name",
		vers: ".gsuiDAW-version-num",
		cmpSave: ".gsuiDAW-cmp-saveBtn",
		cmpIcon: ".gsuiDAW-cmp-localIcon",
		clock: "gsui-clock",
		spectrum: "gsui-spectrum",
		volume: ".gsuiDAW-volume gsui-slider",
		currentTime: ".gsuiDAW-areaTime gsui-slider",
		userAvatar: ".gsuiDAW-btn[data-action='profile']",
		historyList: ".gsuiDAW-history .gsuiDAW-dropdown-list",
	} )

	constructor() {
		super();
		Object.seal( this );

		this.onclick = this.#onclick.bind( this );
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
			} );
		}
	}
	disconnectedCallback() {
	}
	static get observedAttributes() {
		return [ "bpm", "timedivision", "name", "volume", "currenttime", "maxtime", "location", "userAvatar", "version" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "name":
					this.#elements.name.textContent = val;
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
				case "userAvatar":
					this.#elements.userAvatar.style.backgroundImage = `url("${ val }")`;
					break;
				case "version":
					this.#elements.vers.textContent = val;
					break;
			}
		}
	}

	// .........................................................................
	updateSpectrum( data ) {
		this.#elements.spectrum.draw( data );
	}
	clearHistory() {
		Array.prototype.forEach.call( this.#getActions(), a => a.remove() );
		this.#currentActionInd = -1;
	}
	stackAction( icon, desc ) {
		Array.prototype.forEach.call( this.#getActions(), a => "undone" in a.dataset && a.remove() );
		this.#elements.historyList.append( GSUI.getTemplate( "gsui-daw-history-action", { icon, desc } ) );
		this.#elements.historyList.scroll( 0, Number.MAX_SAFE_INTEGER );
		this.#currentActionInd = this.#getActions().length - 1;
	}
	undo() {
		if ( this.#currentActionInd >= 0 ) {
			GSUI.setAttribute( this.#getActions()[ this.#currentActionInd-- ], "data-undone", true );
		}
	}
	redo() {
		if ( this.#currentActionInd < this.#getActions().length - 1 ) {
			GSUI.setAttribute( this.#getActions()[ ++this.#currentActionInd ], "data-undone", false );
		}
	}
	#getActions() {
		return this.#elements.historyList.children;
	}

	// .........................................................................
	#onclick( e ) {
		const act = e.target.dataset.action;

		if ( act ) {
			switch ( act ) {
				case "focusSwitch":
				case "play":
				case "stop":
				case "reset":
				case "undo":
				case "redo":
					this.#dispatch( act );
					break;
				case "login":
				case "tempo":
				case "export":
				case "settings":
				case "cookie":
				case "keyboard":
				case "about":
					lg( "popup", act );
					break;
				case "rename":
					GSUI.popup.prompt( "Composition's title", "", this.getAttribute( "name" ), "Rename" )
						.then( n => {
							if ( n !== this.getAttribute( "name" ) ) {
								this.#dispatch( "rename", n );
							}
						} );
					break;
				default:
					lg( {act} );
					break;
			}
		}
	}
}

Object.seal( gsuiDAW );
customElements.define( "gsui-daw", gsuiDAW );
