"use strict";

class gsuiBlocksManager {
	$oncreatePreviewBlock = () => $noop;
	#rootElement = null;
	#timeline = $noop;
	#data = {};
	#opts = null;
	#fontSize = 10;
	#pxPerBeat = 10;
	#blockDOMChange = GSUnoop;
	#blcs = new Map();
	#blcsEditing = new Map();
	#blcsSelected = new Map();
	#elSelection = $noop;
	#nlRows = null;
	#status = "";
	#mmFn = null;
	#mdBlc = $noop;
	#mdTarget = $noop;
	#mdPageX = 0;
	#mdPageY = 0;
	#mdWhen = 0;
	#mdRowInd = 0;
	#mmPageX = 0;
	#mmPageY = 0;
	#mmWhen = 0;
	#beatSnap = 0;
	#valueA = 0;
	#valueB = 0;
	#valueAMin = Infinity;
	#valueBMin = Infinity;
	#valueAMax = -Infinity;
	#valueBMax = -Infinity;
	#onptrmvBind = this.#onptrmv.bind( this );
	#onptrupBind = this.#onptrup.bind( this );
	#prevPreview = null;

	constructor( opts ) {
		Object.seal( this );
		this.#rootElement = opts.rootElement;
		this.#timeline = opts.timeline;
		this.#opts = opts;
		this.#opts.oneditBlock = opts.oneditBlock || GSUnoop;
		this.#blockDOMChange = opts.blockDOMChange;
		this.#elSelection = opts.$selectionElement;
		this.#nlRows = opts.rootElement.getElementsByClassName( "gsui-row" );
		opts.rootElement.onkeydown = this.#onkeydown.bind( this );
	}

