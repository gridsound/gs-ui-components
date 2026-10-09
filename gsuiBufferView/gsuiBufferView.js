"use strict";

class gsuiBufferView extends gsui0ne {
	#buf = null;
	#viewA = 0;
	#viewB = 1;
	#selA = 0;
	#selB = 1;
	#viewPtrgap = 0;
	#ptrFn = null;
	#mapBCR = null;
	#mapViewBCR = null;

	constructor() {
		super( {
			$tagName: "gsui-buffer-view",
			$template: $.$elem( "gsui-bv-in", null,
				$.$elem( "gsui-bv-body", null,
					$.$elem( "gsui-bv-selection" ),
					$.$elem( "svg", { viewBox: "0 -128 512 256", preserveAspectRatio: "none" },
						$.$elem( "g", null,
							$.$elem( "path" ),
							$.$elem( "path" ),
						),
					),
				),
				$.$elem( "gsui-bv-minimap", { "data-prop": "teleport" },
					$.$elem( "gsui-bv-selection" ),
					$.$elem( "svg", { viewBox: "0 -128 512 256", preserveAspectRatio: "none" },
						$.$elem( "path" ),
						$.$elem( "path" ),
					),
					$.$elem( "gsui-bv-minimap-view", { "data-prop": "move" },
						$.$div( { "data-prop": "start" } ),
						$.$div( { "data-prop": "end" } ),
					),
				),
			),
			$elements: {
				$mainSVG: "gsui-bv-body svg",
				$mainPaths: "gsui-bv-body path",
				$minimap: "gsui-bv-minimap",
				$minimapPaths: "gsui-bv-minimap path",
				$minimapView: "gsui-bv-minimap-view",
				$bodySel: "gsui-bv-body gsui-bv-selection",
				$miniSel: "gsui-bv-minimap gsui-bv-selection",
			},
			$attributes: {
				view: "0 .5",
				selection: ".1 .4",
			},
		} );
		this.$this.$on( "wheel", this.#onwheel.bind( this ) );
		this.$elements.$minimap.$on( {
			pointerdown: e => {
				const act = $.$dataProp( e.target );

				this.#ptrFn = this.#getActionFn( act );
				this.#mapBCR = this.$elements.$minimap.$bcr();
				this.#mapViewBCR = this.$elements.$minimapView.$bcr();
				this.#viewPtrgap = e.pageX - this.#mapViewBCR.x;
				e.preventDefault();
				$.$setPtrCapture( e.target, e.pointerId );
				this.#ptrFn?.( e.pageX );
			},
			pointermove: e => {
				this.#ptrFn?.( e.pageX );
			},
			pointerup: e => {
				this.#ptrFn =
				this.#mapBCR =
				this.#mapViewBCR = null;
				$.$relPtrCapture( e.target, e.pointerId );
			},
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
	#onwheel( e ) {
		const dlt = gsuiBufferView.#getWheelDelta( -e.deltaY );
		const bcr = this.$this.$bcr();
		const x = ( e.pageX - bcr.x ) / bcr.w;
		const b = this.#viewB;
		const b2 = b * dlt;
		const a = this.#viewA + ( b - b2 ) * x;

		e.preventDefault();
		this.$this.$setAttr( "view", `${ a } ${ b2 }` );
	}
	static #getWheelDelta( d ) {
		let inc = 1.1;

		if ( -50 < d && d < 50 ) {
			inc = 1 + Math.abs( d ) / 100;
		}
		return d > 0 ? 1 / inc : inc;
	}

	// .........................................................................
	#getActionFn( act ) {
		switch ( act ) {
			case "teleport": return this.#minimapTeleport;
			case "start": return this.#minimapStart;
			case "move": return this.#minimapMove;
			case "end": return this.#minimapEnd;
		}
	}
	#setView( a, b ) {
		this.$this.$setAttr( "view", `${ GSUmathRound( a, .001 ) } ${ GSUmathRound( b, .001 ) }` );
	}
	#minimapStart( px ) {
		const a = ( px - this.#viewPtrgap - this.#mapBCR.x ) / this.#mapBCR.w;
		const a2 = GSUmathClamp( a, 0, this.#viewA + this.#viewB );
		const b = this.#viewB - ( a2 - this.#viewA );

		this.#setView( a2, b );
	}
	#minimapEnd( px ) {
		const b = ( px - this.#viewPtrgap - this.#mapBCR.x + this.#mapViewBCR.w ) / this.#mapBCR.w;
		const b2 = GSUmathClamp( b - this.#viewA, 0, 1 - this.#viewA );

		this.#setView( this.#viewA, b2 );
	}
	#minimapMove( px ) {
		const a = ( px - this.#viewPtrgap - this.#mapBCR.x ) / this.#mapBCR.w;
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
