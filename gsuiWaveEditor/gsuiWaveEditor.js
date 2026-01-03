"use strict";

class gsuiWaveEditor extends gsui0ne {
	#div = [ 1, 1 ];
	#waveW = 0;
	#waveH = 0;
	#ptrDown = false;
	#waveArray = [];
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
				$mirrorXBtn: ".gsuiWaveEditor-mirror button[data-dir='x']",
				$mirrorYBtn: ".gsuiWaveEditor-mirror button[data-dir='y']",
				$mirrorXSli: ".gsuiWaveEditor-mirror gsui-slider[action='mirror-x']",
				$mirrorYSli: ".gsuiWaveEditor-mirror gsui-slider[action='mirror-y']",
				$normalizeBtn: ".gsuiWaveEditor-normalize-btn",
				$gridVal: "[].gsuiWaveEditor-gridSize span",
				$gridSli: "[].gsuiWaveEditor-gridSize gsui-slider",
				$phaseSli: ".gsuiWaveEditor-phase gsui-slider",
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
		this.$elements.$mirrorXBtn.onclick =
		this.$elements.$mirrorYBtn.onclick = this.#mirror.bind( this );
		this.$elements.$normalizeBtn.onclick = this.#onclickNormalize.bind( this );
		this.$elements.$symmetryBtn.onclick = () => {
			GSUdomTogAttr( this, "symmetry" );
			GSUdomDispatch( this, GSEV_WAVEEDITOR_PARAM, { symmetry: GSUdomHasAttr( this, "symmetry" ) } );
		};
		this.$elements.$tools.onclick = e => {
			const t = e.target.dataset.tool;

			if ( t && GSUdomGetAttr( this, "tool" ) !== t ) {
				GSUdomSetAttr( this, "tool", t );
				GSUdomDispatch( this, GSEV_WAVEEDITOR_PARAM, { tool: t } );
			}
		};
		this.$elements.$wave.onpointerdown = e => {
			if ( this.#waveArray ) {
				e.preventDefault();
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
					GSUdomDispatch( this, GSEV_WAVEEDITOR_CHANGE, [ ...this.#waveArray ] );
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
					GSUdomDispatch( this, GSEV_WAVEEDITOR_CHANGE, bufData2 );
				} );
		};
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUTSTART ]: this.#oninputstartSlider.bind( this ),
			[ GSEV_SLIDER_INPUT ]: this.#oninputSlider.bind( this ),
			[ GSEV_SLIDER_CHANGE ]: this.#onchangeSlider.bind( this ),
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
	static get observedAttributes() {
		return [ "div", "tool" ]; // + symmetry
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
	static #shiftPhase( w, n ) {
		const len = w.length * Math.abs( n ) | 0;
		const x = n < 0 ? len : w.length - len;

		return new Float32Array( [ ...w.slice( x ), ...w.slice( 0, x ) ] );
	}
	static #normalize( w ) {
		const max = w.reduce( ( max, n ) => Math.max( max, Math.abs( n ) ), 0 );
		const norm = max === 0 ? 1 : 1 / max;

		return new Float32Array( w.map( n => n * norm ) );
	}

	// .........................................................................
	#onclickNormalize( e ) {
		const w = gsuiWaveEditor.#normalize( this.#waveArray );

		if ( !GSUarrayEq( w, this.#waveArray, .005 ) ) {
			this.#waveArray = w;
			this.#drawWave();
			GSUdomDispatch( this, GSEV_WAVEEDITOR_CHANGE, [ ...w ] );
		}
	}
	#mirror( e ) {
		const w = this.#waveArray;
		const save = new Float32Array( w );

		if ( e.target.dataset.dir === "x" ) {
			w.reverse();
		} else {
			w.forEach( ( n, i, arr ) => arr[ i ] = -n );
		}
		this.#drawWave();
		if ( !GSUarrayEq( w, save, .005 ) ) {
			GSUdomDispatch( this, GSEV_WAVEEDITOR_CHANGE, [ ...w ] );
		}
	}

	// .........................................................................
	#oninputstartSlider( d ) {
		const act = GSUdomGetAttr( d.$target, "action" );

		switch ( act ) {
			case "phase":
				this.#waveArray2 = new Float32Array( this.#waveArray );
				break;
		}
	}
	#oninputSlider( d, val ) {
		const act = GSUdomGetAttr( d.$target, "action" );

		switch ( act ) {
			case "div-x":
			case "div-y":
				GSUdomSetAttr( this, "div", act === "div-x"
					? `${ val } ${ this.#div[ 1 ] }`
					: `${ this.#div[ 0 ] } ${ val }` );
				break;
			case "phase":
				this.#waveArray = gsuiWaveEditor.#shiftPhase( this.#waveArray2, GSUmathRound( val, 1 / this.#div[ 0 ] ) );
				this.#drawWave();
				break;
		}
	}
	#onchangeSlider( d ) {
		const act = GSUdomGetAttr( d.$target, "action" );

		switch ( act ) {
			case "div-x":
			case "div-y":
				GSUdomDispatch( this, GSEV_WAVEEDITOR_PARAM, { div: GSUdomGetAttr( this, "div" ) } );
				break;
			case "phase":
				GSUdomSetAttr( d.$target, "value", 0 );
				if ( !GSUarrayEq( this.#waveArray, this.#waveArray2, .005 ) ) {
					GSUdomDispatch( this, GSEV_WAVEEDITOR_CHANGE, [ ...this.#waveArray ] );
				}
				this.#waveArray2 = null;
				break;
		}
	}

	// .........................................................................
	#initActionMenu() {
		this.#actionMenu.$bindTargetElement( this.$elements.$resetBtn );
		this.#actionMenu.$setDirection( "RB" );
		this.#actionMenu.$setMaxSize( "260px", "180px" );
		this.#actionMenu.$setCallback( w => GSUdomDispatch( this, GSEV_WAVEEDITOR_CHANGE, this.$reset( w ) ) );
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
		GSUdomViewBox( this.$elements.$waveSVG, this.#waveW, this.#waveH );
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

		GSUdomStyle( this.$elements.$hoverSquare, {
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

GSUdomDefine( "gsui-wave-editor", gsuiWaveEditor );
