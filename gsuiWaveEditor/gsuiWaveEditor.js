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
	};
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
	};

	constructor() {
		super( {
			$cmpName: "gsuiWaveEditor",
			$tagName: "gsui-wave-editor",
			$jqueryfy: true,
			$elements: {
				$wave: ".gsuiWaveEditor-wave",
				$resetBtn: ".gsuiWaveEditor-reset",
				$gridVal: ".gsuiWaveEditor-div span",
				$gridSli: ".gsuiWaveEditor-div gsui-slider",
				$hoverSquare: ".gsuiWaveEditor-wave-hover-square",
				$waveSVG: ".gsuiWaveEditor-wave svg",
				$wavePolyline: ".gsuiWaveEditor-wave polyline",
			},
			$attributes: {
				div: "16 16",
				tool: "goUp",
			},
		} );
		Object.seal( this );
		this.#initActionMenu();
		this.onclick = this.#onclick.bind( this );
		this.ondrop = this.#ondrop.bind( this );
		this.ondragover = GSUnoopFalse;
		this.$elements.$wave.$on( {
			pointerdown: this.#onptrdownWave.bind( this ),
			pointermove: this.#onptrmoveWave.bind( this ),
			pointerup: this.#onptrupWave.bind( this ),
		} );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUTSTART ]: this.#oninputstartSlider.bind( this ),
			[ GSEV_SLIDER_INPUT ]: this.#oninputSlider.bind( this ),
			[ GSEV_SLIDER_CHANGE ]: this.#onchangeSlider.bind( this ),
		} );
	}

	// .........................................................................
	$onresize() {
		this.#waveW = this.$elements.$wave.$width() | 0;
		this.#waveH = this.$elements.$wave.$height() | 0;
		this.#updateBeatlines( 0, this.#div[ 0 ] );
		this.#updateBeatlines( 1, this.#div[ 1 ] );
		this.#drawWaveThr();
	}
	static get observedAttributes() {
		return [ "div", "tool" ]; // "symmetry", "normalized"
	}
	$attributeChanged( prop, val, prev ) {
		switch ( prop ) {
			case "tool":
				this.$this.$find( `button[data-tool="${ prev }"]` ).$attr( "data-selected", false );
				this.$this.$find( `button[data-tool="${ val }"]` ).$attr( "data-selected", true );
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
	static #isNormalized( w ) {
		const max = w.reduce( ( max, n ) => Math.max( max, Math.abs( n ) ), 0 );

		return max >= .999;
	}
	static #normalize( w ) {
		const max = w.reduce( ( max, n ) => Math.max( max, Math.abs( n ) ), 0 );
		const norm = max === 0 ? 1 : 1 / max;

		return new Float32Array( w.map( n => n * norm ) );
	}
	static #mirror( w, dir ) {
		return dir === "x"
			? [ ...w ].reverse()
			: w.map( n => -n );
	}
	static #mirrorX( w, n ) {
		const nAbs = Math.abs( n );
		const wLen = w.length;
		const wInLen = wLen * nAbs | 0;

		if ( nAbs < 1 ) {
			const wIn = GSUarrayResize( w, wInLen );
			const arr0 = GSUnewArray( ( wLen - wInLen ) / 2, 0 );
			const w2 = [ ...arr0, ...wIn, ...arr0 ];

			return n > 0 ? w2 : w2.reverse();
		}

		const w2 = GSUarrayResize( w, wInLen ).splice( ( wInLen - wLen ) / 2 | 0 );

		w2.length = wLen;
		return n > 0 ? w2 : w2.reverse();
	}
	static #mirrorY( w, n ) {
		return w.map( x => GSUmathClamp( x * n, -1, 1 ) );
	}

	// .........................................................................
	#onclick( e ) {
		const btn = e.target;

		if ( btn.tagName === "BUTTON" ) {
			const act = GSUdomGetAttr( btn, "data-action" );
			let w;

			switch ( act ) {
				case "symmetry":
					this.$this
						.$togAttr( "symmetry" )
						.$dispatch( GSEV_WAVEEDITOR_PARAM, { symmetry: this.$this.$hasAttr( "symmetry" ) } );
					break;
				case "tool": {
					const t = btn.dataset.tool;

					if ( t && this.$this.$attr( "tool" ) !== t ) {
						this.$this
							.$attr( "tool", t )
							.$dispatch( GSEV_WAVEEDITOR_PARAM, { tool: t } );
					}
				} break;
				case "mirror":
					w = gsuiWaveEditor.#mirror( this.#waveArray, GSUdomGetAttr( btn, "data-dir" ) );
					break;
				case "normalize-y":
					w = gsuiWaveEditor.#normalize( this.#waveArray );
					this.$this.$attr( "normalized", true );
					break;
			}
			if ( w && !GSUarrayEq( w, this.#waveArray, .005 ) ) {
				this.#waveArray = w;
				this.#drawWave();
				this.$this.$dispatch( GSEV_WAVEEDITOR_CHANGE, [ ...w ] );
			}
		}
	}

	// .........................................................................
	#ondrop( e ) {
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
				this.$this.$dispatch( GSEV_WAVEEDITOR_CHANGE, bufData2 );
			} );
	}

	// .........................................................................
	#onptrdownWave( e ) {
		if ( this.#waveArray ) {
			e.preventDefault();
			this.#ptrDown = true;
			this.$elements.$wave.$get( 0 ).setPointerCapture( e.pointerId );
			this.#waveArray2 ||= new Float32Array( this.#waveArray );
			this.#clickSquare( e );
		}
	}
	#onptrmoveWave( e ) {
		this.#updateHoverSquare( e.offsetX, e.offsetY );
		if ( this.#ptrDown ) {
			this.#clickSquare( e );
		}
	}
	#onptrupWave( e ) {
		if ( this.#ptrDown ) {
			this.#ptrDown = false;
			this.$elements.$wave.$get( 0 ).releasePointerCapture( e.pointerId );
			if ( !GSUarrayEq( this.#waveArray, this.#waveArray2, .005 ) ) {
				this.#waveArray2 = null;
				this.$this.$dispatch( GSEV_WAVEEDITOR_CHANGE, [ ...this.#waveArray ] );
			}
			this.#currentSquare = null;
		}
	}

	// .........................................................................
	#oninputstartSlider( d ) {
		const act = GSUdomGetAttr( d.$target, "data-action" );

		switch ( act ) {
			case "phase":
			case "mirror-x":
			case "mirror-y":
				this.#waveArray2 = new Float32Array( this.#waveArray );
				break;
		}
	}
	#oninputSlider( d, val ) {
		const act = GSUdomGetAttr( d.$target, "data-action" );

		switch ( act ) {
			case "mirror-x":
				this.#waveArray = gsuiWaveEditor.#mirrorX( this.#waveArray2, 1 + GSUmathRound( val, 1 / this.#div[ 0 ] * 2 ) );
				this.#drawWave();
				break;
			case "mirror-y":
				this.#waveArray = gsuiWaveEditor.#mirrorY( this.#waveArray2, 1 + GSUmathRound( val, 1 / this.#div[ 1 ] * 2 ) );
				this.#drawWave();
				break;
			case "div-x":
			case "div-y":
				this.$this.$attr( "div", act === "div-x"
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
		const act = GSUdomGetAttr( d.$target, "data-action" );

		switch ( act ) {
			case "div-x":
			case "div-y":
				this.$this.$dispatch( GSEV_WAVEEDITOR_PARAM, { div: this.$this.$attr( "div" ) } );
				break;
			case "mirror-x":
			case "mirror-y":
			case "phase":
				GSUdomSetAttr( d.$target, "value", 0 );
				if ( !GSUarrayEq( this.#waveArray, this.#waveArray2, .005 ) ) {
					this.$this.$dispatch( GSEV_WAVEEDITOR_CHANGE, [ ...this.#waveArray ] );
				}
				this.#waveArray2 = null;
				break;
		}
	}

	// .........................................................................
	#initActionMenu() {
		this.#actionMenu.$bindTargetElement( this.$elements.$resetBtn.$get( 0 ) );
		this.#actionMenu.$setDirection( "RB" );
		this.#actionMenu.$setMaxSize( "260px", "180px" );
		this.#actionMenu.$setCallback( w => this.$this.$dispatch( GSEV_WAVEEDITOR_CHANGE, this.$reset( w ) ) );
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
		const coordStr = `${ coord }`;

		if ( this.#currentSquare !== coordStr ) {
			this.#currentSquare = coordStr;
			gsuiWaveEditor.#clickSquare2(
				this.#waveArray,
				this.#toolSelected,
				...coord,
				...this.#div
			);
			if ( this.$this.$hasAttr( "symmetry" ) ) {
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
		this.$elements.$waveSVG.$viewbox( this.#waveW, this.#waveH );
		gsuiWaveEditor.$drawWave( this.$elements.$wavePolyline, this.#waveArray, this.#waveW, this.#waveH );
		this.#updateNormalized();
	}
	static $drawWave( polyline, waveArray, w, h ) {
		if ( !waveArray?.length || !w || !h ) {
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
		polyline.$attr( "points", pts.join( " " ) );
	}
	#updateHoverSquare( px, py ) {
		const [ ix, iy ] = this.#getCoord( px, py );

		this.$elements.$hoverSquare
			.$left( ix / this.#div[ 0 ] * 100, "%" )
			.$top( iy / this.#div[ 1 ] * 100, "%" );
	}
	#updateBeatlines( dir, sz ) {
		const bl = this.$elements.$wave.$find( `gsui-beatlines:nth-child(${ dir + 1 })` );

		bl.$attr( {
			pxperbeat: dir ? bl.$height() : bl.$width(),
			timedivision: `1/${ sz }`,
		} );
	}
	#updateGridSize( dir, val ) {
		this.#div[ dir ] = +val;
		this.$elements.$hoverSquare.$css( dir ? "height" : "width", `${ 1 / val * 100 }%` );
		this.#updateBeatlines( dir, val );
		GSUjq( this.$elements.$gridVal.$get( dir ) ).$text( val );
		GSUjq( this.$elements.$gridSli.$get( dir ) ).$attr( "value", val );
	}
	#updateNormalized() {
		this.$this.$attr( "normalized", gsuiWaveEditor.#isNormalized( this.#waveArray ) );
	}
}

GSUdomDefine( "gsui-wave-editor", gsuiWaveEditor );
