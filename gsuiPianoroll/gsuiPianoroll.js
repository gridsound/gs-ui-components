"use strict";

class gsuiPianoroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			elPanKeys = root.querySelector( ".gsuiPianoroll-pan-keys" ),
			elPanGrid = root.querySelector( ".gsuiPianoroll-pan-grid" ),
			uiPanels = new gsuiPanels( root ),
			uiKeys = new gsuiKeys(),
			uiKeysRoot = uiKeys.rootElement;

		super( root );
		this.rootElement = root;
		this.uiKeys = uiKeys;
		this.data = this._proxyCreate();
		this._ = Object.seal( {
			uiPanels,
			elPanKeys,
			elPanGrid,
			uiKeysRoot,
			idMax: 1,
			offset: 0,
			elPanGridWidth: 0,
			currKeyDuration: 1,
			elRowsScrollTop: -1,
			elRowsScrollLeft: -1,
			rowsByMidi: {},
		} );
		this.onchange =
		this.onchangeLoop =
		this.onchangeCurrentTime = () => {};
		root.ondragstart = () => false;
		root.onkeydown = this._onkeydown.bind( this );
		root.onwheel = e => { e.ctrlKey && e.preventDefault(); };
		this.__panelContent.onscroll = e => {
			if ( this._.elRowsScrollTop !== this.__panelContent.scrollTop ) {
				this._.elRowsScrollTop =
				this.__rowsContainer.scrollTop = this.__panelContent.scrollTop;
			}
		};
		this.__panelContent.onwheel = this._uiKeysWheel.bind( this );
		this.__rowsContainer.onwheel = this._elRowsWheel.bind( this );
		this.__rowsContainer.onscroll = this._elRowsScroll.bind( this );
		this.__rowsContainer.oncontextmenu = () => false;
		elPanGrid.onresizing = this._panelGridResizing.bind( this );
		this.__panelContent.append( uiKeysRoot );
	}

	empty() {
		Object.keys( this.data ).forEach( k => delete this.data[ k ] );
	}
	resized() {
		this._panelGridResized();
	}
	attached() {
		const rowsC = this.__rowsContainer;

		this.__panelContent.style.right =
		this.__panelContent.style.bottom =
		rowsC.style.right =
		rowsC.style.bottom = -( rowsC.offsetWidth - rowsC.clientWidth ) + "px";
		this._.uiPanels.attached();
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
			el.firstChild.style.fontSize = this.__pxPerBeat + "px";
			_.rowsByMidi[ el.dataset.midi ] = el;
		} );
		Element.prototype.prepend.apply( this.__rowsContainer, rows );
	}

	// Blocks manager callback
	// ........................................................................
	blcsManagerCallback( status, blcsMap, valA, valB ) {
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
		const _ = this._,
			width = pan.clientWidth;

		if ( _.offset > 0 ) {
			_.offset -= ( width - _.elPanGridWidth ) / this.__pxPerBeat;
			this.__rowsContainer.scrollLeft -= width - _.elPanGridWidth;
		}
		this._panelGridResized();
	}
	_panelGridResized() {
		const _ = this._;

		_.elPanGridWidth = _.elPanGrid.clientWidth;
		this.__uiTimeline.resized();
		this.__uiBeatlines.resized();
		this.__uiTimeline.offset( _.offset, this.__pxPerBeat );
		this.__uiBeatlines.offset( _.offset, this.__pxPerBeat );
	}

	// Shortcuts
	// ........................................................................
	getData() { return this.data; }
	getRow0BCR() { return this.__rows[ 0 ].getBoundingClientRect(); }
	getRowByMidi( midi ) { return this._.rowsByMidi[ midi ]; }
	getRowByIndex( ind ) { return this.__rows[ ind ]; }
	getRowIndexByRow( row ) { return Array.prototype.indexOf.call( this.__rows, row ); }
	getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - this.getRow0BCR().top ) / this.__fontSize );

		return Math.max( 0, Math.min( ind, this.__rows.length - 1 ) );
	}
	getWhenByPageX( pageX ) {
		return Math.max( 0, this.__uiTimeline.beatFloor(
			( pageX - this.getRow0BCR().left ) / this.__pxPerBeat ) );
	}

	// Keyboard
	// ........................................................................
	_onkeydown( e ) {
		const dat = this.data;

		switch ( e.key ) {
			case "a":
				if ( e.ctrlKey || e.altKey ) {
					e.preventDefault();
					e.stopPropagation();
					if ( this.__blcs.size ) {
						const obj = {};
						let notEmpty;

						this.__blcs.forEach( ( blc, id ) => {
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
				if ( this.__blcsSelected.size ) {
					const obj = {};

					this.__blcsSelected.forEach( ( blc, id ) => {
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
		const _ = this._,
			elRows = this.__rowsContainer;

		this.__mousemove( e );
		if ( elRows.scrollTop !== _.elRowsScrollTop ) {
			_.elRowsScrollTop =
			this.__panelContent.scrollTop = elRows.scrollTop;
		}
		if ( elRows.scrollLeft !== _.elRowsScrollLeft ) {
			const off = elRows.scrollLeft / this.__pxPerBeat;

			_.offset = off;
			_.elRowsScrollLeft = elRows.scrollLeft;
			this.__uiTimeline.offset( off, this.__pxPerBeat );
			this.__uiBeatlines.offset( off, this.__pxPerBeat );
		}
	}
	_uiKeysWheel( e ) {
		if ( e.ctrlKey ) {
			const _ = this._,
				layerY = e.pageY - _.uiKeysRoot.getBoundingClientRect().top,
				oldFs = this.__fontSize,
				fs = this.setFontSize( oldFs * ( e.deltaY > 0 ? .9 : 1.1 ) );

			this._.elRowsScrollTop =
			this.__panelContent.scrollTop =
			this.__rowsContainer.scrollTop += layerY / oldFs * ( fs - oldFs );
		}
	}
	_elRowsWheel( e ) {
		if ( e.ctrlKey ) {
			const _ = this._,
				elRows = this.__rowsContainer,
				layerX = e.pageX - elRows.getBoundingClientRect().left + elRows.scrollLeft,
				ppb = Math.round( Math.min( Math.max( 8, this.__pxPerBeat * ( e.deltaY > 0 ? .9 : 1.1 ) ), 512 ) );

			_.elRowsScrollLeft =
			elRows.scrollLeft += layerX / this.__pxPerBeat * ( ppb - this.__pxPerBeat );
			_.offset = elRows.scrollLeft / ppb;
			this.setPxPerBeat( ppb );
		}
	}
	_rowMousedown( key, e ) {
		this.__mousedown( e );
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
		this.__mousemove( e );
	}
	_mouseup( e ) {
		this.__mouseup();
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
		this.__blcs.get( id ).remove();
		this.__blcs.delete( id );
		this.__blcsSelected.delete( id );
	}
	_setKey( id, obj ) {
		const blc = document.createElement( "div" ),
			crop = document.createElement( "div" );

		blc.dataset.id = id;
		blc.className = "gsui-block";
		blc.onmousedown = this._keyMousedown.bind( this, id );
		obj.selected
			? this.__blcsSelected.set( id, blc )
			: this.__blcsSelected.delete( id );
		crop.className = "gsui-block-crop gsui-block-cropB";
		blc.append( crop );
		this.__blcs.set( id, blc );
		this.blcKey( blc, obj.key );
		this.blcWhen( blc, obj.when );
		this.blcDuration( blc, obj.duration );
		this.blcSelected( blc, obj.selected );
	}
	_setKeyProp( id, prop, val ) {
		const blc = this.__blcs.get( id );

		switch ( prop ) {
			case "key": this.blcKey( blc, val ); break;
			case "when": this.blcWhen( blc, val ); break;
			case "duration": this.blcDuration( blc, val ); break;
			case "selected":
				this.blcSelected( blc, val );
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
				break;
		}
	}
	_unselectKeys( obj ) {
		this.__blcsSelected.forEach( ( blc, id ) => {
			if ( !( id in obj ) ) {
				this.data[ id ].selected = false;
				obj[ id ] = { selected: false };
			}
		} );
		return obj;
	}
	_keyMousedown( id, e ) {
		e.stopPropagation();
		this.__mousedown( e );
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
		if ( id in tar ) {
			this._deleteKey( id );
			delete tar[ id ];
		} else {
			console.warn( `gsuiPianoroll: proxy useless deletion of [${ id }]` );
		}
		return true;
	}
	_proxySetKey( tar, id, obj ) {
		if ( id in tar || !obj ) {
			this._proxyDeleteKey( tar, id );
		}
		if ( obj ) {
			const prox = new Proxy( Object.seal( Object.assign( {
					key: 60,
					when: 0,
					duration: 1,
					selected: false
				}, obj ) ), {
					set: this._proxySetKeyProp.bind( this, id )
				} );

			tar[ id ] = prox;
			this._.idMax = Math.max( this._.idMax, id );
			this._setKey( id, prox );
		}
		return true;
	}
	_proxySetKeyProp( id, tar, prop, val ) {
		if ( prop === "offset" ) {
			console.warn( `gsuiPianoroll: proxy set useless 'offset' to key` );
		} else {
			tar[ prop ] = val;
			this._setKeyProp( id, prop, val );
		}
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
