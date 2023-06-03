"use strict";

class gsuiDrumrow extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDrumrow" );
	#children = GSUI.$getTemplate( "gsui-drumrow" );
	#elements = GSUI.$findElements( this.#children, {
		$name: ".gsuiDrumrow-name",
		toggle: "gsui-toggle",
		pan: ".gsuiDrumrow-pan gsui-slider",
		gain: ".gsuiDrumrow-gain gsui-slider",
		detune: ".gsuiDrumrow-detune gsui-slider",
		waveWrap: ".gsuiDrumrow-waveWrap",
	} );

	constructor() {
		super();
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		this.onchange = e => this.#dispatch( "propFilter", e.target.value );
		this.oncontextmenu = this.#oncontextmenuRows.bind( this );
		this.onanimationend = this.#onanimationend.bind( this );
		GSUI.$listenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					GSUI.$setAttribute( this, "toggle", d.args[ 0 ] );
					this.#dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: ( d, btn ) => {
					GSUI.$setAttribute( this, "toggle", true );
					this.#dispatch( "toggleSolo" );
				},
			},
			gsuiSlider: {
				change: ( d, sli ) => this.#dispatch( "changeProp", sli.dataset.prop, d.args[ 0 ] ),
				input: ( d, sli ) => {
					this.#namePrint( sli.dataset.prop, d.args[ 0 ] );
					this.#dispatch( "liveChangeProp", sli.dataset.prop, d.args[ 0 ] );
				},
				inputStart: GSUI.$noop,
				inputEnd: () => this.#oninputendSlider(),
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$setAttribute( this, "draggable", "true" );
			GSUI.$recallAttributes( this, {
				toggle: true,
			} );
		}
	}
	static get observedAttributes() {
		return [ "name", "pan", "gain", "detune", "order", "toggle", "duration" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "pan":
				case "gain":
				case "detune": this.#elements[ prop ].setValue( val ); break;
				case "name": this.#elements.$name.textContent = val; break;
				case "duration": this.#elements.waveWrap.style.animationDuration = `${ val * 2 }s`; break;
				case "toggle": GSUI.$setAttribute( this.#elements.toggle, "off", val !== "" ); break;
			}
		}
	}

	// .........................................................................
	$changePattern( svg ) {
		GSUI.$emptyElement( this.#elements.waveWrap );
		if ( svg ) {
			svg.classList.add( "gsuiDrumrow-wave" );
			this.#elements.waveWrap.append( svg );
		}
	}
	$play() {
		this.#elements.waveWrap.append( GSUI.$createElement( "div", { class: "gsuiDrumrow-startCursor" } ) );
	}
	$stop() {
		this.querySelectorAll( ".gsuiDrumrow-startCursor" ).forEach( el => el.remove() );
	}

	// .........................................................................
	#namePrint( prop, val ) {
		const el = this.#elements.$name;
		const text = prop === "pan"
			? `pan: ${ val > 0 ? "+" : "" }${ val.toFixed( 2 ) }`
			: prop === "gain"
				? `gain: ${ val.toFixed( 2 ) }`
				: `pitch: ${ val > 0 ? "+" : "" }${ val }`;

		el.textContent = text;
		el.classList.add( "gsuiDrumrow-nameInfo" );
	}

	// .........................................................................
	#oninputendSlider( id ) {
		const el = this.#elements.$name;

		el.textContent = GSUI.$getAttribute( this, "name" );
		el.classList.remove( "gsuiDrumrow-nameInfo" );
	}
	#onanimationend( e ) {
		if ( e.target.classList.contains( "gsuiDrumrow-startCursor" ) ) {
			e.target.remove();
		}
	}
	#oncontextmenuRows( e ) {
		e.preventDefault();
		if ( e.target.classList.contains( "gsuiDrumrow-propSpan" ) ) {
			this.#dispatch( "propFilters", e.target.previousElementSibling.value );
		}
	}
	#onclick( e ) {
		if ( e.target !== this ) {
			switch ( e.target.dataset.action ) {
				case "delete": this.#dispatch( "remove" ); break;
				case "props":
					this.classList.toggle( "gsuiDrumrow-open" );
					this.#dispatch( "expand" );
					break;
			}
		}
	}
}

Object.freeze( gsuiDrumrow );
customElements.define( "gsui-drumrow", gsuiDrumrow );
