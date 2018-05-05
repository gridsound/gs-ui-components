"use strict";

class gsuiPianoroll {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			elSelection = root.querySelector( ".gsuiBlocksEdition-selection" ),
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
		this.data = this._proxyCreate();
		this._ = Object.seal( {
			uiKeys,
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
			mouseDeleting: false,
			keyBlc: {},
			rowsByMidi: {},
			keyBlcSelected: {},
			keyBlcDeleting: [],
		} );
		this.blcsEdition = new gsuiBlocksEdition( this, elSelection );
		this.onchange =
		this.onchangeLoop =
		this.onchangeCurrentTime = () => {};
		uiTimeline.oninputLoop = ( isLoop, a, b ) => uiBeatlines.loop( isLoop && a, b );
		uiTimeline.onchangeLoop = ( isLoop, a, b ) => this.onchangeLoop( isLoop, a, b );
		uiTimeline.onchangeCurrentTime = t => {
			uiBeatlines.currentTime( t );
			this.onchangeCurrentTime( t );
		};
		root.onkeydown = this._onkeydown.bind( this );
		root.onwheel = e => {
			e.ctrlKey && e.preventDefault();
		};
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
		const {
				elKeys,
				elRows,
				elPanGrid,
				uiPanels,
			} = this._,
			scrollbarW = elRows.offsetWidth - elRows.clientWidth;

		elKeys.style.right =
		elRows.style.right =
		elKeys.style.bottom =
		elRows.style.bottom = -scrollbarW + "px";
		uiPanels.attached();
		this._panelGridResized();
	}
	octaves( from, nb ) {
		const {
				uiKeys,
				elRows,
				pxPerBeat,
				uiKeysRoot,
				rowsByMidi,
			} = this._,
			rows = uiKeysRoot.getElementsByClassName( "gsui-row" );

		this.empty();
		Object.keys( rowsByMidi ).forEach( k => delete rowsByMidi[ k ] );
		uiKeys.octaves( from, nb );
		Object.values( rows ).forEach( el => {
			el.onmousedown = this._rowMousedown.bind( this, +el.dataset.midi );
			el.firstChild.style.fontSize = pxPerBeat + "px";
			rowsByMidi[ el.dataset.midi ] = el;
		} );
		Element.prototype.append.apply( elRows, rows );
	}
	setFontSize( px ) {
		const {
				elRows,
				fontSize,
				uiKeysRoot,
			} = this._;

		if ( px !== fontSize ) {
			this._.fontSize = px = Math.round( Math.min( Math.max( 8, px ), 64 ) );
			uiKeysRoot.style.fontSize =
			elRows.style.fontSize = px + "px";
		}
		return px;
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
	getRowsBCR() { return this._.nlRows[ 0 ].getBoundingClientRect(); }
	getRowHeight() { return this._.fontSize; }
	getPxPerBeat() { return this._.pxPerBeat; }
	getBlocks() { return this.data; }
	getBlocksElements() { return this._.keyBlc; }
	getSelectedBlocksElements() { return this._.keyBlcSelected; }
	getRowByIndex( ind ) { return this._.nlRows[ ind ]; }
	getStepsPerBeat() { return this._.uiTimeline._stepsPerBeat; }
	getWhenByPageX( pageX ) {
		return Math.max( 0, this._.uiTimeline.beatFloor(
			( pageX - this.getRowsBCR().left ) / this._.pxPerBeat ) );
	}
	getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - this.getRowsBCR().top ) / this._.fontSize );

		return Math.max( 0, Math.min( ind, this._.nlRows.length - 1 ) );
	}

	// Keyboard
	// ........................................................................
	_onkeydown( e ) {
		const _ = this._;

		if ( e.key === "Delete" ) {
			const arr = Object.keys( _.keyBlcSelected );

			if ( arr.length ) {
				this.onchange( arr.reduce( ( obj, id ) => {
					obj[ id ] = null;
					delete this.data[ id ];
					return obj;
				}, {} ) );
			}
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

		this.selection.mousemove( e );
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
		const _ = this._,
			tar = e.target;

		this.blcsEdition.mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = _.idMax + 1,
				keyObj = {
					key,
					when: this.getWhenByPageX( e.pageX ),
					duration: _.currKeyDuration
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
		const _ = this._,
			edi = this.blcsEdition;

		if ( edi._.deletionStatus ) {
			const blcs = edi.getDeletingBlocks();

			if ( blcs.size ) {
				const obj = {};

				blcs.forEach( ( blc, id ) => {
					obj[ id ] = null;
					delete this.data[ id ];
				} );
				this.onchange( this._unselectKeys( obj ) );
			} else if ( Object.keys( _.keyBlcSelected ).length ) {
				this.onchange( this._unselectKeys( {} ) );
			}
		} else if ( edi._.selectionStatus === 2 ) {
			const blcs = Object.values( edi.getSelectedBlocks() );

			if ( blcs.length ) {
				const obj = {};

				blcs.forEach( blc => {
					obj[ blc.dataset.id ] = { selected: true };
					this.data[ blc.dataset.id ].selected = true;
				} );
				this.onchange( obj );
			}
		}
		edi.mouseup();
		delete gsuiPianoroll._focused;
	}

	// Key's functions
	// ........................................................................
	_deleteKey( id ) {
		const _ = this._;

		_.keyBlc[ id ].remove();
		delete _.keyBlc[ id ];
		delete _.keyBlcSelected[ id ];
	}
	_setKey( id, obj ) {
		const _ = this._,
			el = document.createElement( "div" ),
			row = _.rowsByMidi[ obj.key ];

		el.dataset.id = id;
		el.className = "gsui-block";
		el.classList.toggle( "gsui-block-selected", obj.selected );
		el.style.left = obj.when + "em";
		el.style.width = obj.duration + "em";
		el.onmousedown = this._keyMousedown.bind( this, id );
		_.keyBlc[ id ] = el;
		el.dataset.key = gsuiPianoroll.noteNames.en[ row.dataset.key ];
		row.firstChild.append( el );
	}
	_setKeyProp( id, prop, val ) {
		const _ = this._,
			el = _.keyBlc[ id ];

		switch ( prop ) {
			case "when":
				el.style.left = val + "em";
				break;
			case "duration":
				el.style.width = val + "em";
				break;
			case "selected":
				if ( val ) {
					_.keyBlcSelected[ id ] = el;
				} else {
					delete _.keyBlcSelected[ id ];
				}
				el.classList.toggle( "gsui-block-selected", !!val );
				break;
		}
	}
	_unselectKeys( obj ) {
		const _ = this._,
			sel = Object.values( _.keyBlcSelected );

		return sel.reduce( ( obj, blc ) => {
			const id = blc.dataset.id;

			if ( !( id in obj ) ) {
				this.data[ id ].selected = false;
				obj[ id ] = { selected: false };
			}
			return obj;
		}, obj );
	}
	_keyMousedown( id, e ) {
		const _ = this._,
			blc = e.target;

		e.stopPropagation();
		this.blcsEdition.mousedown( e );
		if ( e.button === 2 ) {
			blc.classList.add( "gsui-block-hidden" );
			_.keyBlcDeleting.push( blc );
			_.mouseDeleting = true;
		} else if ( e.button === 0 ) {
			if ( e.shiftKey ) {
				const blc = this.data[ id ],
					selected = !blc.selected;

				blc.selected = selected;
				this.onchange( { [ id ]: { selected } } );
				this.selection.mousedown( e );
			}
		}
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
