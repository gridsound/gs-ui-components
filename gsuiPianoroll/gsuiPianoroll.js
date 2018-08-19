"use strict";

class gsuiPianoroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			sideTop = root.querySelector( ".gsuiPianoroll-sidePanelTop" ),
			gridTop = root.querySelector( ".gsuiPianoroll-gridPanelTop" ),
			sideBottom = root.querySelector( ".gsuiPianoroll-sidePanelBottom" ),
			gridBottom = root.querySelector( ".gsuiPianoroll-gridPanelBottom" ),
			slidersSelect = root.querySelector( ".gsuiPianoroll-slidersSelect" ),
			uiSliderGroup = new gsuiSliderGroup();
		super( root );
		const uiBlc = this.uiBlc,
			uiBlcWhen = uiBlc.when,
			uiBlcDuration = uiBlc.duration,
			uiBlcSelected = uiBlc.selected,
			sliderFnUpdate = ( nodeName, el, val ) => {
				if ( slidersSelect.value === nodeName ) {
					this._uiSliderGroup.setProp( +el.dataset.id, "value", val );
					this._currKeyValue[ nodeName ] = val;
				}
			};

		uiBlc.gain = sliderFnUpdate.bind( null, "gain" );
		uiBlc.pan = sliderFnUpdate.bind( null, "pan" );
		uiBlc.when = ( el, when ) => {
			uiBlcWhen( el, when );
			uiSliderGroup.setProp( +el.dataset.id, "when", when );
		};
		uiBlc.duration = ( el, duration ) => {
			uiBlcDuration( el, duration );
			uiSliderGroup.setProp( +el.dataset.id, "duration", duration );
			this._currKeyValue.duration = duration;
		};
		uiBlc.selected = ( el, b ) => {
			uiBlcSelected( el, b );
			uiSliderGroup.setProp( +el.dataset.id, "selected", b );
		};
		uiBlc.row = ( el, rowIncr ) => {
			uiBlc.key( el, this.data[ +el.dataset.id ].key - rowIncr );
		};
		uiBlc.key = ( el, midi ) => {
			const row = this._getRowByMidi( midi );

			el.dataset.key = gsuiPianoroll.noteNames.en[ row.dataset.key ];
			row.firstChild.append( el );
		};

		this._slidersSelect = slidersSelect;
		this._uiSliderGroup = uiSliderGroup;
		uiSliderGroup.scrollElement.onscroll = this._onscrollSliderGroup.bind( this,
			uiSliderGroup.scrollElement, this.__rowsContainer );
		slidersSelect.onchange = this._onchangeSlidersSelect.bind( this );
		sideBottom.onresizing =
		gridBottom.onresizing = panel => {
			const topH = panel.previousSibling.style.height,
				bottomH = panel.style.height;

			if ( panel === gridBottom ) {
				sideTop.style.height = topH;
				sideBottom.style.height = bottomH;
			} else {
				gridTop.style.height = topH;
				gridBottom.style.height = bottomH;
			}
		};
		sideBottom.append( uiSliderGroup.scaleElement );
		gridBottom.append( uiSliderGroup.rootElement );

		this.data = this._proxyCreate();
		this.uiKeys = new gsuiKeys();
		this._rowsByMidi = {};
		this._currKeyValue = {};
		this.empty();
		this.__sideContent.append( this.uiKeys.rootElement );
		this.__onclickMagnet();
		this._onchangeSlidersSelect();
		uiSliderGroup.onchange = arr => {
			const obj = {},
				nodeName = this._slidersSelect.value;

			arr.forEach( ( [ id, val ] ) => obj[ id ] = { [ nodeName ]: val } );
			this.onchange( obj );
		};
		this.setPxPerBeat( 64 );
	}

	empty() {
		Object.keys( this.data ).forEach( k => delete this.data[ k ] );
		this._idMax = 0;
		this.resetKey();
	}
	resetKey() {
		const k = this._currKeyValue;

		k.duration = 1;
		k.gain = .8;
		k.pan = 0;
	}
	resized() {
		this.__resized();
		this.__gridPanelResized();
	}
	attached() {
		this.__attached();
		this.scrollToMiddle();
		this._uiSliderGroup.attached();
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
			const midi = +el.dataset.midi;

			el.onmousedown = this._rowMousedown.bind( this, midi );
			el.firstChild.style.fontSize = this.__pxPerBeat + "px";
			this._rowsByMidi[ midi ] = el;
		} );
		Element.prototype.prepend.apply( this.__rowsWrapinContainer, rows );
	}

	// Blocks manager callback
	// ........................................................................
	blcsManagerCallback( status, blcsMap, valA, valB ) {
		const obj = {},
			data = this.data;

		switch ( status ) {
			case "duplicating":
				blcsMap.forEach( ( blc, id ) => {
					const d = data[ id ],
						nId = ++this._idMax,
						copy = Object.assign( {}, d );

					copy.when += valA;
					obj[ id ] = { selected: false };
					obj[ nId ] =
					data[ nId ] = copy;
					d.selected = false;
				} );
				break;
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
	_mouseup( e ) {
		this.__mouseup( e );
	}
	_onscrollRows() {
		this._onscrollSliderGroup( this.__rowsContainer, this._uiSliderGroup.scrollElement );
	}
	_loop( a, b ) { this._uiSliderGroup.loop( a, b ); }
	_currentTime( beat ) { this._uiSliderGroup.currentTime( beat ); }
	_setPxPerBeat( ppb ) { this._uiSliderGroup.setPxPerBeat( ppb ); }

	// ........................................................................
	_blcMousedown( id, e ) {
		e.stopPropagation();
		this.__mousedown( e );
	}
	_rowMousedown( key, e ) {
		this.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = this._idMax + 1,
				{ pan, gain, duration } = this._currKeyValue,
				keyObj = { key, pan, gain, duration,
					selected: false,
					when: this.__getWhenByPageX( e.pageX ),
				};

			this.data[ id ] = keyObj;
			this.onchange( this.__unselectBlocks( { [ id ]: keyObj } ) );
		}
	}
	_onscrollSliderGroup( elSrc, elLink ) {
		if ( this._slidersWrapScrollLeft !== elSrc.scrollLeft ) {
			this._slidersWrapScrollLeft =
			elLink.scrollLeft = elSrc.scrollLeft;
		}
	}
	_onchangeSlidersSelect() {
		const data = this.data,
			nodeName = this._slidersSelect.value;

		this._uiSliderGroup.alignMode( nodeName === "gain" ? "0->1" : "-1->1" );
		this.__blcs.forEach( ( blc, id ) => (
			this._uiSliderGroup.setProp( id, "value", data[ id ][ nodeName ] )
		) );
	}

	// Key's functions
	// ........................................................................
	_deleteKey( id ) {
		const blc = this.__blcs.get( id );

		blc.remove();
		this.__blcs.delete( id );
		this.__blcsSelected.delete( id );
		this._uiSliderGroup.delete( id );
	}
	_setKey( id, obj ) {
		const blc = gsuiPianoroll.blockTemplate.cloneNode( true );

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		this.__blcs.set( id, blc );
		obj.selected
			? this.__blcsSelected.set( id, blc )
			: this.__blcsSelected.delete( id );
		this._uiSliderGroup.set( id, obj.when, obj.duration, obj[ this._slidersSelect.value ] );
		this.uiBlc.key( blc, obj.key );
		this.uiBlc.when( blc, obj.when );
		this.uiBlc.duration( blc, obj.duration );
		this.uiBlc.selected( blc, obj.selected );
		this.uiBlc.gain( blc, obj.gain );
		this.uiBlc.pan( blc, obj.pan );
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
		id = +id;
		if ( id in tar ) {
			this._deleteKey( id );
			delete tar[ id ];
		} else {
			console.warn( `gsuiPianoroll: proxy useless deletion of [${ id }]` );
		}
		return true;
	}
	_proxySetKey( tar, id, obj ) {
		id = +id;
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
			const blc = this.__blcs.get( id ),
				uiFn = this.uiBlc[ prop ];

			tar[ prop ] = val;
			if ( uiFn ) {
				uiFn( blc, val );
			}
			if ( prop === "selected" ) {
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
			}
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
