"use strict";

class gsuiBlocksManager {
	constructor( root ) {
		this.__fontSize = 16;
		this.__pxPerBeat = 64;
		this.__blcs = new Map();
		this.__blcsEditing = new Map();
		this.__blcsSelected = new Map();
		this.__selection = root.querySelector( ".gsuiBlocksManager-selection" );
		this.__panelContent = root.querySelector( ".gsuiBlocksManager-panelContent" );
		this.__rowsContainer = root.querySelector( ".gsuiBlocksManager-rows" );
		this.__rows = this.__rowsContainer.getElementsByClassName( "gsui-row" );

		this.__uiTimeline = new gsuiTimeline();
		this.__uiBeatlines = new gsuiBeatlines();
		this.__uiTimeline.oninputLoop = ( isLoop, a, b ) => this.__uiBeatlines.loop( isLoop && a, b );
		this.__uiTimeline.onchangeLoop = ( isLoop, a, b ) => this.onchangeLoop( isLoop, a, b );
		this.__uiTimeline.onchangeCurrentTime = t => {
			this.__uiBeatlines.currentTime( t );
			this.onchangeCurrentTime( t );
		};
		root.querySelector( ".gsuiBlocksManager-timelineWrap" ).append( this.__uiTimeline.rootElement );
		root.querySelector( ".gsuiBlocksManager-beatlinesWrap" ).append( this.__uiBeatlines.rootElement );
	}

	// Public methods
	// ............................................................................................
	currentTime( beat ) {
		this.__uiTimeline.currentTime( beat );
		this.__uiBeatlines.currentTime( beat );
	}
	timeSignature( a, b ) {
		this.__uiTimeline.timeSignature( a, b );
		this.__uiBeatlines.timeSignature( a, b );
	}
	loop( a, b ) {
		this.__uiTimeline.loop( a, b );
		this.__uiBeatlines.loop( a, b );
	}
	setPxPerBeat( px ) {
		const ppb = Math.round( Math.min( Math.max( 8, px ) ), 512 );

		if ( ppb !== this.__pxPerBeat ) {
			this.__pxPerBeat = ppb;
			this.__uiTimeline.offset( this._.offset, ppb );
			this.__uiBeatlines.offset( this._.offset, ppb );
			Array.from( this.__rows ).forEach( el => el.firstChild.style.fontSize = ppb + "px" );
		}
		return ppb;
	}
	setFontSize( px ) {
		const fs = Math.min( Math.max( 8, px ), 64 );

		if ( fs !== this.__fontSize ) {
			this.__fontSize = fs;
			this.__panelContent.style.fontSize =
			this.__rowsContainer.style.fontSize = fs + "px";
		}
		return px;
	}

	// Private util methods
	// ............................................................................................
	__getBlc( el ) {
		if ( el.classList.contains( "gsui-block" ) ) {
			return el;
		} else if ( el.parentNode.classList.contains( "gsui-block" ) ) {
			return el.parentNode;
		}
	}
	__fillBlcsMap( blc ) {
		const blcs = this.__blcsEditing;

		if ( blc.classList.contains( "gsui-block-selected" ) ) {
			this.__blcsSelected.forEach( ( blc, id ) => blcs.set( id, blc ) );
		} else {
			blcs.set( blc.dataset.id, blc );
		}
		return blcs;
	}
	__getBeatSnap() {
		return 1 / this.__uiTimeline._.stepsPerBeat * this.__uiTimeline.stepRound;
	}

