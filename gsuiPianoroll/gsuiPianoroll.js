"use strict";

class gsuiPianoroll {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			elRows = root.querySelector( ".gsuiPianoroll-rows" ),
			elPanKeys = root.querySelector( ".gsuiPianoroll-pan-keys" ),
			elPanGrid = root.querySelector( ".gsuiPianoroll-pan-grid" ),
			elKeys = root.querySelector( ".gsuiPianoroll-keys" ),
			uiPanels = new gsuiPanels( root ),
			uiKeys = new gsuiKeys(),
			uiKeysRoot = uiKeys.rootElement,
			uiTimeline = new gsuiTimeline(),
			uiBeatlines = new gsuiBeatlines();

		this.rootElement = root;
		this.uiKeys = uiKeys;
		this.data = this._proxyCreate();
		this._ = Object.seal( {
			elKeys,
			elRows,
			uiPanels,
			elPanKeys,
			elPanGrid,
			uiTimeline,
			uiKeysRoot,
			uiBeatlines,
			idMax: 1,
			offset: 0,
			nlRows: elRows.getElementsByClassName( "gsui-row" ),
			fontSize: 16,
			pxPerBeat: 64,
			elPanGridWidth: 0,
			currKeyDuration: 1,
			elRowsScrollTop: -1,
			elRowsScrollLeft: -1,
			keyBlc: new Map(),
			rowsByMidi: {},
			keyBlcSelected: new Map(),
		} );
		this.blcsEdition = new gsuiBlocksEdition( this,
			this._blcsManagerCallback.bind( this ),
			root.querySelector( ".gsuiBlocksEdition-selection" ) );
		this.onchange =
		this.onchangeLoop =
		this.onchangeCurrentTime = () => {};
		uiTimeline.oninputLoop = ( isLoop, a, b ) => uiBeatlines.loop( isLoop && a, b );
		uiTimeline.onchangeLoop = ( isLoop, a, b ) => this.onchangeLoop( isLoop, a, b );
		uiTimeline.onchangeCurrentTime = t => {
			uiBeatlines.currentTime( t );
			this.onchangeCurrentTime( t );
		};
		root.ondragstart = () => false;
		root.onkeydown = this._onkeydown.bind( this );
		root.onwheel = e => { e.ctrlKey && e.preventDefault(); };
		elKeys.onscroll = e => {
			if ( this._.elRowsScrollTop !== elKeys.scrollTop ) {
				this._.elRowsScrollTop =
				elRows.scrollTop = elKeys.scrollTop;
			}
		};
		uiKeysRoot.onwheel = this._uiKeysWheel.bind( this );
		elRows.onwheel = this._elRowsWheel.bind( this );
		elRows.onscroll = this._elRowsScroll.bind( this );
		elRows.oncontextmenu = () => false;
		elPanGrid.onresizing = this._panelGridResizing.bind( this );
		elKeys.append( uiKeysRoot );
		root.querySelector( ".gsuiPianoroll-timeline" ).append( uiTimeline.rootElement );
		root.querySelector( ".gsuiPianoroll-beatlines" ).append( uiBeatlines.rootElement );
	}

	empty() {
		Object.keys( this.data ).forEach( k => delete this.data[ k ] );
	}
	resized() {
		this._panelGridResized();
	}
	attached() {
		const _ = this._,
			scrollbarW = _.elRows.offsetWidth - _.elRows.clientWidth;

		_.elKeys.style.right =
		_.elRows.style.right =
		_.elKeys.style.bottom =
		_.elRows.style.bottom = -scrollbarW + "px";
		_.uiPanels.attached();
		this._panelGridResized();
	}
	octaves( from, nb ) {
		const _ = this._,
			rows = _.uiKeysRoot.getElementsByClassName( "gsui-row" );

		this.empty();
		Object.keys( _.rowsByMidi ).forEach( k => delete _.rowsByMidi[ k ] );
		this.uiKeys.octaves( from, nb );
		Object.values( rows ).forEach( el => {
			el.onmousedown = this._rowMousedown.bind( this, +el.dataset.midi );
			el.firstChild.style.fontSize = _.pxPerBeat + "px";
			_.rowsByMidi[ el.dataset.midi ] = el;
		} );
		Element.prototype.prepend.apply( _.elRows, rows );
	}
	setFontSize( px ) {
		const _ = this._;

		if ( px !== _.fontSize ) {
			this._.fontSize = px = Math.round( Math.min( Math.max( 8, px ), 64 ) );
			_.uiKeysRoot.style.fontSize =
			_.elRows.style.fontSize = px + "px";
		}
		return px;
	}

	// Blocks manager callback
	// ........................................................................
	_blcsManagerCallback( status, blcsMap, valA, valB ) {
		const obj = {},
			data = this.data;

		switch ( status ) {
			case "selecting":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						selected = !d.selected;

					obj[ id ] = { selected };
					d.selected = selected;
				} );
				break;
			case "moving":
				valA = Math.abs( valA ) > .000001 ? valA : 0;
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						o = {};

					obj[ id ] = o;
					if ( valA ) {
						o.when =
						d.when += valA;
					}
					if ( valB ) {
						o.key =
						d.key -= valB;
					}
				} );
				break;
			case "cropping-b":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						duration = d.duration + valA;

					obj[ id ] = { duration };
					d.duration = duration;
				} );
				break;
			case "deleting":
				blcsMap.forEach( ( _, id ) => {
					obj[ id ] = null;
					delete data[ id ];
				} );
				this._unselectKeys( obj );
				break;
		}
		this.onchange( obj );
	}

	// Panel functions
	// ........................................................................
	_panelGridResizing( pan ) {
		const {
				elRows,
				offset,
				pxPerBeat,
				elPanGridWidth,
			} = this._,
			width = pan.clientWidth;

		if ( offset > 0 ) {
			this._.offset -= ( width - elPanGridWidth ) / pxPerBeat;
			elRows.scrollLeft -= width - elPanGridWidth;
		}
		this._panelGridResized();
	}
	_panelGridResized() {
		const {
				offset,
				pxPerBeat,
				elPanGrid,
				uiTimeline,
				uiBeatlines,
			} = this._;

		this._.elPanGridWidth = elPanGrid.clientWidth;
		uiTimeline.resized();
		uiBeatlines.resized();
		uiTimeline.offset( offset, pxPerBeat );
		uiBeatlines.offset( offset, pxPerBeat );
	}

	// Shortcuts
	// ........................................................................
	getPxPerBeat() { return this._.pxPerBeat; }
	getBlocks() { return this.data; }
	getBlocksElements() { return this._.keyBlc; }
	getSelectedBlocksElements() { return this._.keyBlcSelected; }
	getBeatSnap() { return 1 / this._.uiTimeline._stepsPerBeat * this._.uiTimeline.stepRound; }
	getRows() { return this._.nlRows; }
	getNbRows() { return this._.nlRows.length; }
	getRow0BCR() { return this._.nlRows[ 0 ].getBoundingClientRect(); }
	getRowHeight() { return this._.fontSize; }
	getRowByMidi( midi ) { return this._.rowsByMidi[ midi ]; }
	getRowByIndex( ind ) { return this._.nlRows[ ind ]; }
	getRowIndexByRow( row ) { return Array.prototype.indexOf.call( this._.nlRows, row ); }
	getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - this.getRow0BCR().top ) / this._.fontSize );

		return Math.max( 0, Math.min( ind, this.getNbRows() - 1 ) );
	}
	getWhenByPageX( pageX ) {
		return Math.max( 0, this._.uiTimeline.beatFloor(
			( pageX - this.getRow0BCR().left ) / this._.pxPerBeat ) );
	}

	// Keyboard
	// ........................................................................
	_onkeydown( e ) {
		const _ = this._,
			dat = this.data;

		switch ( e.key ) {
			case "a":
				if ( e.ctrlKey || e.altKey ) {
					e.preventDefault();
					e.stopPropagation();
					if ( _.keyBlc.size ) {
						const obj = {};
						let notEmpty;

						_.keyBlc.forEach( ( blc, id ) => {
							if ( !dat[ id ].selected ) {
								obj[ id ] = { selected: true };
								dat[ id ].selected = true;
								notEmpty = true;
							}
						} );
						notEmpty && this.onchange( obj );
					}
				}
				break;
			case "Delete":
				if ( _.keyBlcSelected.size ) {
					const obj = {};

					_.keyBlcSelected.forEach( ( blc, id ) => {
						obj[ id ] = null;
						delete dat[ id ];
					} );
					this.onchange( obj );
				}
				break;
		}
	}

	// Mouse events
	// ........................................................................
	_elRowsScroll( e ) {
		const {
				elKeys,
				elRows,
				pxPerBeat,
				uiTimeline,
				uiBeatlines,
				elRowsScrollTop,
				elRowsScrollLeft,
			} = this._;

		this.blcsEdition.mousemove( e );
		if ( elRows.scrollTop !== elRowsScrollTop ) {
			this._.elRowsScrollTop =
			elKeys.scrollTop = elRows.scrollTop;
		}
		if ( elRows.scrollLeft !== elRowsScrollLeft ) {
			const off = elRows.scrollLeft / pxPerBeat;

			this._.offset = off;
			this._.elRowsScrollLeft = elRows.scrollLeft;
			uiTimeline.offset( off, pxPerBeat );
			uiBeatlines.offset( off, pxPerBeat );
		}
	}
	_uiKeysWheel( e ) {
		if ( e.ctrlKey ) {
			const {
					elKeys,
					elRows,
					fontSize,
					uiKeysRoot,
				} = this._,
				layerY = e.pageY - uiKeysRoot.getBoundingClientRect().top,
				fs = this.setFontSize( fontSize * ( e.deltaY > 0 ? .9 : 1.1 ) );

			this._.elRowsScrollTop =
			elKeys.scrollTop =
			elRows.scrollTop += layerY / fontSize * ( fs - fontSize );
		}
	}
	_elRowsWheel( e ) {
		if ( e.ctrlKey ) {
			const {
					elRows,
					nlRows,
					pxPerBeat,
					uiTimeline,
					uiBeatlines,
				} = this._,
				layerX = e.pageX - elRows.getBoundingClientRect().left + elRows.scrollLeft,
				ppb = Math.round( Math.min( Math.max( 8, pxPerBeat * ( e.deltaY > 0 ? .9 : 1.1 ) ), 512 ) );

			this._.pxPerBeat = ppb;
			this._.elRowsScrollLeft =
			elRows.scrollLeft += layerX / pxPerBeat * ( ppb - pxPerBeat );
			this._.offset = elRows.scrollLeft / ppb;
			uiTimeline.offset( this._.offset, ppb );
			uiBeatlines.offset( this._.offset, ppb );
			Array.from( nlRows ).forEach( el => el.firstChild.style.fontSize = ppb + "px" );
		}
	}
	_rowMousedown( key, e ) {
		this.blcsEdition.mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = this._.idMax + 1,
				keyObj = {
					key,
					when: this.getWhenByPageX( e.pageX ),
					duration: this._.currKeyDuration
				};

			this.data[ id ] = keyObj;
			this.onchange( this._unselectKeys( { [ id ]: keyObj } ) );
		}
		gsuiPianoroll._focused = this;
	}
	_mousemove( e ) {
		this.blcsEdition.mousemove( e );
	}
	_mouseup( e ) {
		this.blcsEdition.mouseup();
		delete gsuiPianoroll._focused;
	}

	// Key's functions
	// ........................................................................
	blcRow( blc, rowIncr ) {
		this.blcKey( blc, this.data[ blc.dataset.id ].key - rowIncr );
	}
	blcKey( blc, midi ) {
		const row = this.getRowByMidi( midi );

		blc.dataset.key = gsuiPianoroll.noteNames.en[ row.dataset.key ];
		row.firstChild.append( blc );
	}
	blcWhen( blc, val ) { blc.style.left = val + "em"; }
	blcDuration( blc, val ) { blc.style.width = val + "em"; }
	blcDeleted( blc, val ) { blc.classList.toggle( "gsui-block-hidden", !!val ); }
	blcSelected( blc, val ) { blc.classList.toggle( "gsui-block-selected", !!val ); }
	_deleteKey( id ) {
		const _ = this._;

		_.keyBlc.get( id ).remove();
		_.keyBlc.delete( id );
		_.keyBlcSelected.delete( id );
	}
	_setKey( id, obj ) {
		const _ = this._,
			blc = document.createElement( "div" ),
			crop = document.createElement( "div" );

		blc.dataset.id = id;
		blc.className = "gsui-block";
		blc.onmousedown = this._keyMousedown.bind( this, id );
		obj.selected
			? _.keyBlcSelected.set( id, blc )
			: _.keyBlcSelected.delete( id );
		crop.className = "gsui-block-crop gsui-block-cropB";
		blc.append( crop );
		_.keyBlc.set( id, blc );
		this.blcKey( blc, obj.key );
		this.blcWhen( blc, obj.when );
		this.blcDuration( blc, obj.duration );
		this.blcSelected( blc, obj.selected );
	}
	_setKeyProp( id, prop, val ) {
		const blc = this._.keyBlc.get( id );

		switch ( prop ) {
			case "key": this.blcKey( blc, val ); break;
			case "when": this.blcWhen( blc, val ); break;
			case "duration": this.blcDuration( blc, val ); break;
			case "selected":
				this.blcSelected( blc, val );
				val
					? this._.keyBlcSelected.set( id, blc )
					: this._.keyBlcSelected.delete( id );
				break;
		}
	}
	_unselectKeys( obj ) {
		const _ = this._;

		_.keyBlcSelected.forEach( ( blc, id ) => {
			if ( !( id in obj ) ) {
				this.data[ id ].selected = false;
				obj[ id ] = { selected: false };
			}
		} );
		return obj;
	}
	_keyMousedown( id, e ) {
		e.stopPropagation();
		this.blcsEdition.mousedown( e );
		gsuiPianoroll._focused = this;
	}

	// Data proxy
	// ........................................................................
	_proxyCreate() {
		return new Proxy( {}, {
			set: this._proxySetKey.bind( this ),
			deleteProperty: this._proxyDeleteKey.bind( this )
		} );
	}
	_proxyDeleteKey( tar, id ) {
		this._deleteKey( id );
		delete tar[ id ];
		return true;
	}
	_proxySetKey( tar, id, obj ) {
		if ( id in tar || !obj ) {
			this._proxyDeleteKey( tar, id );
		}
		if ( obj ) {
			this._.idMax = Math.max( this._.idMax, id );
			this._setKey(
				id,
				tar[ id ] = new Proxy( Object.seal( Object.assign( {
					key: 60,
					when: 0,
					duration: 1,
					selected: false
				}, obj ) ), {
					set: this._proxySetKeyProp.bind( this, id )
				} )
			);
		}
		return true;
	}
	_proxySetKeyProp( id, tar, prop, val ) {
		tar[ prop ] = val;
		this._setKeyProp( id, prop, val );
		return true;
	}
}

gsuiPianoroll.noteNames = {
	en: [ "c",  "c#",  "d",  "d#",  "e",  "f",  "f#",  "g",   "g#",   "a",  "a#",  "b" ],
	fr: [ "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ]
};

gsuiPianoroll.template = document.querySelector( "#gsuiPianoroll-template" );
gsuiPianoroll.template.remove();
gsuiPianoroll.template.removeAttribute( "id" );

document.addEventListener( "mousemove", e => {
	gsuiPianoroll._focused && gsuiPianoroll._focused._mousemove( e );
} );
document.addEventListener( "mouseup", e => {
	gsuiPianoroll._focused && gsuiPianoroll._focused._mouseup( e );
} );
