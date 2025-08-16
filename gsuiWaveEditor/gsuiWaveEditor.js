"use strict";

class gsuiWaveEditor extends gsui0ne {
	#div = [ 1, 1 ];
	#waveW = 0;
	#waveH = 0;
	#ptrDown = false;
	#waveArray = null;
	#waveArray2 = null;
	#currentSquare = null;
	#toolSelected = null;
	#actionMenu = new gsuiActionMenu();
	#drawWaveThr = GSUthrottle( this.#drawWave.bind( this ), .2 );
	static #clickSquareFns = {
		goUp:     n =>     n,
		goDown:   n => 1 - n,
		stayUp:   () => 1,
		stayDown: () => 0,
		hillUp:   n =>     Math.sin( n * Math.PI ),
		hillDown: n => 1 - Math.sin( n * Math.PI ),
		sineUp:   n => .5 + Math.sin( n * Math.PI * 2 ) / 2,
		sineDown: n => .5 - Math.sin( n * Math.PI * 2 ) / 2,
		easeUp:   n =>    -( Math.cos( n * Math.PI ) - 1 ) / 2,
		easeDown: n => 1 + ( Math.cos( n * Math.PI ) - 1 ) / 2,
	}
	static #clickSquareFnsSymm = {
		goUp:     "goUp",
		goDown:   "goDown",
		stayUp:   "stayDown",
		stayDown: "stayUp",
		hillUp:   "hillDown",
		hillDown: "hillUp",
		sineUp:   "sineUp",
		sineDown: "sineDown",
		easeUp:   "easeUp",
		easeDown: "easeDown",
	}

	constructor() {
		super( {
			$cmpName: "gsuiWaveEditor",
			$tagName: "gsui-wave-editor",
			$elements: {
				$wave: ".gsuiWaveEditor-wave",
				$tools: ".gsuiWaveEditor-tools",
				$resetBtn: ".gsuiWaveEditor-reset",
				$symmetryBtn: ".gsuiWaveEditor-symmetry",
				$gridVal: "[].gsuiWaveEditor-gridSize span",
				$gridSli: "[].gsuiWaveEditor-gridSize gsui-slider",
				$beatlines: "[].gsuiWaveEditor-wave gsui-beatlines",
				$hoverSquare: ".gsuiWaveEditor-wave-hover-square",
				$waveSVG: ".gsuiWaveEditor-wave svg",
				$wavePolyline: ".gsuiWaveEditor-wave polyline",
			},
			$attributes: {
				div: "16 16",
				tool: "goUp",
			}
		} );
		Object.seal( this );
		this.#initActionMenu();
		this.$elements.$symmetryBtn.onclick = e => GSUdomTogAttr( this, "symmetry" );
		this.$elements.$tools.onclick = e => e.target.dataset.tool && GSUdomSetAttr( this, "tool", e.target.dataset.tool );
		this.$elements.$wave.onpointerdown = e => {
			if ( this.#waveArray ) {
				this.#ptrDown = true;
				this.$elements.$wave.setPointerCapture( e.pointerId );
				this.#waveArray2 ||= new Float32Array( this.#waveArray );
				this.#clickSquare( e );
			}
		};
		this.$elements.$wave.onpointermove = e => {
			this.#updateHoverSquare( e.offsetX, e.offsetY );
			if ( this.#ptrDown ) {
				this.#clickSquare( e );
			}
		};
		this.$elements.$wave.onpointerup = e => {
			if ( this.#ptrDown ) {
				this.#ptrDown = false;
				this.$elements.$wave.releasePointerCapture( e.pointerId );
				if ( !GSUarrayEq( this.#waveArray, this.#waveArray2, .005 ) ) {
					this.#waveArray2 = null;
					this.$dispatch( "change", [ ...this.#waveArray ] );
				}
				this.#currentSquare = null;
			}
		};
		this.ondragover = GSUnoopFalse;
		this.ondrop = e => {
			let ctx;

			e.preventDefault();
			e.stopPropagation();
			GSUgetFilesDataTransfert( e.dataTransfer.items )
				.then( files => GSUgetFileContent( files[ 0 ], "array" ) )
				.then( arr => {
					ctx = GSUaudioContext();
					return ctx.decodeAudioData( arr );
				} )
				.then( buf => {
					ctx.close();
					return buf.numberOfChannels >= 1
						? buf.getChannelData( 0 )
						: null;
				} )
				.then( bufData => {
					const bufData2 = GSUarrayResize( bufData, 2048 );
					
					this.$setWaveArray( bufData2 );
					this.$dispatch( "change", bufData2 );
				} );
		};
		GSUlistenEvents( this, {
			gsuiSlider: {
				change: GSUnoop,
				input: ( d, t ) => {
					GSUdomSetAttr( this, "div", GSUdomGetAttr( t.parentNode, "dir" ) === "x"
						? `${ d.args[ 0 ] } ${ this.#div[ 1 ] }`
						: `${ this.#div[ 0 ] } ${ d.args[ 0 ] }` );
				},
			},
		} );
	}

	// .........................................................................
	$onresize() {
		const [ w, h ] = GSUdomGetSize( this.$elements.$wave );

		this.#waveW = w | 0;
		this.#waveH = h | 0;
		this.#updateBeatlines( 0, this.#div[ 0 ] );
		this.#updateBeatlines( 1, this.#div[ 1 ] );
		this.#drawWaveThr();
	}
	$firstTimeConnected() {
		GSUdomRmAttr( this.$elements.$beatlines[ 0 ], "coloredbeats" );
		GSUdomRmAttr( this.$elements.$beatlines[ 1 ], "coloredbeats" );
	}
	static get observedAttributes() {
		return [ "div", "tool" ];
	}
	$attributeChanged( prop, val, prev ) {
		switch ( prop ) {
			case "tool":
				GSUdomRmAttr( GSUdomQS( this, `button[data-tool="${ prev }"]` ), "data-selected" );
				GSUdomSetAttr( GSUdomQS( this, `button[data-tool="${ val }"]` ), "data-selected" );
				this.#toolSelected = val;
				break;
			case "div": {
				const [ x, y ] = GSUsplitInts( val );

				this.#updateGridSize( 0, x );
				this.#updateGridSize( 1, y );
			} break;
		}
	}

	// .........................................................................
	$reset( w ) {
		const arr = !w || w === "silence"
			? GSUnewArray( 2048, 0 )
			: GSUmathWaveFns[ w ]( 2048 );

		this.$setWaveArray( arr );
		return arr;
	}
	$setWaveArray( arr ) {
		this.#waveArray = new Float32Array( arr );
		this.#waveArray2 = null;
		this.#drawWave();
	}

	// .........................................................................
	#initActionMenu() {
		this.#actionMenu.$bindTargetElement( this.$elements.$resetBtn );
		this.#actionMenu.$setDirection( "RB" );
		this.#actionMenu.$setMaxSize( "260px", "180px" );
		this.#actionMenu.$setCallback( w => this.$dispatch( "change", this.$reset( w ) ) );
		this.#actionMenu.$setActions( [
			{ id: "silence",  name: "Silence" },
			{ id: "sine",     name: "Sine" },
			{ id: "triangle", name: "Triangle" },
			{ id: "sawtooth", name: "Sawtooth" },
			{ id: "square",   name: "Square" },
		] );
	}
	#getCoord( px, py ) {
		const [ w, h ] = this.#div;

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
			gsuiWaveEditor.#clickSquare2(
				this.#waveArray,
				this.#toolSelected,
				...coord,
				...this.#div
			);
			if ( GSUdomHasAttr( this, "symmetry" ) ) {
				gsuiWaveEditor.#clickSquare2(
					this.#waveArray,
					gsuiWaveEditor.#clickSquareFnsSymm[ this.#toolSelected ],
					this.#div[ 0 ] - 1 - coord[ 0 ],
					this.#div[ 1 ] - 1 - coord[ 1 ],
					...this.#div
				);
			}
			this.#drawWave();
		}
	}
	static #clickSquare2( wave, tool, x, y, w, h ) {
		const fn = gsuiWaveEditor.#clickSquareFns[ tool ];
		const waveLen = wave.length;
		const sqX = waveLen / w * x | 0;
		const sqH = 1 / h * 2;
		const sqY = 1 - ( ( y + 1 ) / h ) * 2;
		const sqW = waveLen / w;

		for ( let i = 0; i < sqW; ++i ) {
			wave[ sqX + i ] = sqY + sqH * fn( i / sqW );
		}
	}
	#drawWave() {
		GSUsetViewBoxWH( this.$elements.$waveSVG, this.#waveW, this.#waveH );
		gsuiWaveEditor.$drawWave( this.$elements.$wavePolyline, this.#waveArray, this.#waveW, this.#waveH );
	}
	static $drawWave( polyline, waveArray, w, h ) {
		if ( !waveArray || !w || !h ) {
			return;
		}

		const arr = GSUarrayResize( waveArray, w );
		const len = arr.length - 1;
		const pts = GSUnewArray( len + 1, i => [
			i / len * w,
			( .5 - arr[ i ] / 2 ) * h,
		] );

		pts.unshift(
			[ -10, h / 2 ],
			[ -10, pts[ 0 ][ 1 ] ],
		);
		pts.push(
			[ w + 10, pts.at( -1 )[ 1 ] ],
			[ w + 10, h / 2 ],
		);
		GSUdomSetAttr( polyline, "points", pts.join( " " ) );
	}
	#updateHoverSquare( px, py ) {
		const [ ix, iy ] = this.#getCoord( px, py );

		GSUsetStyle( this.$elements.$hoverSquare, {
			left: `${ ix / this.#div[ 0 ] * 100 }%`,
			top: `${ iy / this.#div[ 1 ] * 100 }%`,
		} );
	}
	#updateBeatlines( dir, sz ) {
		const bl = this.$elements.$beatlines[ dir ];
		const blSize = dir ? bl.clientHeight : bl.clientWidth;

		GSUdomSetAttr( bl, "pxperbeat", blSize );
		GSUdomSetAttr( bl, "timedivision", `1/${ sz }` );
	}
	#updateGridSize( dir, val ) {
		this.#div[ dir ] = +val;
		this.$elements.$gridVal[ dir ].textContent = val;
		this.$elements.$hoverSquare.style[ dir ? "height" : "width" ] = `${ 1 / val * 100 }%`;
		this.#updateBeatlines( dir, val );
		GSUdomSetAttr( this.$elements.$gridSli[ dir ], "value", val );
	}
}

GSUdefineElement( "gsui-wave-editor", gsuiWaveEditor );
