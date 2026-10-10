"use strict";

class gsuiBufferView extends gsui0ne {
	#buf = null;
	#viewA = 0;
	#viewB = 1;
	#viewASave = 0;
	#selA = 0;
	#selB = 1;
	#ptrFn = null;
	#mapBCR = null;
	#mapPtrgap = 0;
	#mapViewBCR = null;
	#mapViewPtrgap = 0;
	#ptrList = new Map();

	constructor() {
		super( {
			$tagName: "gsui-buffer-view",
			$template: $.$elem( "gsui-bv-in", null,
				$.$elem( "gsui-bv-body", { "data-prop": "body-move" },
					$.$elem( "svg", { viewBox: "0 -128 512 256", preserveAspectRatio: "none" },
						$.$elem( "path" ),
						$.$elem( "path" ),
					),
					$.$elem( "gsui-bv-selection" ),
				),
				$.$elem( "gsui-bv-minimap", { "data-prop": "map-teleport" },
					$.$elem( "svg", { viewBox: "0 -128 512 256", preserveAspectRatio: "none" },
						$.$elem( "path" ),
						$.$elem( "path" ),
					),
					$.$elem( "gsui-bv-selection" ),
					$.$elem( "gsui-bv-minimap-view", { "data-prop": "map-move" },
						$.$div( { "data-prop": "map-start" } ),
						$.$div( { "data-prop": "map-end" } ),
					),
				),
			),
			$elements: {
				$in: "gsui-bv-in",
				$mainSVG: "gsui-bv-body svg",
				$mainPaths: "gsui-bv-body path",
				$minimap: "gsui-bv-minimap",
				$minimapPaths: "gsui-bv-minimap path",
				$minimapView: "gsui-bv-minimap-view",
				$body: "gsui-bv-body",
				$bodySel: "gsui-bv-body gsui-bv-selection",
				$miniSel: "gsui-bv-minimap gsui-bv-selection",
			},
			$attributes: {
				view: "0 .5",
				selection: ".1 .4",
			},
		} );
		this.$this.$on( "wheel", this.#onwheel.bind( this ) );
		this.$elements.$body.$onpinch( this.#onpinch.bind( this ) );
		this.$elements.$in.$on( {
			pointerdown: this.#onptrdown.bind( this ),
			pointermove: this.#onptrmove.bind( this ),
			pointerup: this.#onptrup.bind( this ),
		} );
	}
	static get observedAttributes() {
		return [ "view", "selection" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "view": this.#updateView( val ); break;
			case "selection": this.#updateSelection( val ); break;
		}
	}
	$onmessage( key, val ) {
		switch ( key ) {
			case GSEV_BUFFERVIEW_BUFFER: this.#setBuffer( val ); break;
		}
	}

	// .........................................................................
	#onptrdown( e ) {
		if ( e.button === 0 ) {
			const act = $.$dataProp( e.target );

			this.#ptrList.set( e.pointerId );
			if ( this.#ptrList.size === 1 ) {
				this.#ptrFn = this.#getActionFn( act );
				this.#mapBCR = this.$elements.$minimap.$bcr();
				this.#mapViewBCR = this.$elements.$minimapView.$bcr();
				this.#mapPtrgap = e.pageX - this.#mapBCR.x;
				this.#mapViewPtrgap = e.pageX - this.#mapViewBCR.x;
				this.#viewASave = this.#viewA;
				e.preventDefault();
				$.$setPtrCapture( e.target, e.pointerId );
				this.#ptrFn?.( e.pageX );
				if ( act === "map-move" || act === "body-move" ) {
					$.$css( e.target, "cursor", "var(--gsuiCursor-grabbing)" );
				}
			}
		}
	}
	#onptrmove( e ) {
		if ( this.#ptrList.size === 1 ) {
			this.#ptrFn?.( e.pageX );
		}
	}
	#onptrup( e ) {
		this.#ptrList.delete( e.pointerId );
		$.$relPtrCapture( e.target, e.pointerId );
		if ( !this.#ptrList.size ) {
			this.#ptrFn =
			this.#mapBCR =
			this.#mapViewBCR = null;
			$.$css( e.target, "cursor", "" );
		}
	}

	// .........................................................................
	#setBuffer( buf ) {
		const data = gsuiWaveform.$getPathChans( buf, 512, 256 );

		this.#buf = buf;
		this.$elements.$mainPaths.$setAttr( "d", ( _, i ) => `M${ data[ i ].replaceAll( ",", "L" ) }` );
		this.$elements.$minimapPaths.$setAttr( "d", ( _, i ) => `M${ data[ i ].replaceAll( ",", "L" ) }` );
		this.#updateView( this.$this.$getAttr( "view" ) );
	}
	#updateView( view ) {
		const [ a, b ] = GSUsplitNums( view );
		const a2 = GSUmathClamp( a, 0, 1 );
		const b2 = GSUmathClamp( b, 0, 1 - a2 );

		this.#viewA = a2;
		this.#viewB = b2;
		this.$elements.$minimapView
			.$left( a2 * 100, "%" )
			.$width( b2 * 100, "%" );
		if ( this.#buf ) {
			const dur = this.#buf.duration;
			const data = gsuiWaveform.$getPathChans( this.#buf, 512, 256, a2 * dur, b2 * dur );

			this.$elements.$mainPaths.$setAttr( "d", ( _, i ) => `M${ data[ i ].replaceAll( ",", "L" ) }` );
		}
		this.#updateSelection2();
	}
	#updateSelection( sel ) {
		const [ a, b ] = GSUsplitNums( sel );

		this.#selA = GSUmathClamp( a, 0, 1 );
		this.#selB = GSUmathClamp( b, 0, 1 - this.#selA );
		this.$elements.$miniSel
			.$left( this.#selA * 100, "%" )
			.$width( this.#selB * 100, "%" );
		this.#updateSelection2();
	}
	#updateSelection2() {
		const a = this.#selA;
		const b = this.#selB;
		const a2 = ( a - this.#viewA ) / this.#viewB;
		const b2 = b / this.#viewB;

		this.$elements.$bodySel
			.$left( a2 * 100, "%" )
			.$width( b2 * 100, "%" );
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
		const bcr = this.$this.$bcr();
		const x = ( pageX - bcr.x ) / bcr.w;
		const b = this.#viewB;
		const b2 = b * scale;
		const a = this.#viewA + ( b - b2 ) * x;

		this.$this.$setAttr( "view", `${ a } ${ b2 }` );
	}

	// .........................................................................
	#getActionFn( act ) {
		switch ( act ) {
			case "body-move": return this.#bodyMove;
			case "map-teleport": return this.#minimapTeleport;
			case "map-start": return this.#minimapStart;
			case "map-move": return this.#minimapMove;
			case "map-end": return this.#minimapEnd;
		}
	}
	#setView( a, b ) {
		this.$this.$setAttr( "view", `${ a } ${ b }` );
	}
	#bodyMove( px ) {
		const a = ( px - this.#mapPtrgap - this.#mapBCR.x ) / -( this.#mapBCR.w / this.#viewB );
		const a2 = GSUmathClamp( this.#viewASave + a, 0, 1 - this.#viewB );

		this.#setView( a2, this.#viewB );
	}
	#minimapStart( px ) {
		const a = ( px - this.#mapViewPtrgap - this.#mapBCR.x ) / this.#mapBCR.w;
		const a2 = GSUmathClamp( a, 0, this.#viewA + this.#viewB );
		const b = this.#viewB - ( a2 - this.#viewA );

		this.#setView( a2, b );
	}
	#minimapEnd( px ) {
		const b = ( px - this.#mapViewPtrgap - this.#mapBCR.x + this.#mapViewBCR.w ) / this.#mapBCR.w;
		const b2 = GSUmathClamp( b - this.#viewA, 0, 1 - this.#viewA );

		this.#setView( this.#viewA, b2 );
	}
	#minimapMove( px ) {
		const a = ( px - this.#mapViewPtrgap - this.#mapBCR.x ) / this.#mapBCR.w;
		const a2 = GSUmathClamp( a, 0, 1 - this.#viewB );

		this.#setView( a2, this.#viewB );
	}
	#minimapTeleport( px ) {
		// const a = ( px - this.#mapBCR.x ) / this.#mapBCR.w;
		// const a2 = GSUmathClamp( a - this.#viewB / 2, 0, 1 );

		// this.#setView( a2, this.#viewB );
	}
}

$.$define( "gsui-buffer-view", gsuiBufferView );
