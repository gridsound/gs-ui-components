"use strict";

class gsuiDrumrow extends gsui0ne {
	#elDrumLine = null;

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
				toggle: true,
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		this.onanimationend = this.#onanimationend.bind( this );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					GSUdomSetAttr( this, "toggle", d.args[ 0 ] );
					this.$dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: ( d, btn ) => {
					GSUdomSetAttr( this, "toggle" );
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
			gsuiPropSelect: {
				select: d => this.$dispatch( "propFilter", d.args[ 0 ] ),
				selectAll: d => this.$dispatch( "propFilters", d.args[ 0 ] ),
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "order", "toggle", "name", "pan", "gain", "detune", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "pan":
			case "gain":
			case "detune": GSUdomSetAttr( this.$elements[ prop ], "value", val ); break;
			case "name": this.$elements.$name.textContent = val; break;
			case "duration": this.$elements.waveWrap.style.animationDuration = `${ val * 2 }s`; break;
			case "order":
				this.style.order = val;
				if ( this.#elDrumLine ) {
					this.#elDrumLine.style.order = val;
				}
				break;
			case "toggle":
				GSUdomSetAttr( this.$elements.toggle, "off", val !== "" );
				if ( this.#elDrumLine ) {
					this.#elDrumLine.classList.toggle( "gsuiDrumrow-mute", val !== "" );
				}
				break;
		}
	}

	// .........................................................................
	$associateDrumLine( el ) {
		this.#elDrumLine = el;
		el.style.order = GSUdomGetAttr( this, "order" );
		el.classList.toggle( "gsuiDrumrow-mute", !GSUdomHasAttr( this, "toggle" ) );
	}
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
		GSUdomQSA( this, ".gsuiDrumrow-startCursor" ).forEach( el => el.remove() );
	}

	// .........................................................................
	#namePrint( prop, val ) {
		this.$elements.$name.textContent = gsuiDrumrow.#namePrint2( prop, val );
		this.$elements.$name.classList.add( "gsuiDrumrow-nameInfo" );
	}
	static #namePrint2( prop, val ) {
		switch ( prop ) {
			case "pan": return `pan: ${ GSUmathSign( val.toFixed( 2 ) ) }`;
			case "gain": return `gain: ${ val.toFixed( 2 ) }`;
			case "detune": return `pitch: ${ GSUmathSign( val ) }`;
		}
	}

	// .........................................................................
	#oninputendSlider( id ) {
		const el = this.$elements.$name;

		el.textContent = GSUdomGetAttr( this, "name" );
		el.classList.remove( "gsuiDrumrow-nameInfo" );
	}
	#onanimationend( e ) {
		if ( e.target.classList.contains( "gsuiDrumrow-startCursor" ) ) {
			e.target.remove();
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
