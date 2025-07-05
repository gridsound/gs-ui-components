"use strict";

class gsuiWaveEditor extends gsui0ne {
	#gridSize = [ 1, 1 ];
	#waveW = 0;
	#waveH = 0;
	#ptrDown = false;
	#waveArray = null;
	#waveArray2 = null;
	#currentSquare = null;
	#toolSelected = "goUp";

	constructor() {
		super( {
			$cmpName: "gsuiWaveEditor",
			$tagName: "gsui-wave-editor",
			$elements: {
				$wave: ".gsuiWaveEditor-wave",
				$tools: ".gsuiWaveEditor-tools",
				$gridVal: "[].gsuiWaveEditor-gridSize span",
				$gridSli: "[].gsuiWaveEditor-gridSize gsui-slider",
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
		this.$elements.$tools.onclick = e => {
			const tool = e.target.dataset.tool;

			if ( tool ) {
				this.#toolSelected
				GSUdomRmAttr( GSUdomQS( this, `button[data-tool="${ this.#toolSelected }"]` ), "data-selected" );
				GSUdomSetAttr( e.target, "data-selected" );
				this.#toolSelected = tool;
			}
		};
		this.$elements.$wave.onpointerdown = e => {
			this.#ptrDown = true;
			this.$elements.$wave.setPointerCapture( e.pointerId );
			this.#waveArray2 = new Float32Array( this.#waveArray );
			this.#clickSquare( e );
		};
		this.$elements.$wave.onpointermove = e => {
			this.#updateHoverSquare( e.offsetX, e.offsetY );
			if ( this.#ptrDown ) {
				this.#clickSquare( e );
			}
		};
		this.$elements.$wave.onpointerup = e => {
			this.#ptrDown = false;
			this.$elements.$wave.releasePointerCapture( e.pointerId );
			this.#waveArray2 = null;
			this.#currentSquare = null;
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
	#getCoord( px, py ) {
		const [ w, h ] = this.#gridSize;

		return [
			GSUmathClamp( px / ( this.#waveW / w ) | 0, 0, w - 1 ),
			GSUmathClamp( py / ( this.#waveH / h ) | 0, 0, h - 1 ),
		];
	}
	#clickSquare( e ) {
		const coord = this.#getCoord( e.offsetX, e.offsetY );
		const coordStr = coord + "";

		if ( this.#currentSquare !== coordStr ) {
			this.#currentSquare = coordStr;
			this.#clickSquare2( this.#waveArray, ...coord, ...this.#gridSize );
			this.#drawWave();
		}
	}
	#clickSquare2( wave, x, y, w, h ) {
		const fn = gsuiWaveEditor.#clickSquareFns[ this.#toolSelected ];
		const waveLen = wave.length;
		const sqX = waveLen / w * x | 0;
		const sqH = 1 / h * 2;
		const sqY = 1 - ( ( y + 1 ) / h ) * 2;
		const sqW = waveLen / w;

		for ( let i = 0; i < sqW; ++i ) {
			wave[ sqX + i ] = sqY + sqH * fn( i / sqW );
		}
	}
	static #clickSquareFns = {
		goUp: n => n,
		goDown: n => 1 - n,
		stayUp: () => 1,
		stayDown: () => 0,
	}
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
		const [ ix, iy ] = this.#getCoord( px, py );

		GSUsetStyle( this.$elements.$hoverSquare, {
			left: `${ ix / this.#gridSize[ 0 ] * 100 }%`,
			top: `${ iy / this.#gridSize[ 1 ] * 100 }%`,
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
