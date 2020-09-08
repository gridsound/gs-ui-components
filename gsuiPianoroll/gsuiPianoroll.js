"use strict";

class gsuiPianoroll {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			sideTop = root.querySelector( ".gsuiPianoroll-sidePanelTop" ),
			gridTop = root.querySelector( ".gsuiPianoroll-gridPanelTop" ),
			sideBottom = root.querySelector( ".gsuiPianoroll-sidePanelBottom" ),
			gridBottom = root.querySelector( ".gsuiPianoroll-gridPanelBottom" ),
			blcManager = new gsuiBlocksManager( root, {
				getData: () => this.data,
				blockDOMChange: this._blockDOMChange.bind( this ),
				managercallDuplicating: this.managercallDuplicating.bind( this ),
				managercallSelecting: this.managercallSelecting.bind( this ),
				managercallMoving: this.managercallMoving.bind( this ),
				managercallDeleting: this.managercallDeleting.bind( this ),
				managercallCroppingB: this.managercallCroppingB.bind( this ),
				managercallAttack: this.managercallAttack.bind( this ),
				managercallRelease: this.managercallRelease.bind( this ),
				mouseup: () => {
					if ( this._blcManager.__status === "cropping-b" ) {
						this._blcManager.__blcsEditing.forEach( blc => {
							blc._attack.style.maxWidth =
							blc._release.style.maxWidth = "";
						} );
					}
				},
			} );

		this.rootElement = root;
		this.timeline = blcManager.timeline;
		this._blcManager = blcManager;
		this._uiSliderGroup = root.querySelector( "gsui-slidergroup" );
		this._slidersSelect = root.querySelector( ".gsuiPianoroll-slidersSelect" );
		this._slidersSelect.onchange = this._onchangeSlidersSelect.bind( this );
		sideBottom.onresizing =
		gridBottom.onresizing = panel => {
			const topH = panel.previousElementSibling.style.height,
				bottomH = panel.style.height;

			if ( panel === gridBottom ) {
				sideTop.style.height = topH;
				sideBottom.style.height = bottomH;
			} else {
				gridTop.style.height = topH;
				gridBottom.style.height = bottomH;
			}
		};

