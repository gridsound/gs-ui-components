"use strict";

class gsuiControls extends HTMLElement {
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiControls" )
	#children = GSUI.getTemplate( "gsui-controls" )
	#elements = GSUI.findElements( this.#children, {
		bpm: ".gsuiControls-tempo-bpm",
		bPM: ".gsuiControls-tempo-beatsPerMeasure",
		sPB: ".gsuiControls-tempo-stepsPerBeat",
		name: ".gsuiControls-cmp-name",
		vers: ".gsuiControls-version-num",
		cmpSave: ".gsuiControls-cmp-saveBtn",
		cmpIcon: ".gsuiControls-cmp-localIcon",
		clock: "gsui-clock",
		spectrum: "gsui-spectrum",
		volume: ".gsuiControls-volume gsui-slider",
		currentTime: ".gsuiControls-areaTime gsui-slider",
		userAvatar: ".gsuiControls-btn[data-action='profile']",
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

Object.seal( gsuiControls );
customElements.define( "gsui-controls", gsuiControls );
