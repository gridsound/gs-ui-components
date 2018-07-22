"use strict";

class gsuiPianoroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true );

		super( root );
		this.uiBlc.row = ( el, rowIncr ) => {
			this.uiBlc.key( el, this.data[ el.dataset.id ].key - rowIncr );
		};
		this.uiBlc.key = ( el, midi ) => {
			const row = this._getRowByMidi( midi );

			el.dataset.key = gsuiPianoroll.noteNames.en[ row.dataset.key ];
			row.firstChild.append( el );
		};

		this.data = this._proxyCreate();
		this.uiKeys = new gsuiKeys();
		this._idMax = 1;
		this._rowsByMidi = {};
		this._currKeyDuration = 1;
		this.__sideContent.append( this.uiKeys.rootElement );
	}

	empty() {
		Object.keys( this.data ).forEach( k => delete this.data[ k ] );
	}
	resized() {
		this.__resized();
		this.__gridPanelResized();
	}
	attached() {
		this.__attached();
		this.scrollToMiddle();
	}
	scrollToMiddle() {
		const rows = this.__rowsContainer;

		rows.scrollTop = ( rows.scrollHeight - rows.clientHeight ) / 2;
	}
	scrollToKeys() {
		const rows = this.__rowsContainer,
			smp = rows.querySelector( ".gsuiBlocksManager-block" );

		if ( smp ) {
			rows.scrollTop += smp.getBoundingClientRect().top -
				rows.getBoundingClientRect().top - 3.5 * this.__fontSize;
		}
	}
	octaves( from, nb ) {
		const rows = this.uiKeys.rootElement.getElementsByClassName( "gsui-row" );

		this.empty();
		Object.keys( this._rowsByMidi ).forEach( k => delete this._rowsByMidi[ k ] );
		this.uiKeys.octaves( from, nb );
		Object.values( rows ).forEach( el => {
			el.onmousedown = this._rowMousedown.bind( this, +el.dataset.midi );
			el.firstChild.style.fontSize = this.__pxPerBeat + "px";
			this._rowsByMidi[ el.dataset.midi ] = el;
		} );
		Element.prototype.prepend.apply( this.__rowsWrapinContainer, rows );
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
				this.__unselectBlocks( obj );
				break;
		}
		this.onchange( obj );
	}

	// Private small getters
	// ........................................................................
	_getData() { return this.data; }
	_getRowByMidi( midi ) { return this._rowsByMidi[ midi ]; }

	// Mouse and keyboard events
	// ........................................................................
	_keyup( e ) { this.__keyup( e ); }
	_keydown( e ) { this.__keydown( e ); }
	_mousemove( e ) { this.__mousemove( e ); }
	_mouseup( e ) { this.__mouseup( e ); }
	_blcMousedown( id, e ) {
		e.stopPropagation();
		this.__mousedown( e );
	}
	_rowMousedown( key, e ) {
		this.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = this._idMax + 1,
				keyObj = {
					key,
					when: this.__getWhenByPageX( e.pageX ),
					duration: this._currKeyDuration,
					selected: false
				};

			this.data[ id ] = keyObj;
			this.onchange( this.__unselectBlocks( { [ id ]: keyObj } ) );
		}
	}

	// Key's functions
	// ........................................................................
	_deleteKey( id ) {
		this.__blcs.get( id ).remove();
		this.__blcs.delete( id );
		this.__blcsSelected.delete( id );
	}
	_setKey( id, obj ) {
		const blc = gsuiPianoroll.blockTemplate.cloneNode( true );

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		obj.selected
			? this.__blcsSelected.set( id, blc )
			: this.__blcsSelected.delete( id );
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
				this._currKeyDuration = val;
			} else if ( prop === "selected" ) {
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
			}
		}
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
			if ( obj ) {
				console.warn( `gsuiPianoroll: reassignation of [${ id }]` );
			}
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
			this._idMax = Math.max( this._idMax, id );
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
gsuiPianoroll.blockTemplate = document.querySelector( "#gsuiPianoroll-block-template" );
gsuiPianoroll.blockTemplate.remove();
gsuiPianoroll.blockTemplate.removeAttribute( "id" );