		this.data = this._proxyCreate();
		this.uiKeys = new gsuiKeys();
		this._rowsByMidi = {};
		this._currKeyValue = {};
		this.empty();
		this._blcManager.__sideContent.append( this.uiKeys.rootElement );
		this._blcManager.__onclickMagnet();
		this._onchangeSlidersSelect();
		root.addEventListener( "gsuiEvents", e => {
			if ( e.detail.eventName === "change" ) {
				const arr = e.detail.args[ 0 ],
					nodeName = this._slidersSelect.value,
					obj = {};

				arr.forEach( ( [ id, val ] ) => {
					obj[ id ] = { [ nodeName ]: val };
					this.data[ id ][ nodeName ] = val;
				} );
				this.onchange( obj );
			}
			e.stopPropagation();
		} );
		this.setPxPerBeat( 64 );
	}

	empty() {
		Object.keys( this.data ).forEach( k => delete this.data[ k ] );
		this._idMax = 0;
		this.resetKey();
	}
	resetKey() {
		const k = this._currKeyValue;

		k.pan = 0;
		k.gain = .8;
		k.attack = .05;
		k.release = .05;
		k.lowpass = 1;
		k.highpass = 1;
		k.duration = 1;
	}
	resized() {
		this._blcManager.__resized();
		this._blcManager.__gridPanelResized();
	}
	attached() {
		this._uiSliderGroup.scrollElement.onscroll = this._onscrollSliderGroup.bind( this,
			this._uiSliderGroup.scrollElement, this._blcManager.__rowsContainer );
		this._blcManager.__attached();
		this.scrollToMiddle();
	}
	setPxPerBeat( px ) {
		if ( this._blcManager.setPxPerBeat( px ) ) {
			this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
		}
	}
	setFontSize( px ) {
		if ( this._blcManager.setFontSize( px ) ) {
			this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
		}
	}
	currentTime( t ) {
		this._blcManager.currentTime( t );
	}
	scrollToMiddle() {
		const rows = this._blcManager.__rowsContainer;

		rows.scrollTop = ( rows.scrollHeight - rows.clientHeight ) / 2;
	}
	scrollToKeys() {
		const rows = this._blcManager.__rowsContainer,
			smp = rows.querySelector( ".gsuiBlocksManager-block" );

		if ( smp ) {
			rows.scrollTop += smp.getBoundingClientRect().top -
				rows.getBoundingClientRect().top - 3.5 * this._blcManager.__fontSize;
		}
	}
	timeSignature( a, b ) {
		this._blcManager.timeSignature( a, b );
		this._uiSliderGroup.timeSignature( a, b );
	}
	getDuration() {
		return this._blcManager.getDuration();
	}
	octaves( from, nb ) {
		this.empty();
		Object.keys( this._rowsByMidi ).forEach( k => delete this._rowsByMidi[ k ] );

		const rows = this.uiKeys.octaves( from, nb );

		rows.forEach( el => {
			const midi = +el.dataset.midi;

			el.onmousedown = this._rowMousedown.bind( this, midi );
			el.firstElementChild.style.fontSize = `${ this._blcManager.__pxPerBeat }px`;
			this._rowsByMidi[ midi ] = el;
		} );
		this._blcManager.__rowsWrapinContainer.style.height = `${ rows.length }em`;
		this._blcManager.__rowsWrapinContainer.prepend( ...rows );
	}

	// Block's UI functions
	// ........................................................................
	_blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when": {
				el.style.left = `${ val }em`;
				this._uiSliderGroup.setProp( el.dataset.id, "when", val );
				this._blockRedrawDragline( el );
			} break;
			case "duration": {
				el.style.width = `${ val }em`;
				this._uiSliderGroup.setProp( el.dataset.id, "duration", val );
				this._currKeyValue.duration = val;
				this._blockRedrawDragline( el );
			} break;
			case "deleted": {
				el.classList.toggle( "gsuiBlocksManager-block-hidden", !!val );
			} break;
			case "selected": {
				el.classList.toggle( "gsuiBlocksManager-block-selected", !!val );
				this._uiSliderGroup.setProp( el.dataset.id, "selected", !!val );
			} break;
			case "row": {
				this._blockDOMChange( el, "key", this.data[ el.dataset.id ].key - val );
			} break;
			case "key": {
				const row = this._getRowByMidi( val );

				el.dataset.key = gsuiKeys.keyNames.en[ row.dataset.key ];
				row.firstElementChild.append( el );
				this._blockRedrawDragline( el );
			} break;
			case "attack": {
				el._attack.style.width = `${ val }em`;
				this._currKeyValue.attack = val;
			} break;
			case "release": {
				el._release.style.width = `${ val }em`;
				this._currKeyValue.release = val;
			} break;
			case "prev": {
				const blc = this._blcManager.__blcs.get( val );

				el.classList.toggle( "gsuiPianoroll-block-prevLinked", !!val );
				blc && blc._dragline.linkTo( el._draglineDrop );
			} break;
			case "next": {
				const blc = this._blcManager.__blcs.get( val );

				el.classList.toggle( "gsuiPianoroll-block-nextLinked", !!val );
				el._dragline.linkTo( blc && blc._draglineDrop );
			} break;
			case "pan": this._blockSliderUpdate( "pan", el, val ); break;
			case "gain": this._blockSliderUpdate( "gain", el, val ); break;
			case "lowpass": this._blockSliderUpdate( "lowpass", el, val ); break;
			case "highpass": this._blockSliderUpdate( "highpass", el, val ); break;
		}
	}
	_blockSliderUpdate( nodeName, el, val ) {
		if ( this._slidersSelect.value === nodeName ) {
			this._uiSliderGroup.setProp( el.dataset.id, "value", val );
			this._currKeyValue[ nodeName ] = val;
		}
	}
	_blockRedrawDragline( el ) {
		const key = this.data[ el.dataset.id ],
			blcPrev = this._blcManager.__blcs.get( key.prev );

		el._dragline.redraw();
		blcPrev && blcPrev._dragline.redraw();
	}

	// Private small getters
	// ........................................................................
	_getData() { return this.data; }
	_getRowByMidi( midi ) { return this._rowsByMidi[ midi ]; }

	// Mouse and keyboard events
	// ........................................................................
	_onscrollRows() {
		this._onscrollSliderGroup( this._blcManager.__rowsContainer, this._uiSliderGroup.scrollElement );
	}
	_loop( a, b ) { this._uiSliderGroup.loop( a, b ); }
	_currentTime( beat ) { this._uiSliderGroup.currentTime( beat ); }
	_setPxPerBeat( ppb ) { this._uiSliderGroup.setPxPerBeat( ppb ); }

	// ........................................................................
	_blcMousedown( id, e ) {
		const dline = e.currentTarget._dragline.rootElement;

		e.stopPropagation();
		if ( !dline.contains( e.target ) ) {
			this._blcManager.__mousedown( e );
			if ( this._blcManager.__status === "cropping-b" ) {
				this._blcManager.__blcsEditing.forEach( ( blc, id ) => {
					const { attack, release } = this.data[ id ],
						attRel = attack + release;

					blc._attack.style.maxWidth = `${ attack / attRel * 100 }%`;
					blc._release.style.maxWidth = `${ release / attRel * 100 }%`;
				} );
			}
		}
	}
	_rowMousedown( key, e ) {
		this._blcManager.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = this._idMax + 1,
				curr = this._currKeyValue,
				keyObj = {
					key,
					pan: curr.pan,
					gain: curr.gain,
					attack: curr.attack,
					release: curr.release,
					lowpass: curr.lowpass,
					highpass: curr.highpass,
					duration: curr.duration,
					selected: false,
					prev: null,
					next: null,
					when: this._blcManager.__roundBeat( this._blcManager.__getWhenByPageX( e.pageX ) ),
				};

			this.data[ id ] = keyObj;
			this.onchange( this._blcManager.__unselectBlocks( { [ id ]: keyObj } ) );
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
			nodeName = this._slidersSelect.value,
			slidGroup = this._uiSliderGroup;

		switch ( nodeName ) {
			case "pan":      slidGroup.minMaxStep( -1, 1, .02 ); break;
			case "gain":     slidGroup.minMaxStep(  0, 1, .01 ); break;
			case "lowpass":  slidGroup.minMaxStep(  0, 1, .01, 3 ); break;
			case "highpass": slidGroup.minMaxStep(  0, 1, .01, 3 ); break;
		}
		this._blcManager.__blcs.forEach( ( blc, id ) => {
			this._uiSliderGroup.setProp( id, "value", data[ id ][ nodeName ] );
		} );
	}

	// Key's functions
	// ........................................................................
	_deleteKey( id ) {
		const key = this.data[ id ],
			blc = this._blcManager.__blcs.get( id ),
			blcPrev = this._blcManager.__blcs.get( key.prev );

		blc.remove();
		if ( blcPrev ) {
			blcPrev._dragline.linkTo( null );
		}
		this._blcManager.__blcs.delete( id );
		this._blcManager.__blcsSelected.delete( id );
		this._uiSliderGroup.delete( id );
	}
	_setKey( id, obj ) {
		const blc = gsuiPianoroll.blockTemplate.cloneNode( true ),
			dragline = new gsuiDragline();

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		dragline.onchange = this._onchangeDragline.bind( this, id );
		blc._attack = blc.querySelector( ".gsuiPianoroll-block-attack" );
		blc._release = blc.querySelector( ".gsuiPianoroll-block-release" );
		blc._dragline = dragline;
		blc._draglineDrop = blc.querySelector( ".gsuiDragline-drop" );
		blc.append( dragline.rootElement );
		dragline.getDropAreas = this._getDropAreas.bind( this, id );
		this._blcManager.__blcs.set( id, blc );
		obj.selected
			? this._blcManager.__blcsSelected.set( id, blc )
			: this._blcManager.__blcsSelected.delete( id );
		this._uiSliderGroup.set( id, obj.when, obj.duration, obj[ this._slidersSelect.value ] );
		this._blockDOMChange( blc, "key", obj.key );
		this._blockDOMChange( blc, "when", obj.when );
		this._blockDOMChange( blc, "duration", obj.duration );
		this._blockDOMChange( blc, "selected", obj.selected );
		this._blockDOMChange( blc, "attack", obj.attack );
		this._blockDOMChange( blc, "release", obj.release );
		this._blockDOMChange( blc, "pan", obj.pan );
		this._blockDOMChange( blc, "gain", obj.gain );
		this._blockDOMChange( blc, "lowpass", obj.lowpass );
		this._blockDOMChange( blc, "highpass", obj.highpass );
		this._blockDOMChange( blc, "prev", obj.prev );
		this._blockDOMChange( blc, "next", obj.next );
	}
	_getDropAreas( id ) {
		const obj = this.data[ id ],
			when = obj.when + obj.duration,
			arr = [];

		this._blcManager.__blcs.forEach( ( blc, blcId ) => {
			const obj = this.data[ blcId ];

			if ( obj.when >= when && ( obj.prev === null || obj.prev === id ) ) {
				arr.push( blc.firstElementChild );
			}
		} );
		return arr;
	}
	_onchangeDragline( id, el, prevEl ) {
		const obj = {},
			dat = this.data,
			prevId = prevEl && prevEl.parentNode.dataset.id;

		if ( el ) {
			const tarId = el.parentNode.dataset.id;

			obj[ id ] = { next: tarId };
			dat[ id ].next = tarId;
			obj[ tarId ] = { prev: id };
			dat[ tarId ].prev = id;
			if ( prevEl ) {
				obj[ prevId ] = { prev: null };
				dat[ prevId ].prev = null;
			}
		} else {
			obj[ id ] = { next: null };
			obj[ prevId ] = { prev: null };
			dat[ id ].next =
			dat[ prevId ].prev = null;
		}
		this.onchange( obj );
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
			const prox = new Proxy( Object.seal( {
					key: 60,
					when: 0,
					pan: 0,
					gain: 1,
					attack: .05,
					release: .05,
					lowpass: 1,
					highpass: 1,
					duration: 1,
					selected: false,
					prev: null,
					next: null,
					...obj,
				} ), {
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
			console.warn( "gsuiPianoroll: proxy set useless 'offset' to key" );
		} else {
			const blc = this._blcManager.__blcs.get( id );

			tar[ prop ] = val;
			this._blockDOMChange( blc, prop, val );
			if ( prop === "selected" ) {
				val
					? this._blcManager.__blcsSelected.set( id, blc )
					: this._blcManager.__blcsSelected.delete( id );
			}
		}
		return true;
	}
}

gsuiPianoroll.template = document.querySelector( "#gsuiPianoroll-template" );
gsuiPianoroll.template.remove();
gsuiPianoroll.template.removeAttribute( "id" );

gsuiPianoroll.blockTemplate = document.querySelector( "#gsuiPianoroll-block-template" );
gsuiPianoroll.blockTemplate.remove();
gsuiPianoroll.blockTemplate.removeAttribute( "id" );
