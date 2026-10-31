"use strict";

class gsuiBufferView extends gsui0ne {
	#x_px = 0;
	#w_px = 1;
	#vx_px = 0;
	#vw_px = 1;
	#viewA = 0;
	#viewB = 1;
	#viewASave = 0;
	#viewBMin = 0;
	#time = 0;
	#selA = 0;
	#selB = 1;
	#selASave = 0;
	#selBSave = 0;
	#ptrFn = null;
	#ptrGap = 0;
	#ptrList = new Map();

	constructor() {
		super( {
			$tagName: "gsui-buffer-view",
			$template: $.$elem( "gsui-bv-in", null,
				$.$elem( "gsui-bv-body", { "data-prop": "body-move" },
					$.$elem( "gsui-waveform" ),
					$.$elem( "gsui-bv-selection", null,
						$.$div( { "data-prop": "sel-move" } ),
						$.$div( { "data-prop": "sel-start" } ),
						$.$div( { "data-prop": "sel-end" } ),
					),
					$.$elem( "gsui-bv-cursor" ),
				),
				$.$elem( "gsui-bv-minimap", { "data-prop": "map-teleport" },
					$.$elem( "gsui-waveform" ),
					$.$elem( "gsui-bv-selection" ),
					$.$elem( "gsui-bv-minimap-view", { "data-prop": "map-move" },
						$.$div( { "data-prop": "map-start" } ),
						$.$div( { "data-prop": "map-end" } ),
					),
					$.$elem( "gsui-bv-cursor" ),
				),
			),
			$elements: {
				$in: "gsui-bv-in",
				$body: "gsui-bv-body",
				$bodyWave: "gsui-bv-body gsui-waveform",
				$bodySel: "gsui-bv-body gsui-bv-selection",
				$bodyCursor: "gsui-bv-body gsui-bv-cursor",
				$mini: "gsui-bv-minimap",
				$miniView: "gsui-bv-minimap-view",
				$miniWave: "gsui-bv-minimap gsui-waveform",
				$miniSel: "gsui-bv-minimap gsui-bv-selection",
				$miniCursor: "gsui-bv-minimap gsui-bv-cursor",
			},
			$attributes: {
				view: "0 1",
				time: 0,
			},
		} );
		this.$on( "wheel", this.#onwheel.bind( this ) );
		this.$elements.$body.$onpinch( this.#onpinch.bind( this ) );
		this.$elements.$in.$on( {
			dragstart: e => e.preventDefault(),
			pointerdown: this.#onptrdown.bind( this ),
			pointermove: this.#onptrmove.bind( this ),
			pointerup: this.#onptrup.bind( this ),
		} );
	}
	static get observedAttributes() {
		return [ "view", "time", "selection" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "view": this.#onchangeView( val ); break;
			case "time": this.#onchangeTime( val ); break;
			case "selection": this.#onchangeSelection( val ); break;
		}
	}
	$onmessage( key, val ) {
		switch ( key ) {
			case GSEV_BUFFERVIEW_BUFFER: this.#onchangeBuffer( val ); break;
		}
	}

	// .........................................................................
	#onptrdown( e ) {
		if ( e.button === 0 ) {
			const act = $.$dataProp( e.target );

			this.#ptrList.set( e.pointerId, e.target );
			$.$setPtrCapture( e.target, e.pointerId );
			if ( this.#ptrList.size === 1 ) {
				const mapBCR = this.$elements.$mini.$bcr();
				const mapViewBCR = this.$elements.$miniView.$bcr();

				this.#x_px = mapBCR.x;
				this.#w_px = mapBCR.w;
				this.#vx_px = mapViewBCR.x;
				this.#vw_px = mapViewBCR.w;
				this.#selASave = this.#selA;
				this.#selBSave = this.#selB;
				this.#viewASave = this.#viewA;
				this.#ptrFn = this.#getActionFn( act );
				this.#ptrGap = this.#calcPtrgap( e, act );
				if ( GSUisOneOf( act, "body-move", "map-move", "map-teleport", "sel-move" ) ) {
					$.$css( e.target, "cursor", "var(--gsuiCursor-grabbing)" );
				}
				this.#onptrmove( e );
			}
		}
	}
	#calcPtrgap( e, act ) {
		if ( GSUisOneOf( act, "map-start", "map-end", "map-move" ) ) {
			return e.pageX - this.#vx_px;
		} else if ( GSUisOneOf( act, "sel-move", "body-move", "sel-start", "sel-end" ) ) {
			return e.pageX - this.#x_px;
		}
		return 0;
	}
	#onptrmove( e ) {
		if ( this.#ptrList.size === 1 ) {
			this.#ptrFn?.( ( e.pageX - this.#ptrGap - this.#x_px ) / this.#w_px );
		}
	}
	#onptrup( e ) {
		const tar = this.#ptrList.get( e.pointerId );

		this.#ptrList.forEach( ( tar, pid ) => $.$relPtrCapture( tar, pid ) );
		this.#ptrList.clear();
		this.#ptrFn = null;
		$.$css( tar, "cursor", "" );
	}

	// .........................................................................
	#onchangeBuffer( buf ) {
		this.#viewBMin = 300 / ( buf.duration * buf.sampleRate * 10 );
		this.$elements.$bodyWave.$message( GSEV_WAVEFORM_BUFFER, buf );
		this.$elements.$miniWave.$message( GSEV_WAVEFORM_BUFFER, buf );
	}
	#onchangeView( view ) {
		const [ a, b ] = GSUsplitNums( view );

		this.#viewA = GSUmathClamp( a, 0, 1 );
		this.#viewB = GSUmathClamp( b, 0, 1 - this.#viewA );
		this.$elements.$bodyWave.$setAttr( "view", `${ this.#viewA } ${ this.#viewB }` );
		this.#updateBodySelection();
		this.#updateBodyCursor();
		this.#updateMiniView();
	}
	#onchangeTime( t ) {
		this.#time = t;
		this.#updateBodyCursor();
		this.#updateMiniCursor();
	}
	#onchangeSelection( sel ) {
		if ( !sel ) {
			this.#selA =
			this.#selB = 0;
			this.#updateBodySelection();
			this.#updateMiniSelection();
		} else {
			const [ a, b ] = GSUsplitNums( sel );
			const a2 = GSUmathClamp( a, 0, 1 );
			const b2 = GSUmathClamp( b, 0, 1 - a2 );

			if ( a !== a2 || b !== b2 ) {
				console.warn( `gsuiBufferView: error 'selection' ${ sel }` );
				this.#setSel( a2, b2 );
			} else if ( b2 <= 0 ) {
				this.$rmAttr( "selection" );
			} else {
				this.#selA = a2;
				this.#selB = b2;
				this.#updateBodySelection();
				this.#updateMiniSelection();
			}
		}
	}

	// .........................................................................
	#updateMiniView() {
		this.$elements.$miniView
			.$left( this.#viewA * 100, "%" )
			.$width( this.#viewB * 100, "%" );
	}
	#updateBodySelection() {
		const a = this.#selA;
		const b = this.#selB;
		const a2 = ( a - this.#viewA ) / this.#viewB;
		const b2 = b / this.#viewB;

		this.$elements.$bodySel
			.$left( a2 * 100, "%" )
			.$width( b2 * 100, "%" );
	}
	#updateMiniSelection() {
		this.$elements.$miniSel
			.$left( this.#selA * 100, "%" )
			.$width( this.#selB * 100, "%" );
	}
	#updateBodyCursor() {
		const t = this.#time;
		const t2 = ( t - this.#viewA ) / this.#viewB;

		this.$elements.$bodyCursor.$left( t2 * 100, "%" );
	}
	#updateMiniCursor() {
		this.$elements.$miniCursor.$left( this.#time * 100, "%" );
	}

	// .........................................................................
	#onpinch( o ) {
		this.#zoom( o.$pageX, 1 / o.$scaleRelative );
	}
	#onwheel( e ) {
		e.preventDefault();
		this.#zoom( e.pageX, gsuiBufferView.#getWheelDelta( -e.deltaY ) );
	}
	static #getWheelDelta( d ) {
		let inc = 1.1;

		if ( -50 < d && d < 50 ) {
			inc = 1 + Math.abs( d ) / 100;
		}
		return d > 0 ? 1 / inc : inc;
	}
	#zoom( pageX, scale ) {
		const bcr = this.$bcr();
		const x = ( pageX - bcr.x ) / bcr.w;
		const b = this.#viewB;
		const b2 = GSUmathClamp( b * scale, this.#viewBMin, 1 );
		const a = GSUmathClamp( this.#viewA + ( b - b2 ) * x, 0, 1 );

		this.#setView( Math.min( a, 1 - b2 ), b2 );
	}

	// .........................................................................
	#getActionFn( act ) {
		switch ( act ) {
			case "body-move": return this.#bodyMove;
			case "sel-move": return this.#selMove;
			case "sel-start": return this.#selStart;
			case "sel-end": return this.#selEnd;
			case "map-teleport": return this.#minimapTeleport;
			case "map-start": return this.#minimapStart;
			case "map-move": return this.#minimapMove;
			case "map-end": return this.#minimapEnd;
		}
	}
	#setView( a, b ) {
		this.$setAttr( "view", `${ a } ${ b }` );
	}
	#setSel( a, b ) {
		this.$setAttr( "selection", `${ a } ${ b }` )
			.$dispatch( GSEV_BUFFERVIEW_SELECTION_CHANGE, a, b );
	}
	#bodyMove( n ) {
		const a = GSUmathClamp( this.#viewASave + n * -this.#viewB, 0, 1 - this.#viewB );

		this.#setView( a, this.#viewB );
	}
	#selMove( n ) {
		const a = GSUmathClamp( this.#selASave + n * this.#viewB, 0, 1 - this.#selB );

		this.#setSel( a, this.#selB );
	}
	#selStart( n ) {
		const a = GSUmathClamp( this.#selASave + n * this.#viewB, 0, this.#selA + this.#selB - this.#viewBMin );
		const b = this.#selB - ( a - this.#selA );

		this.#setSel( a, b );
	}
	#selEnd( n ) {
		const b = GSUmathClamp( this.#selBSave + n * this.#viewB, this.#viewBMin, 1 - this.#selA );

		this.#setSel( this.#selA, b );
	}
	#minimapStart( n ) {
		const a = GSUmathClamp( n, 0, this.#viewA + this.#viewB - this.#viewBMin );
		const b = this.#viewB - ( a - this.#viewA );

		this.#setView( a, b );
	}
	#minimapEnd( n ) {
		const b = n + this.#vw_px / this.#w_px;
		const b2 = GSUmathClamp( b - this.#viewA, this.#viewBMin, 1 - this.#viewA );

		this.#setView( this.#viewA, b2 );
	}
	#minimapMove( n ) {
		const a = GSUmathClamp( n, 0, 1 - this.#viewB );

		this.#setView( a, this.#viewB );
	}
	#minimapTeleport( n ) {
		const a = GSUmathClamp( n - this.#viewB / 2, 0, 1 - this.#viewB );

		this.#setView( a, this.#viewB );
	}
}

$.$define( "gsui-buffer-view", gsuiBufferView );
