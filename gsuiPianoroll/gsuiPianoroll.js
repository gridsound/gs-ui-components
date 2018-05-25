"use strict";

class gsuiPianoroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			elPanKeys = root.querySelector( ".gsuiPianoroll-pan-keys" ),
			elPanGrid = root.querySelector( ".gsuiPianoroll-pan-grid" ),
			uiPanels = new gsuiPanels( root );

		super( root );
		this.uiBlc.row = ( el, rowIncr ) => {
			this.uiBlc.key( el, this.data[ el.dataset.id ].key - rowIncr );
		};
		this.uiBlc.key = ( el, midi ) => {
			const row = this.getRowByMidi( midi );

			el.dataset.key = gsuiPianoroll.noteNames.en[ row.dataset.key ];
			row.firstChild.append( el );
		};

		this.rootElement = root;
		this.uiKeys = new gsuiKeys();
		this.data = this._proxyCreate();
		this._ = Object.seal( {
			uiPanels,
			elPanKeys,
			elPanGrid,
			idMax: 1,
			elPanGridWidth: 0,
			currKeyDuration: 1,
			rowsByMidi: {},
		} );
		root.onkeydown = this._onkeydown.bind( this );
		elPanGrid.onresizing = this._panelGridResizing.bind( this );
		this.__panelContent.append( this.uiKeys.rootElement );
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
			rows = this.uiKeys.rootElement.getElementsByClassName( "gsui-row" );

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
		const width = pan.clientWidth;

		if ( this.__offset > 0 ) {
			this.__offset -= ( width - this._.elPanGridWidth ) / this.__pxPerBeat;
			this.__rowsContainer.scrollLeft -= width - this._.elPanGridWidth;
		}
		this._panelGridResized();
	}
	_panelGridResized() {
		this._.elPanGridWidth = this._.elPanGrid.clientWidth;
		this.__uiTimeline.resized();
		this.__uiBeatlines.resized();
		this.__uiTimeline.offset( this.__offset, this.__pxPerBeat );
		this.__uiBeatlines.offset( this.__offset, this.__pxPerBeat );
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

	// Mouse and keyboard events
	// ........................................................................
	_onkeydown( e ) {
		this.__keydown( e );
	}
	_mousemove( e ) {
		this.__mousemove( e );
	}
	_mouseup( e ) {
		this.__mouseup();
		delete gsuiPianoroll._focused;
	}
	_rowMousedown( key, e ) {
		this.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = this._.idMax + 1,
				keyObj = {
					key,
					when: this.getWhenByPageX( e.pageX ),
					duration: this._.currKeyDuration,
					selected: false
				};

			this.data[ id ] = keyObj;
			this.onchange( this._unselectKeys( { [ id ]: keyObj } ) );
		}
		gsuiPianoroll._focused = this;
	}

	// Key's functions
	// ........................................................................
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
		this.uiBlc.key( blc, obj.key );
		this.uiBlc.when( blc, obj.when );
		this.uiBlc.duration( blc, obj.duration );
		this.uiBlc.selected( blc, obj.selected );
	}
	_setKeyProp( id, prop, val ) {
		const uiFn = this.uiBlc[ prop ];

		if ( uiFn ) {
			const blc = this.__blcs.get( id );

			uiFn( blc, val );
			if ( prop === "duration" ) {
				this._.currKeyDuration = val;
			} else if ( prop === "selected" ) {
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
			}
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
