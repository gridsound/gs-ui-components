"use strict";

class gsuiWaveEditor extends gsui0ne {
	#gridSize = [ 1, 1 ];
	#waveW = 0;
	#waveH = 0;
	#waveArray = null;

	constructor() {
		super( {
			$cmpName: "gsuiWaveEditor",
			$tagName: "gsui-wave-editor",
			$elements: {
				$wave: ".gsuiWaveEditor-wave",
				$gridVal: "[].gsuiWaveEditor-tool-gridSize span",
				$gridSli: "[].gsuiWaveEditor-tool-gridSize gsui-slider",
				$beatlines: "[].gsuiWaveEditor-wave gsui-beatlines",
				$hoverSquare: ".gsuiWaveEditor-wave-hover-square",
				$waveSVG: ".gsuiWaveEditor-wave svg",
				$wavePolyline: ".gsuiWaveEditor-wave polyline",
			},
			$attributes: {
				"grid-x": 1,
				"grid-y": 1,
			}
		} );
		Object.seal( this );
		this.$elements.$wave.onpointermove = e => {
			this.#updateHoverSquare( e.offsetX, e.offsetY );
		};
		GSUlistenEvents( this, {
			gsuiSlider: {
				input: ( d, t ) => GSUdomSetAttr( this, GSUdomGetAttr( t.parentNode, "dir" ) === "x" ? "grid-x" : "grid-y", d.args[ 0 ] ),
			},
		} );
	}

	// .........................................................................
	$onresize() {
		const [ w, h ] = GSUdomBCRwh( this.$elements.$wave );

		this.#waveW = w;
		this.#waveH = h;
		this.#updateBeatlines( 0, this.#gridSize[ 0 ] );
		this.#updateBeatlines( 1, this.#gridSize[ 1 ] );
		GSUsetViewBoxWH( this.$elements.$waveSVG, w, h );
		this.#drawWave();
	}
	$firstTimeConnected() {
		GSUdomRmAttr( this.$elements.$beatlines[ 0 ], "coloredbeats" );
		GSUdomRmAttr( this.$elements.$beatlines[ 1 ], "coloredbeats" );
	}
	static get observedAttributes() {
		return [ "grid-x", "grid-y" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "grid-x": this.#updateGridSize( 0, val ); break;
			case "grid-y": this.#updateGridSize( 1, val ); break;
		}
	}

	// .........................................................................
	$setWaveArray( arr ) {
		this.#waveArray = new Float32Array( arr );
		this.#drawWave();
	}

	// .........................................................................
	#drawWave() {
		if ( !this.#waveArray || !this.#waveW || !this.#waveH ) {
			return;
		}

		const arr = this.#waveArray;
		const len = this.#waveArray.length - 1;
		const pts = GSUnewArray( len + 1, i => [
			i / len * this.#waveW,
			( .5 - arr[ i ] / 2 ) * this.#waveH,
		] );

		pts.unshift(
			[ -10, this.#waveH / 2 ],
			[ -10, pts[ 0 ][ 1 ] ],
		);
		pts.push(
			[ this.#waveW + 10, pts.at( -1 )[ 1 ] ],
			[ this.#waveW + 10, this.#waveH / 2 ],
		);
		GSUdomSetAttr( this.$elements.$wavePolyline, "points", pts.join( " " ) );
	}
	#updateHoverSquare( px, py ) {
		const [ w, h ] = GSUdomBCRwh( this.$elements.$wave );
		const ix = px / ( w / this.#gridSize[ 0 ] ) | 0;
		const iy = py / ( h / this.#gridSize[ 1 ] ) | 0;

		GSUsetStyle( this.$elements.$hoverSquare, {
			top: `${ iy / this.#gridSize[ 1 ] * 100 }%`,
			left: `${ ix / this.#gridSize[ 0 ] * 100 }%`,
		} );
	}
	#updateBeatlines( dir, sz ) {
		const bl = this.$elements.$beatlines[ dir ];
		const blSize = dir ? bl.clientHeight : bl.clientWidth;

		GSUdomSetAttr( bl, "pxperbeat", blSize );
		GSUdomSetAttr( bl, "timedivision", `1/${ sz }` );
	}
	#updateGridSize( dir, val ) {
		this.#gridSize[ dir ] = +val;
		this.$elements.$gridVal[ dir ].textContent = val;
		this.$elements.$hoverSquare.style[ dir ? "height" : "width" ] = `${ 1 / val * 100 }%`;
		this.#updateBeatlines( dir, val );
		GSUdomSetAttr( this.$elements.$gridSli[ dir ], "value", val );
	}
}

GSUdefineElement( "gsui-wave-editor", gsuiWaveEditor );
