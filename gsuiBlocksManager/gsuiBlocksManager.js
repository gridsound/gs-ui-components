"use strict";

class gsuiBlocksManager {
	constructor( opts ) {
		const root = opts.rootElement;

		this.rootElement = root;
		this.timeline = opts.timeline;
		this._data = null;
		this._opts = opts;
		this._opts.oneditBlock = opts.oneditBlock || GSUI.noop;
		this._blockDOMChange = opts.blockDOMChange;
		this.__fontSize =
		this.__pxPerBeat = 10;
		this.__blcs = new Map();
		this.__blcsEditing = new Map();
		this.__blcsSelected = new Map();
		this.__selection = opts.selectionElement;
		this.__rows = root.getElementsByClassName( "gsui-row" );

		root.onkeydown = this.__keydown.bind( this );
		this.__eventReset();
	}

	// ............................................................................................
	setData( data ) {
		this._data = data;
	}

	// ............................................................................................
	__getRow0BCR() { return this.__rows[ 0 ].getBoundingClientRect(); }
	__getRowByIndex( ind ) { return this.__rows[ ind ]; }
	__getRowIndexByRow( row ) { return Array.prototype.indexOf.call( this.__rows, row ); }
	__getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - this.__getRow0BCR().top ) / this.__fontSize );

		return Math.max( 0, Math.min( ind, this.__rows.length - 1 ) );
	}
	__getWhenByPageX( pageX ) {
		return Math.max( 0, ( pageX - this.__getRow0BCR().left ) / this.__pxPerBeat );
	}
	__roundBeat( beat ) {
		return Math.max( 0, this.timeline.beatFloor( beat ) );
	}

	// ............................................................................................
	__isBlc( el ) {
		return el.classList.contains( "gsuiBlocksManager-block" );
	}
	__getBlc( el ) {
		if ( this.__isBlc( el ) ) {
			return el;
		} else if ( this.__isBlc( el.parentNode ) ) {
			return el.parentNode;
		} else if ( this.__isBlc( el.parentNode.parentNode ) ) {
			return el.parentNode.parentNode;
		}
	}
	__fillBlcsMap( blc ) {
		const blcs = this.__blcsEditing;

		if ( blc.classList.contains( "gsuiBlocksManager-block-selected" ) ) {
			this.__blcsSelected.forEach( ( blc, id ) => blcs.set( id, blc ) );
		} else {
			blcs.set( blc.dataset.id, blc );
		}
		return blcs;
	}
	__unselectBlocks( obj ) {
		this.__blcsSelected.forEach( ( blc, id ) => {
			if ( !( id in obj ) ) {
				this._data[ id ].selected = false;
				obj[ id ] = { selected: false };
			}
		} );
		return obj;
	}
	__getBeatSnap() {
		return 1 / this.timeline.stepsPerBeat * this.timeline.getAttribute( "step" );
	}
	__eventReset() {
		this.__mmFn =
		this.__valueA =
		this.__valueB = null;
		this.__valueAMin =
		this.__valueBMin = Infinity;
		this.__valueAMax =
		this.__valueBMax = -Infinity;
		this.__status = "";
		this.__blcsEditing.clear();
	}

	// ............................................................................................
	__keydown( e ) {
		const blcsEditing = this.__blcsEditing;

		switch ( e.key ) {
			case "Delete":
				if ( this.__blcsSelected.size ) {
					this.__blcsSelected.forEach( ( blc, id ) => blcsEditing.set( id, blc ) );
					this.__status = "deleting";
					this.__mouseup();
				}
				break;
			case "b": // copy paste
				if ( e.ctrlKey || e.altKey ) {
					if ( this.__blcsSelected.size ) {
						let whenMin = Infinity,
							whenMax = 0;

						blcsEditing.clear();
						this.__blcsSelected.forEach( ( blc, id ) => {
							const d = this._data[ id ];

							whenMin = Math.min( whenMin, d.when );
							whenMax = Math.max( whenMax, d.when + d.duration );
							blcsEditing.set( id, blc );
						} );
						whenMax = this.timeline.beatCeil( whenMax ) - whenMin;
						this._opts.managercallDuplicating( blcsEditing, whenMax );
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
						if ( this.__blcsSelected.size > 0 ) {
							this._opts.managercallUnselecting();
						}
					} else if ( this.__blcs.size > this.__blcsSelected.size ) {
						const ids = [];

						this.__blcs.forEach( ( blc, id ) => {
							if ( !this._data[ id ].selected ) {
								ids.push( id );
							}
						} );
						this._opts.managercallSelecting( ids );
					}
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
}

document.addEventListener( "mousemove", e => {
	if ( gsuiBlocksManager._focused ) {
		gsuiBlocksManager._focused.__mousemove( e );
	}
} );
document.addEventListener( "mouseup", e => {
	if ( gsuiBlocksManager._focused ) {
		if ( gsuiBlocksManager._focused._opts.mouseup ) {
			gsuiBlocksManager._focused._opts.mouseup( e );
		}
		gsuiBlocksManager._focused.__mouseup( e );
	}
} );
