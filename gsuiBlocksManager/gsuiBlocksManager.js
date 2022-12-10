"use strict";

class gsuiBlocksManager {
	static #mousedownFns = Object.freeze( {
		move: gsuiBlocksManager.#onmousedownMove,
		cropA: gsuiBlocksManager.#onmousedownCropA,
		cropB: gsuiBlocksManager.#onmousedownCropB,
	} );
	static #mousemoveFns = Object.freeze( {
		crop: gsuiBlocksManager.#onmousemoveCrop,
		move: gsuiBlocksManager.#onmousemoveMove,
		deletion: gsuiBlocksManager.#onmousemoveDeletion,
		selection1: gsuiBlocksManager.#onmousemoveSelection1,
		selection2: gsuiBlocksManager.#onmousemoveSelection2,
	} );
	static #mouseupFns = Object.freeze( {
		moving: gsuiBlocksManager.#onmouseupMoving,
		deleting: gsuiBlocksManager.#onmouseupDeleting,
		"cropping-a": gsuiBlocksManager.#onmouseupCroppingA,
		"cropping-b": gsuiBlocksManager.#onmouseupCroppingB,
		"selecting-1": gsuiBlocksManager.#onmouseupSelecting1,
		"selecting-2": gsuiBlocksManager.#onmouseupSelecting2,
	} );
	rootElement = null;
	timeline = null;
	#data = null;
	#opts = null;
	#fontSize = 10;
	#pxPerBeat = 10;
	#blockDOMChange = null;
	#blcs = new Map();
	#blcsEditing = new Map();
	#blcsSelected = new Map();
	#elSelection = null;
	#nlRows = null;
	#status = "";
	#mmFn = null;
	#mdBlc = null;
	#mdTarget = null;
	#mdPageX = 0;
	#mdPageY = 0;
	#mdWhen = 0;
	#mdRowInd = 0;
	#mmPageX = 0;
	#mmPageY = 0;
	#mmWhen = 0;
	#beatSnap = 0;
	#valueA = null;
	#valueB = null;
	#valueAMin = Infinity;
	#valueBMin = Infinity;
	#valueAMax = -Infinity;
	#valueBMax = -Infinity;
	#onmousemoveBind = this.#onmousemove.bind( this );
	#onmouseupBind = this.#onmouseup.bind( this );

	constructor( opts ) {
		Object.seal( this );

		this.rootElement = opts.rootElement;
		this.timeline = opts.timeline;
		this.#opts = opts;
		this.#opts.oneditBlock = opts.oneditBlock || GSUI.$noop;
		this.#blockDOMChange = opts.blockDOMChange;
		this.#elSelection = opts.selectionElement;
		this.#nlRows = opts.rootElement.getElementsByClassName( "gsui-row" );
		opts.rootElement.onkeydown = this.#onkeydown.bind( this );
	}

	// .........................................................................
	getOpts() { return this.#opts; }
	setData( data ) { this.#data = data; }
	setFontSize( px ) { this.#fontSize = px; }
	setPxPerBeat( px ) { this.#pxPerBeat = px; }
	getFontSize() { return this.#fontSize; }
	getPxPerBeat() { return this.#pxPerBeat; }
	getRows() { return this.#nlRows; }
	getBlocks() { return this.#blcs; }
	getSelectedBlocks() { return this.#blcsSelected; }

	// .........................................................................
	#getRow0BCR() { return this.#nlRows[ 0 ].getBoundingClientRect(); }
	getRowByIndex( ind ) { return this.#nlRows[ ind ]; }
	getRowIndexByRow( row ) { return Array.prototype.indexOf.call( this.#nlRows, row ); }
	getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - this.#getRow0BCR().top ) / this.#fontSize );

		return Math.max( 0, Math.min( ind, this.#nlRows.length - 1 ) );
	}
	getWhenByPageX( pageX ) {
		return Math.max( 0, ( pageX - this.#getRow0BCR().left ) / this.#pxPerBeat );
	}
	roundBeat( beat ) {
		return Math.max( 0, this.timeline.beatFloor( beat ) );
	}

	// .........................................................................
	#isBlc( el ) {
		return el.classList.contains( "gsuiBlocksManager-block" );
	}
	#getBlc( el ) {
		if ( this.#isBlc( el ) ) {
			return el;
		} else if ( this.#isBlc( el.parentNode ) ) {
			return el.parentNode;
		} else if ( this.#isBlc( el.parentNode.parentNode ) ) {
			return el.parentNode.parentNode;
		}
	}
	#fillBlcsMap( blc ) {
		if ( blc.classList.contains( "gsuiBlocksManager-block-selected" ) ) {
			this.#blcsSelected.forEach( ( blc, id ) => this.#blcsEditing.set( id, blc ) );
		} else {
			this.#blcsEditing.set( blc.dataset.id, blc );
		}
		return this.#blcsEditing;
	}
	#getBeatSnap() {
		return 1 / this.timeline.stepsPerBeat * GSUI.$getAttributeNum( this.timeline, "step" );
	}

	// .........................................................................
	#onkeydown( e ) {
		const blcsEditing = this.#blcsEditing;

		switch ( e.key ) {
			case "Delete":
			case "Backspace":
				if ( this.#blcsSelected.size ) {
					this.#blcsSelected.forEach( ( blc, id ) => blcsEditing.set( id, blc ) );
					this.#status = "deleting";
					this.#onmouseup();
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
						whenMax = this.timeline.beatCeil( whenMax ) - whenMin;
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

						this.#blcs.forEach( ( blc, id ) => {
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
	onmousedown( e ) {
		const blc = this.#getBlc( e.currentTarget );

		GSUI.$unselectText();
		this.#mdBlc = blc;
		this.#mdTarget = e.target;
		if ( e.button === 2 ) {
			this.#mmFn = gsuiBlocksManager.#mousemoveFns.deletion;
			this.#status = "deleting";
			if ( blc ) {
				this.#blockDOMChange( blc, "deleted", true );
				this.#blcsEditing.set( blc.dataset.id, blc );
			}
		} else if ( e.button === 0 ) {
			const mdWhenReal = this.getWhenByPageX( e.pageX );

			this.#mdPageX = e.pageX;
			this.#mdPageY = e.pageY;
			this.#mdWhen = this.roundBeat( mdWhenReal );
			this.#beatSnap = this.#getBeatSnap();
			if ( e.shiftKey ) {
				this.#mmFn = gsuiBlocksManager.#mousemoveFns.selection1;
				this.#status = "selecting-1";
				this.#mdRowInd = this.getRowIndexByPageY( e.pageY );
			} else if ( blc ) {
				const fnAct = gsuiBlocksManager.#mousedownFns[ e.target.dataset.action ];

				if ( fnAct ) {
					const blcsEditing = this.#fillBlcsMap( blc );

					blc.classList.add( "gsui-hover" );
					e.target.classList.add( "gsui-hover" );
					fnAct.call( this, this.#data, blcsEditing, blc, e );
				}
			}
		}
		document.addEventListener( "mousemove", this.#onmousemoveBind );
		document.addEventListener( "mouseup", this.#onmouseupBind );
	}
	static #onmousedownMove( data, blcsEditing, _blc, e ) {
		this.#mmFn = gsuiBlocksManager.#mousemoveFns.move;
		this.#status = "moving";
		this.#mdRowInd = this.getRowIndexByPageY( e.pageY );
		blcsEditing.forEach( ( blc, id ) => {
			const valB = this.getRowIndexByRow( blc.parentNode.parentNode );

			this.#valueAMin = Math.min( this.#valueAMin, data[ id ].when );
			this.#valueBMin = Math.min( this.#valueBMin, valB );
			this.#valueBMax = Math.max( this.#valueBMax, valB );
		} );
		this.#valueAMin *= -1;
		this.#valueBMin *= -1;
		this.#valueBMax = this.#nlRows.length - 1 - this.#valueBMax;
	}
	static #onmousedownCropA( data, blcsEditing ) {
		this.#mmFn = gsuiBlocksManager.#mousemoveFns.crop;
		this.#status = "cropping-a";
		this.#valueAMin =
		this.#valueAMax = Infinity;
		blcsEditing.forEach( ( blc, id ) => {
			const dat = data[ id ];

			this.#valueAMin = Math.min( this.#valueAMin, dat.offset );
			this.#valueAMax = Math.min( this.#valueAMax, dat.duration );
		} );
		this.#valueAMin *= -1;
		this.#valueAMax = Math.max( 0, this.#valueAMax - this.#beatSnap );
	}
	static #onmousedownCropB( data, blcsEditing ) {
		this.#mmFn = gsuiBlocksManager.#mousemoveFns.crop;
		this.#status = "cropping-b";
		this.#valueAMin =
		this.#valueAMax = Infinity;
		blcsEditing.forEach( ( blc, id ) => {
			this.#valueAMin = Math.min( this.#valueAMin, data[ id ].duration );
		} );
		this.#valueAMin = -Math.max( 0, this.#valueAMin - this.#beatSnap );
	}

	// .........................................................................
	#onmousemove( e ) {
		if ( this.#mmFn ) {
			if ( e.type === "mousemove" ) {
				this.#mmPageX = e.pageX;
				this.#mmPageY = e.pageY;
			}
			const mmWhenReal = this.getWhenByPageX( this.#mmPageX );

			this.#mmWhen = this.roundBeat( mmWhenReal );
			this.#mmFn( e );
		}
	}
	static #onmousemoveCrop() {
		const croppingB = this.#status === "cropping-b";
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
	static #onmousemoveMove() {
		const when = Math.max( this.#valueAMin,
			Math.round( ( this.#mmWhen - this.#mdWhen ) / this.#beatSnap ) * this.#beatSnap );
		const rows = Math.max( this.#valueBMin, Math.min( this.#valueBMax,
			this.getRowIndexByPageY( this.#mmPageY ) - this.#mdRowInd ) );

		if ( when !== this.#valueA ) {
			this.#valueA = when;
			this.#blcsEditing.forEach( ( blc, id ) => this.#blockDOMChange( blc, "when", this.#data[ id ].when + when ) );
		}
		if ( rows !== this.#valueB ) {
			this.#valueB = rows;
			this.#blcsEditing.forEach( blc => this.#blockDOMChange( blc, "row", rows ) );
		}
	}
	static #onmousemoveDeletion( e ) {
		const blc = this.#getBlc( e.target );

		if ( blc && !this.#blcsEditing.has( blc.dataset.id ) ) {
			this.#blockDOMChange( blc, "deleted", true );
			this.#blcsEditing.set( blc.dataset.id, blc );
		}
	}
	static #onmousemoveSelection1() {
		if ( Math.abs( this.#mmPageX - this.#mdPageX ) > 6 ||
			Math.abs( this.#mmPageY - this.#mdPageY ) > 6
		) {
			this.#status = "selecting-2";
			this.#elSelection.classList.remove( "gsuiBlocksManager-selection-hidden" );
			this.#mmFn = gsuiBlocksManager.#mousemoveFns.selection2;
			this.#mmFn();
		}
	}
	static #onmousemoveSelection2() {
		const rowH = this.#fontSize;
		const st = this.#elSelection.style;
		const rowIndB = this.getRowIndexByPageY( this.#mmPageY );
		const when = Math.min( this.#mdWhen, this.#mmWhen );
		const duration = this.#getBeatSnap() + Math.abs( this.#mdWhen - this.#mmWhen );
		const topRow = Math.min( this.#mdRowInd, rowIndB );
		const bottomRow = Math.max( this.#mdRowInd, rowIndB );
		const rowA = this.getRowByIndex( topRow );
		const rowB = this.getRowByIndex( bottomRow );
		const blcs = Object.entries( this.#data ).reduce( ( map, [ id, blc ] ) => {
			if ( !this.#blcsSelected.has( id ) &&
					blc.when < when + duration &&
					blc.when + blc.duration > when
			) {
				const elBlc = this.#blcs.get( id );
				const pA = rowA.compareDocumentPosition( elBlc );
				const pB = rowB.compareDocumentPosition( elBlc );

				if ( pA & Node.DOCUMENT_POSITION_CONTAINED_BY ||
						pB & Node.DOCUMENT_POSITION_CONTAINED_BY || (
					pA & Node.DOCUMENT_POSITION_FOLLOWING &&
						pB & Node.DOCUMENT_POSITION_PRECEDING )
				) {
					this.#blockDOMChange( elBlc, "selected", true );
					map.set( id, elBlc );
				}
			}
			return map;
		}, new Map() );

		st.top = `${ topRow * rowH }px`;
		st.left = `${ when * this.#pxPerBeat }px`;
		st.width = `${ duration * this.#pxPerBeat }px`;
		st.height = `${ ( bottomRow - topRow + 1 ) * rowH }px`;
		this.#blcsEditing.forEach( ( blc, id ) => this.#blockDOMChange( blc, "selected", blcs.has( id ) ) );
		this.#blcsEditing = blcs;
	}

	// .........................................................................
	#onmouseup() {
		if ( this.#status ) {
			gsuiBlocksManager.#mouseupFns[ this.#status ].call( this, this.#blcsEditing, this.#mdBlc );
		}
		if ( this.#mdBlc ) {
			this.#mdBlc.classList.remove( "gsui-hover" );
			this.#mdTarget.classList.remove( "gsui-hover" );
		}
		this.#status = "";
		this.#mmFn =
		this.#mdBlc =
		this.#mdTarget = null;
		this.#valueA =
		this.#valueB = null;
		this.#valueAMin =
		this.#valueBMin = Infinity;
		this.#valueAMax =
		this.#valueBMax = -Infinity;
		this.#blcsEditing.clear();
		document.removeEventListener( "mousemove", this.#onmousemoveBind );
		document.removeEventListener( "mouseup", this.#onmouseupBind );
	}
	static #onmouseupMoving( blcsEditing ) {
		if ( this.#valueB || Math.abs( this.#valueA ) > .000001 ) {
			this.#opts.managercallMoving( blcsEditing, this.#valueA, this.#valueB );
		}
	}
	static #onmouseupDeleting( blcsEditing ) {
		if ( blcsEditing.size || this.#blcsSelected.size ) {
			this.#opts.managercallDeleting( blcsEditing );
		}
	}
	static #onmouseupCroppingA( blcsEditing ) {
		if ( Math.abs( this.#valueA ) > .000001 ) {
			this.#opts.managercallCroppingA( blcsEditing, this.#valueA );
		}
	}
	static #onmouseupCroppingB( blcsEditing ) {
		if ( Math.abs( this.#valueA ) > .000001 ) {
			this.#opts.managercallCroppingB( blcsEditing, this.#valueA );
		}
	}
	static #onmouseupSelecting1( blcsEditing, mdBlc ) {
		if ( mdBlc ) {
			mdBlc.classList.contains( "gsuiBlocksManager-block-selected" )
				? this.#opts.managercallUnselectingOne( mdBlc.dataset.id )
				: this.#opts.managercallSelecting( [ mdBlc.dataset.id ] );
		}
	}
	static #onmouseupSelecting2( blcsEditing ) {
		this.#elSelection.classList.add( "gsuiBlocksManager-selection-hidden" );
		if ( blcsEditing.size ) {
			this.#opts.managercallSelecting( Array.from( blcsEditing.keys() ) );
		}
	}
}

Object.freeze( gsuiBlocksManager );
