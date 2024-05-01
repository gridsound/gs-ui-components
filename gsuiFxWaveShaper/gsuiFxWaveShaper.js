"use strict";

class gsuiFxWaveShaper extends gsui0ne {
	static #wavesNbPts = 256;
	static #sinePts = GSUnewArray( gsuiFxWaveShaper.#wavesNbPts, i => Math.sin( i / gsuiFxWaveShaper.#wavesNbPts * Math.PI * 2 ) );
	#wavesW = 0;
	#wavesH = 0;

	constructor() {
		super( {
			$cmpName: "gsuiFxWaveShaper",
			$tagName: "gsui-fx-waveshaper",
			$elements: {
				$oversampleSelect: ".gsuiFxWaveShaper-oversample select",
				$oversampleToggle: ".gsuiFxWaveShaper-oversample gsui-toggle",
				$reset: ".gsuiFxWaveShaper-reset",
				$svgDiag: ".gsuiFxWaveShaper-graph-diag",
				$dotline: "gsui-dotline",
				$waves: ".gsuiFxWaveShaper-waves",
				$waveA: ".gsuiFxWaveShaper-waveA",
				$waveB: ".gsuiFxWaveShaper-waveB",
			},
			$attributes: {
				oversample: "none",
			},
		} );
		Object.seal( this );
		this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		this.$changeCurveData( {
			0: { x: -1, y: -1 },
			1: { x:  1, y:  1 },
			2: { x:  0, y:  0 },
		} );
		this.$elements.$reset.onclick = () => this.#reset();
		this.$elements.$oversampleSelect.onchange = e => {
			if ( this.$elements.$oversampleToggle.$isOn() ) {
				this.#onchangeOversample();
			}
		};
		GSUlistenEvents( this, {
			gsuiDotline: {
				change: d => this.$dispatch( "changeProp", "curve", d.args[ 0 ] ),
				input: () => this.#updateWaveB(),
			},
			gsuiToggle: {
				toggle: () => this.#onchangeOversample(),
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "oversample" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "oversample":
				GSUsetAttribute( this.$elements.$oversampleToggle, "off", val === "none" );
				if ( val !== "none" ) {
					this.$elements.$oversampleSelect.value = val;
				}
				break;
		}
	}
	$onresize() {
		const svg = this.$elements.$svgDiag;
		const w = svg.clientWidth;
		const h = svg.clientHeight;

		this.#wavesW = this.$elements.$waves.clientWidth;
		this.#wavesH = this.$elements.$waves.clientHeight;
		GSUsetAttribute( svg, "viewBox", `0 0 ${ w } ${ h }` );
		GSUsetAttribute( svg.firstChild, "y1", h );
		GSUsetAttribute( svg.firstChild, "x2", w );
		this.#updateWaveA();
		this.#updateWaveB();
	}

	// .........................................................................
	$changeCurveData( diff ) {
		this.$elements.$dotline.$change( diff );
		this.#updateWaveB();
	}
	#reset() {
		const diff =  { 0: { y: -1 }, 1: { y: 1 } };

		GSUforEach( this.$elements.$dotline.$getData(), ( id, d ) => {
			if ( -1 < d.x && d.x < 1 ) {
				diff[ id ] = undefined;
			}
		} );
		diff[ 2 ] = { x: 0, y: 0 };
		this.$changeCurveData( diff );
		this.#updateWaveB();
	}

	// .........................................................................
	#onchangeOversample() {
		const val = this.$elements.$oversampleToggle.$isOn()
			? this.$elements.$oversampleSelect.value
			: "none";

		this.$dispatch( "changeProp", "oversample", val );
	}
	#updateWaveA() {
		const len = gsuiFxWaveShaper.#sinePts.length;
		const svg = this.$elements.$waves;
		const w = svg.clientWidth;
		const h = svg.clientHeight;
		const pts = gsuiFxWaveShaper.#sinePts.map( ( y, i ) => `${ i / len * w },${ this.#calcY( y ) }` );

		GSUsetAttribute( svg, "viewBox", `0 0 ${ w } ${ h }` );
		GSUsetAttribute( this.$elements.$waveA, "points", pts.join( " " ) );
	}
	#updateWaveB() {
		const len = gsuiFxWaveShaper.#sinePts.length;
		const graphData = this.$elements.$dotline.$getCurveFloat32( len );
		const w = this.$elements.$waves.clientWidth;
		const h = this.$elements.$waves.clientHeight;
		const pts = gsuiFxWaveShaper.#sinePts.map( ( y, i ) => `${ i / len * w },${ this.#calcY( graphData[ Math.round( ( ( y + 1 ) / 2 ) * ( len - 1 ) ) ] || 0 ) }` );

		GSUsetAttribute( this.$elements.$waveB, "points", pts.join( " " ) );
	}
	#calcY( y ) {
		return ( y * .9 + 1 ) / 2 * this.#wavesH;
	}
}

Object.freeze( gsuiFxWaveShaper );
customElements.define( "gsui-fx-waveshaper", gsuiFxWaveShaper );