	// .........................................................................
	$getOpts() { return this.#opts; }
	$setData( data ) { this.#data = data; }
	$setFontSize( px ) { this.#fontSize = px; }
	$setPxPerBeat( px ) { this.#pxPerBeat = px; }
	$getFontSize() { return this.#fontSize; }
	$getPxPerBeat() { return this.#pxPerBeat; }
	$getRows() { return this.#nlRows; }
	$getBlocks() { return this.#blcs; }
	$getSelectedBlocks() { return this.#blcsSelected; }

	// .........................................................................
	$getRowByIndex( ind ) { return this.#nlRows[ ind ]; }
	$getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - $( this.#nlRows[ 0 ] ).$bcr().y ) / this.#fontSize );

		return Math.max( 0, Math.min( ind, this.#nlRows.length - 1 ) );
	}
	$getWhenByPageX( pageX ) {
		return Math.max( 0, ( pageX - $( this.#nlRows[ 0 ] ).$bcr().x ) / this.#pxPerBeat );
	}
	$roundBeat( beat ) {
		return Math.max( 0, this.#timeline.$get( 0 ).$beatFloor( beat ) );
	}

	// .........................................................................
	#dispatch( ...args ) {
		$( this.#rootElement.firstChild ).$dispatch( ...args );
	}
	#getBlc( el ) {
		return $( el ).$closest( ".gsuiBlocksManager-block" );
	}
	#fillBlcsMap( blc ) {
		if ( blc.$hasClass( "gsuiBlocksManager-block-selected" ) ) {
			this.#blcsSelected.forEach( ( blc, id ) => this.#blcsEditing.set( id, blc ) );
		} else {
			this.#blcsEditing.set( blc.$dataId(), blc );
		}
		return this.#blcsEditing;
	}
	#getBeatSnap() {
		const stepsPerBeat = GSUsplitNums( this.#timeline.$getAttr( "timedivision" ), "/" )[ 1 ];

		return 1 / stepsPerBeat * +this.#timeline.$getAttr( "step" );
	}

	// .........................................................................
	#onkeydown( e ) {
		const blcsEditing = this.#blcsEditing;

		switch ( e.key ) {
			case "Delete":
			case "Backspace":
				if ( this.#blcsSelected.size ) {
					this.#blcsSelected.forEach( ( blc, id ) => blcsEditing.set( id, blc ) );
					this.#status = "delete";
					this.#onptrup();
				}
				break;
			case "b": // copy paste
				if ( e.ctrlKey || e.altKey ) {
					if ( this.#blcsSelected.size ) {
						let whenMin = Infinity;
						let whenMax = 0;

						blcsEditing.clear();
						this.#blcsSelected.forEach( ( blc, id ) => {
							const d = this.#data[ id ];

							whenMin = Math.min( whenMin, d.when );
							whenMax = Math.max( whenMax, d.when + d.duration );
							blcsEditing.set( id, blc );
						} );
						whenMax = this.#timeline.$get( 0 ).$beatCeil( whenMax ) - whenMin;
						this.#opts.managercallDuplicating( blcsEditing, whenMax );
						blcsEditing.clear();
					}
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			case "a": // select all
			case "d": // deselect
				if ( e.ctrlKey || e.altKey ) {
					if ( e.key === "d" ) {
						if ( this.#blcsSelected.size > 0 ) {
							this.#opts.managercallUnselecting();
						}
					} else if ( this.#blcs.size > this.#blcsSelected.size ) {
						const ids = [];

						this.#blcs.forEach( ( _blc, id ) => {
							if ( !this.#data[ id ].selected ) {
								ids.push( id );
							}
						} );
						this.#opts.managercallSelecting( ids );
					}
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}

	// .........................................................................
	#getPtrDownFn() {
		switch ( this.#status ) {
			case "create":
			case "move": return this.#onmousedownMove;
			case "cropA": return this.#onmousedownCropA;
			case "cropB": return this.#onmousedownCropB;
		}
	}
	#getPtrMoveFn() {
		switch ( this.#status ) {
			case "create":
			case "move": return this.#onmousemoveMove;
			case "cropA":
			case "cropB": return this.#onmousemoveCrop;
			case "delete": return this.#onmousemoveDelete;
			case "select1": return this.#onmousemoveSelect1;
			case "select2": return this.#onmousemoveSelect2;
		}
	}
	#getPtrUpFn() {
		switch ( this.#status ) {
			case "create":
			case "move": return this.#onmouseupMove;
			case "cropA": return this.#onmouseupCropA;
			case "cropB": return this.#onmouseupCropB;
			case "delete": return this.#onmouseupDelete;
			case "select1": return this.#onmouseupSelect1;
			case "select2": return this.#onmouseupSelect2;
		}
	}

	// .........................................................................
	#stopPreview() {
		if ( this.#prevPreview ) {
			this.#dispatch( GSEV_BLOCKSMANAGER_STOPPREVIEWAUDIO, ...this.#prevPreview );
			this.#prevPreview = null;
		}
	}
	#startPreview() {
		if ( this.#blcsEditing.size === 1 && ( this.#status === "create" || this.#status === "move" ) ) {
			this.#blcsEditing.forEach( ( blc, id ) => {
				const key = +blc.$parent( 2 ).$getAttr( "data-midi" );

				this.#stopPreview();
				this.#prevPreview = [ id, key ];
				this.#dispatch( GSEV_BLOCKSMANAGER_STARTPREVIEWAUDIO, id, key );
			} );
		}
	}

	// .........................................................................
	$onmousedown( e ) {
		const blc = this.#getBlc( e.currentTarget );
		const tar = $( e.target );

		GSUdomUnselect();
		this.#mdBlc = blc;
		this.#mdTarget = tar;
		if ( e.button === 2 ) {
			this.#status = "delete";
			this.#mmFn = this.#getPtrMoveFn();
			if ( blc.$size() ) {
				this.#blockDOMChange( blc, "deleted", true );
				this.#blcsEditing.set( blc.$dataId(), blc );
			}
		} else if ( e.button === 0 ) {
			const mdWhenReal = this.$getWhenByPageX( e.pageX );

			this.#mdPageX = e.pageX;
			this.#mdPageY = e.pageY;
			this.#mdWhen = this.$roundBeat( mdWhenReal );
			this.#mdRowInd = this.$getRowIndexByPageY( e.pageY );
			this.#beatSnap = this.#getBeatSnap();
			if ( e.shiftKey ) {
				this.#status = "select1";
				this.#mmFn = this.#getPtrMoveFn();
			} else {
				const blc2 = blc.$size() ? blc : this.$oncreatePreviewBlock( this.#mdRowInd, this.#mdWhen );

				if ( blc2.$size() ) {
					this.#status = tar.$getAttr( "data-action" ) || "create";

					const fnAct = this.#getPtrDownFn();

					if ( fnAct ) {
						const blcsEditing = this.#fillBlcsMap( blc2 );

						this.#startPreview();
						blc2.$addClass( "gsui-hover" );
						tar.$addClass( "gsui-hover" );
						fnAct.call( this, this.#data, blcsEditing, e );
					}
				}
			}
		}
		tar.$get( 0 ).setPointerCapture( e.pointerId );
		$body.$addEventListener( "pointermove", this.#onptrmvBind )
			.$addEventListener( "pointerup", this.#onptrupBind );
	}
	#onmousedownMove( data, blcsEditing, e ) {
		this.#mmFn = this.#getPtrMoveFn();
		this.#mdRowInd = this.$getRowIndexByPageY( e.pageY );
		blcsEditing.forEach( blc => {
			const valB = blc.$parent( 2 ).$index();

			this.#valueAMin = Math.min( this.#valueAMin, +blc.$getAttr( "data-when" ) );
			this.#valueBMin = Math.min( this.#valueBMin, valB );
			this.#valueBMax = Math.max( this.#valueBMax, valB );
		} );
		this.#valueAMin *= -1;
		this.#valueBMin *= -1;
		this.#valueBMax = this.#nlRows.length - 1 - this.#valueBMax;
	}
	#onmousedownCropA( data, blcsEditing ) {
		this.#mmFn = this.#getPtrMoveFn();
		this.#valueAMin =
		this.#valueAMax = Infinity;
		blcsEditing.forEach( ( _blc, id ) => {
			const dat = data[ id ];

			this.#valueAMin = Math.min( this.#valueAMin, dat.offset );
			this.#valueAMax = Math.min( this.#valueAMax, dat.duration );
		} );
		this.#valueAMin *= -1;
		this.#valueAMax = Math.max( 0, this.#valueAMax - this.#beatSnap );
	}
	#onmousedownCropB( data, blcsEditing ) {
		this.#mmFn = this.#getPtrMoveFn();
		this.#valueAMin =
		this.#valueAMax = Infinity;
		blcsEditing.forEach( ( _blc, id ) => {
			this.#valueAMin = Math.min( this.#valueAMin, data[ id ].duration );
		} );
		this.#valueAMin = -Math.max( 0, this.#valueAMin - this.#beatSnap );
	}

	// .........................................................................
	#onptrmv( e ) {
		if ( this.#mmFn ) {
			if ( e.type === "pointermove" ) {
				this.#mmPageX = e.pageX;
				this.#mmPageY = e.pageY;
			}
			const mmWhenReal = this.$getWhenByPageX( this.#mmPageX );

			this.#mmWhen = this.$roundBeat( mmWhenReal );
			this.#mmFn( e );
		}
	}
	#onmousemoveCrop() {
		const croppingB = this.#status === "cropB";
		const cropBrut = this.#beatSnap * Math.round( ( this.#mmWhen - this.#mdWhen ) / this.#beatSnap );
		const crop = Math.max( this.#valueAMin, Math.min( cropBrut, this.#valueAMax ) );

		if ( crop !== this.#valueA ) {
			this.#valueA = crop;
			this.#blcsEditing.forEach( ( blc, id ) => {
				const blcObj = { ...this.#data[ id ] };

				if ( croppingB ) {
					blcObj.duration += crop;
				} else {
					blcObj.when += crop;
					blcObj.offset += crop;
					blcObj.duration -= crop;
					this.#blockDOMChange( blc, "when", blcObj.when );
				}
				this.#blockDOMChange( blc, "duration", blcObj.duration );
				this.#opts.oneditBlock( id, blcObj, blc );
			} );
		}
	}
	#onmousemoveMove() {
		const when = Math.max( this.#valueAMin,
			Math.round( ( this.#mmWhen - this.#mdWhen ) / this.#beatSnap ) * this.#beatSnap );
		const rows = Math.max( this.#valueBMin, Math.min( this.#valueBMax,
			this.$getRowIndexByPageY( this.#mmPageY ) - this.#mdRowInd ) );

		if ( when !== this.#valueA ) {
			this.#valueA = when;
			this.#blcsEditing.forEach( blc => this.#blockDOMChange( blc, "when", +blc.$getAttr( "data-when" ) + when ) );
		}
		if ( rows !== this.#valueB ) {
			this.#valueB = rows;
			this.#blcsEditing.forEach( blc => this.#blockDOMChange( blc, "row", rows ) );
			this.#startPreview();
		}
	}
	#onmousemoveDelete( e ) {
		const blc = this.#getBlc( e.target );

		if ( blc.$size() && !this.#blcsEditing.has( blc.$dataId() ) ) {
			this.#blockDOMChange( blc, "deleted", true );
			this.#blcsEditing.set( blc.$dataId(), blc );
		}
	}
	#onmousemoveSelect1() {
		if (
			Math.abs( this.#mmPageX - this.#mdPageX ) > 6 ||
			Math.abs( this.#mmPageY - this.#mdPageY ) > 6
		) {
			this.#status = "select2";
			this.#elSelection.$rmClass( "gsuiBlocksManager-selection-hidden" );
			this.#mmFn = this.#getPtrMoveFn();
			this.#mmFn();
		}
	}
	#onmousemoveSelect2() {
		const rowH = this.#fontSize;
		const rowIndB = this.$getRowIndexByPageY( this.#mmPageY );
		const when = Math.min( this.#mdWhen, this.#mmWhen );
		const duration = this.#getBeatSnap() + Math.abs( this.#mdWhen - this.#mmWhen );
		const topRow = Math.min( this.#mdRowInd, rowIndB );
		const bottomRow = Math.max( this.#mdRowInd, rowIndB );
		const rowA = this.$getRowByIndex( topRow );
		const rowB = this.$getRowByIndex( bottomRow );
		const blcs = Object.entries( this.#data ).reduce( ( map, [ id, blc ] ) => {
			if (
				!this.#blcsSelected.has( id ) &&
				blc.when < when + duration &&
				blc.when + blc.duration > when
			) {
				const elBlc = this.#blcs.get( id );
				const pA = rowA.compareDocumentPosition( elBlc.$get( 0 ) );
				const pB = rowB.compareDocumentPosition( elBlc.$get( 0 ) );

				if ( pA & 16 || pB & 16 || ( pA & 4 && pB & 2 ) ) { // 1.
					this.#blockDOMChange( elBlc, "selected", true );
					map.set( id, elBlc );
				}
			}
			return map;
		}, new Map() );

		this.#elSelection.$css( {
			top: `${ topRow * rowH }px`,
			left: `${ when * this.#pxPerBeat }px`,
			width: `${ duration * this.#pxPerBeat }px`,
			height: `${ ( bottomRow - topRow + 1 ) * rowH }px`,
		} );
		this.#blcsEditing.forEach( ( blc, id ) => this.#blockDOMChange( blc, "selected", blcs.has( id ) ) );
		this.#blcsEditing = blcs;
	}

	// .........................................................................
	#onptrup( e ) {
		if ( e ) {
			e.target.releasePointerCapture( e.pointerId );
			$body.$rmEventListener( "pointermove", this.#onptrmvBind )
				.$rmEventListener( "pointerup", this.#onptrupBind );
		}
		if ( this.#status ) {
			this.#getPtrUpFn().call( this, this.#blcsEditing, this.#mdBlc );
		}
		this.#mdBlc.$rmClass( "gsui-hover" );
		this.#mdTarget.$rmClass( "gsui-hover" );
		this.#status = "";
		this.#mmFn = null;
		this.#mdBlc =
		this.#mdTarget = $noop;
		this.#valueA =
		this.#valueB = 0;
		this.#valueAMin =
		this.#valueBMin = Infinity;
		this.#valueAMax =
		this.#valueBMax = -Infinity;
		this.#blcsEditing.clear();
		this.#stopPreview();
	}
	#onmouseupMove( blcsEditing ) {
		switch ( this.#status ) {
			case "move":
				if ( this.#valueB || Math.abs( this.#valueA ) > .000001 ) {
					this.#opts.managercallMoving( blcsEditing, this.#valueA, this.#valueB );
				}
				break;
			case "create": {
				const blc = blcsEditing.get( "preview" );
				const midi = blc.$parent( 2 ).$getAttr( "data-midi" );

				this.#dispatch( GSEV_BLOCKSMANAGER_DELETEPREVIEWBLOCK );
				this.#opts.managercallCreate( {
					midi: +midi,
					when: +blc.$getAttr( "data-when" ) + this.#valueA,
					duration: +blc.$getAttr( "data-duration" ),
				} );
			} break;
		}
	}
	#onmouseupDelete( blcsEditing ) {
		if ( blcsEditing.size || this.#blcsSelected.size ) {
			if ( blcsEditing.has( "preview" ) ) {
				this.#dispatch( GSEV_BLOCKSMANAGER_DELETEPREVIEWBLOCK );
			} else {
				this.#opts.managercallDeleting( blcsEditing );
			}
		}
	}
	#onmouseupCropA( blcsEditing ) {
		if ( Math.abs( this.#valueA ) > .000001 ) {
			this.#opts.managercallCroppingA( blcsEditing, this.#valueA );
		}
	}
	#onmouseupCropB( blcsEditing ) {
		if ( Math.abs( this.#valueA ) > .000001 ) {
			this.#opts.managercallCroppingB( blcsEditing, this.#valueA );
		}
	}
	#onmouseupSelect1( blcsEditing, mdBlc ) {
		if ( mdBlc.$size() ) {
			mdBlc.$hasClass( "gsuiBlocksManager-block-selected" )
				? this.#opts.managercallUnselectingOne( mdBlc.$dataId() )
				: this.#opts.managercallSelecting( [ mdBlc.$dataId() ] );
		}
	}
	#onmouseupSelect2( blcsEditing ) {
		this.#elSelection.$addClass( "gsuiBlocksManager-selection-hidden" );
		if ( blcsEditing.size ) {
			this.#opts.managercallSelecting( Array.from( blcsEditing.keys() ) );
		}
	}
}

Object.freeze( gsuiBlocksManager );

/*
1. constants:
   16 = Node.DOCUMENT_POSITION_CONTAINED_BY
    4 = Node.DOCUMENT_POSITION_FOLLOWING
    2 = Node.DOCUMENT_POSITION_PRECEDING
*/