	// Events to call manually
	// ............................................................................................
	__mousemove( e ) {
		if ( this.__mmFn ) {
			if ( e.type === "mousemove" ) {
				this.__mmPageX = e.pageX;
				this.__mmPageY = e.pageY;
			}
			this.__mmWhen = this.getWhenByPageX( this.__mmPageX );
			this.__mmFn.call( this, e );
		}
	}
	__mousedown( e ) {
		const blc = this.__getBlc( e.currentTarget );

		if ( e.button === 2 ) {
			this.__mmFn = this.__mousemove_deletion;
			this.__status = "deleting";
			if ( blc ) {
				this.blcDeleted( blc, true );
				this.__blcsEditing.set( blc.dataset.id, blc );
			}
		} else if ( e.button === 0 ) {
			this.__mdPageX = e.pageX;
			this.__mdPageY = e.pageY;
			this.__mdWhen = this.getWhenByPageX( e.pageX );
			this.__beatSnap = this.__getBeatSnap();
			if ( e.shiftKey ) {
				this.__mmFn = this.__mousemove_selection1;
				this.__status = "selecting-1";
				this.__mdCurrTar = blc;
				this.__mdRowInd = this.getRowIndexByPageY( e.pageY );
			} else if ( blc ) {
				const data = this.getData(),
					blcsEditing = this.__fillBlcsMap( blc );

				if ( e.target.classList.contains( "gsui-block-crop" ) ) {
					this.__mmFn = this.__mousemove_crop;
					this.__valueAMin = Infinity;
					blcsEditing.forEach( ( blc, id ) => (
						this.__valueAMin = Math.min( this.__valueAMin, data[ id ].duration )
					) );
					this.__valueAMin = -Math.max( 0, this.__valueAMin - this.__beatSnap );
					this.__status = e.target.classList.contains( "gsui-block-cropA" )
						? "cropping-a"
						: "cropping-b";
				} else {
					this.__mmFn = this.__mousemove_move;
					this.__status = "moving";
					this.__mdRowInd = this.getRowIndexByPageY( e.pageY );
					blcsEditing.forEach( ( blc, id ) => {
						const valB = this.getRowIndexByRow( blc.parentNode.parentNode );

						this.__valueAMin = Math.min( this.__valueAMin, data[ id ].when );
						this.__valueBMin = Math.min( this.__valueBMin, valB );
						this.__valueBMax = Math.max( this.__valueBMax, valB );
					} );
					this.__valueAMin *= -1;
					this.__valueBMin *= -1;
					this.__valueBMax = this.__rows.length - 1 - this.__valueBMax;
				}
			}
		}
	}
	__mouseup() {
		const blcsEditing = this.__blcsEditing;

		switch ( this.__status ) {
			case "deleting":
				if ( blcsEditing.size || this.__blcsSelected.size ) {
					this.blcsManagerCallback( "deleting", blcsEditing );
				}
				break;
			case "moving":
				if ( Math.abs( this.__valueA ) > .000001 || this.__valueB ) {
					this.blcsManagerCallback( "moving", blcsEditing, this.__valueA, this.__valueB );
				}
				break;
			case "cropping-a":
			case "cropping-b":
				if ( Math.abs( this.__valueA ) > .000001 ) {
					this.blcsManagerCallback( this.__status, blcsEditing, this.__valueA );
				}
				break;
			case "selecting-2":
				this.__selection.classList.add( "gsuiBlocksManager-selection-hidden" );
			case "selecting-1":
				if ( this.__status === "selecting-1" && this.__mdCurrTar ) {
					const blc = this.__getBlc( this.__mdCurrTar );

					if ( blc ) {
						blcsEditing.set( blc.dataset.id, blc );
					}
				}
				if ( blcsEditing.size ) {
					this.blcsManagerCallback( "selecting", blcsEditing );
				}
				break;
		}
		this.__mmFn =
		this.__valueA =
		this.__valueB = null;
		this.__valueAMin =
		this.__valueBMin = Infinity;
		this.__valueBMax = -Infinity;
		this.__status = "";
		blcsEditing.clear();
	}

