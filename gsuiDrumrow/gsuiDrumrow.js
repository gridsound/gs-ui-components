"use strict";

class gsuiDrumrow extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiDrumrow",
			$tagName: "gsui-drumrow",
			$elements: {
				$name: ".gsuiDrumrow-name",
				toggle: "gsui-toggle",
				pan: ".gsuiDrumrow-pan gsui-slider",
				gain: ".gsuiDrumrow-gain gsui-slider",
				detune: ".gsuiDrumrow-detune gsui-slider",
				waveWrap: ".gsuiDrumrow-waveWrap",
			},
			$attributes: {
				draggable: "true",
				toggle: true,
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		this.onchange = e => this.$dispatch( "propFilter", e.target.value );
		this.oncontextmenu = this.#oncontextmenuRows.bind( this );
		this.onanimationend = this.#onanimationend.bind( this );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					GSUsetAttribute( this, "toggle", d.args[ 0 ] );
					this.$dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: ( d, btn ) => {
					GSUsetAttribute( this, "toggle", true );
					this.$dispatch( "toggleSolo" );
				},
			},
			gsuiSlider: {
				change: ( d, sli ) => this.$dispatch( "changeProp", sli.dataset.prop, d.args[ 0 ] ),
				input: ( d, sli ) => {
					this.#namePrint( sli.dataset.prop, d.args[ 0 ] );
					this.$dispatch( "liveChangeProp", sli.dataset.prop, d.args[ 0 ] );
				},
				inputStart: GSUnoop,
				inputEnd: () => this.#oninputendSlider(),
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "name", "pan", "gain", "detune", "toggle", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "pan":
			case "gain":
			case "detune": this.$elements[ prop ].$setValue( val ); break;
			case "name": this.$elements.$name.textContent = val; break;
			case "duration": this.$elements.waveWrap.style.animationDuration = `${ val * 2 }s`; break;
			case "toggle": GSUsetAttribute( this.$elements.toggle, "off", val !== "" ); break;
		}
	}

	// .........................................................................
	$changePattern( svg ) {
		GSUemptyElement( this.$elements.waveWrap );
		if ( svg ) {
			svg.classList.add( "gsuiDrumrow-wave" );
			this.$elements.waveWrap.append( svg );
		}
	}
	$play() {
		this.$elements.waveWrap.append( GSUcreateDiv( { class: "gsuiDrumrow-startCursor" } ) );
	}
	$stop() {
		this.querySelectorAll( ".gsuiDrumrow-startCursor" ).forEach( el => el.remove() );
	}

	// .........................................................................
	#namePrint( prop, val ) {
		this.$elements.$name.textContent = gsuiDrumrow.#namePrint2( prop, val );
		this.$elements.$name.classList.add( "gsuiDrumrow-nameInfo" );
	}
	static #namePrint2( prop, val ) {
		switch ( prop ) {
			case "pan": return `pan: ${ GSUsignNum( val.toFixed( 2 ) ) }`;
			case "gain": return `gain: ${ val.toFixed( 2 ) }`;
			case "detune": return `pitch: ${ GSUsignNum( val ) }`;
		}
	}

	// .........................................................................
	#oninputendSlider( id ) {
		const el = this.$elements.$name;

		el.textContent = GSUgetAttribute( this, "name" );
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
			this.$dispatch( "propFilters", e.target.previousElementSibling.value );
		}
	}
	#onclick( e ) {
		if ( e.target !== this ) {
			switch ( e.target.dataset.action ) {
				case "delete": this.$dispatch( "remove" ); break;
				case "props":
					this.classList.toggle( "gsuiDrumrow-open" );
					this.$dispatch( "expand" );
					break;
			}
		}
	}
}

GSUdefineElement( "gsui-drumrow", gsuiDrumrow );