	// Mousemove specific functions
	// ............................................................................................
	__mousemove_crop() {
		const crop = Math.max( this.__valueAMin, Math.round(
				( this.__mmWhen - this.__mdWhen ) / this.__beatSnap ) * this.__beatSnap );

		if ( crop !== this.__valueA ) {
			const data = this.getData();

			this.__valueA = crop;
			this.__blcsEditing.forEach( this.__status === "cropping-a"
				? ( blc, id ) => {
					this.blcOffset( blc, data[ id ].offset - crop );
					this.blcDuration( blc, data[ id ].duration + crop );
				}
				: ( blc, id ) => {
					this.blcDuration( blc, data[ id ].duration + crop );
				} );
		}
	}
	__mousemove_move() {
		const data = this.getData(),
			when = Math.max( this.__valueAMin,
				Math.round( ( this.__mmWhen - this.__mdWhen ) / this.__beatSnap ) * this.__beatSnap ),
			rows = Math.max( this.__valueBMin, Math.min( this.__valueBMax,
				this.getRowIndexByPageY( this.__mmPageY ) - this.__mdRowInd ) );

		if ( when !== this.__valueA ) {
			this.__valueA = when;
			this.__blcsEditing.forEach( ( blc, id ) => this.blcWhen( blc, data[ id ].when + when ) );
		}
		if ( rows !== this.__valueB ) {
			this.__valueB = rows;
			this.__blcsEditing.forEach( ( blc, id ) => this.blcRow( blc, rows ) );
		}
	}
	__mousemove_deletion( e ) {
		const blc = this.__getBlc( e.target );

		if ( blc && !this.__blcsEditing.has( blc.dataset.id ) ) {
			this.blcDeleted( blc, true );
			this.__blcsEditing.set( blc.dataset.id, blc );
		}
	}
	__mousemove_selection1() {
		if ( Math.abs( this.__mmPageX - this.__mdPageX ) > 6 ||
			Math.abs( this.__mmPageY - this.__mdPageY ) > 6
		) {
			this.__status = "selecting-2";
			this.__mmFn = this.__mousemove_selection2;
			this.__selection.classList.remove( "gsuiBlocksManager-selection-hidden" );
			this.__mousemove_selection2();
		}
	}
	__mousemove_selection2() {
		const rowH = this.__fontSize,
			st = this.__selection.style,
			rowIndB = this.getRowIndexByPageY( this.__mmPageY ),
			when = Math.min( this.__mdWhen, this.__mmWhen ),
			duration = this.__getBeatSnap() + Math.abs( this.__mdWhen - this.__mmWhen ),
			topRow = Math.min( this.__mdRowInd, rowIndB ),
			bottomRow = Math.max( this.__mdRowInd, rowIndB ),
			rowA = this.getRowByIndex( topRow ),
			rowB = this.getRowByIndex( bottomRow ),
			blcs = Object.entries( this.getData() )
				.reduce( ( map, [ id, blc ] ) => {
					if ( !this.__blcsSelected.has( id ) &&
						blc.when < when + duration &&
						blc.when + blc.duration > when
					) {
						const elBlc = this.__blcs.get( id ),
							pA = rowA.compareDocumentPosition( elBlc ),
							pB = rowB.compareDocumentPosition( elBlc );

						if ( pA & Node.DOCUMENT_POSITION_CONTAINED_BY ||
							pB & Node.DOCUMENT_POSITION_CONTAINED_BY || (
							pA & Node.DOCUMENT_POSITION_FOLLOWING &&
							pB & Node.DOCUMENT_POSITION_PRECEDING )
						) {
							this.blcSelected( elBlc, true );
							map.set( id, elBlc );
						}
					}
					return map;
				}, new Map );

		st.top = topRow * rowH + "px";
		st.left = when * this.__pxPerBeat + "px";
		st.width = duration * this.__pxPerBeat + "px";
		st.height = ( bottomRow - topRow + 1 ) * rowH + "px";
		this.__blcsEditing.forEach( ( blc, id ) => this.blcSelected( blc, blcs.has( id ) ) );
		this.__blcsEditing = blcs;
	}
}